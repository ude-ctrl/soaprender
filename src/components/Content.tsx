import type { ReactNode } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CircleAlert } from 'lucide-react';
import { catalog } from '../content/catalog';
import type { Unit } from '../content/schema';
import { GisDiagram } from './GisDiagram';

export function safeUrl(url?: string) {
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

const scrollableTable: Components['table'] = ({ node: _node, ...props }) =>
  <div className="table-scroll" role="region" aria-label="Tabela com rolagem horizontal" tabIndex={0}><table {...props} /></div>;

export function Prose({ children, components }: { children: string; components?: Components }) {
  return <div className="prose"><Markdown remarkPlugins={[remarkGfm]} components={{ table: scrollableTable, ...components }}>{children}</Markdown></div>;
}

export function Editorial({ status }: { status: string }) {
  return <p className="editorial"><CircleAlert size={16} aria-hidden="true" />
    {status === 'em_auditoria' ? 'Em auditoria editorial' : `Estado editorial: ${status.replaceAll('_', ' ')}`}
  </p>;
}

export function Media({ url, caption }: { url?: string; caption?: string }) {
  const src = safeUrl(url);
  return src ? <figure><img src={src} alt={caption ?? ''} loading="lazy" />
    {caption && <figcaption>{caption}</figcaption>}</figure> : null;
}

const theoryHeadings: Components = { h1: ({ node: _node, ...props }) => <h2 {...props} /> };

function illustratedHeadings(illustrations: readonly (readonly [string, () => ReactNode])[]): Components {
  return {
    h1: ({ node, children, ...props }) => <>
      <h2 {...props}>{children}</h2>
      {illustrations.map(([matching, Diagram]) =>
        node?.children.some(child => child.type === 'text' && child.value.includes(matching)) && <Diagram key={matching} />)}
    </>,
  };
}

const annotated = new Map([
  ['CE-GEO-01', illustratedHeadings([['Cinco Categorias Estruturantes', SpaceDiagram]])],
  ['CE-GEO-02', illustratedHeadings([['Escalas Cartográficas', ScaleDiagram], ['Cartografia Temática e Geotecnologias', GisDiagram]])],
]);

export function Theory({ unit }: { unit: Unit }) {
  const markdown = unit.teoria_md.replace(/^---\r?\n(?=topico_id:)[\s\S]*?\r?\n---\r?\n/, '');
  return <section className="theory-body"><Prose components={annotated.get(unit.topico_id) ?? theoryHeadings}>
    {markdown}
  </Prose>
    <h2>Referências da unidade</h2>
    <ul className="reference-list">{unit.fontes_primarias.map((source, index) => {
      const url = safeUrl(source.url);
      return <li key={index}>{url ? <a href={url}>{source.referencia_abnt}</a> : source.referencia_abnt}</li>;
    })}</ul>
  </section>;
}

function SpaceDiagram() {
  return <figure className="concept-diagram">
    <svg viewBox="0 0 536 180" role="img" aria-labelledby="space-diagram-title space-diagram-desc">
      <title id="space-diagram-title">Espaço geográfico em Milton Santos</title>
      <desc id="space-diagram-desc">Sistemas de objetos e sistemas de ações formam um conjunto indissociável.</desc>
      <rect x="103" y="17" width="330" height="51" rx="6" className="diagram-root" />
      <path d="M268 68v38m-140 14v-14h280v14" className="diagram-line" />
      <rect x="8" y="120" width="240" height="51" rx="6" className="diagram-node" />
      <rect x="288" y="120" width="240" height="51" rx="6" className="diagram-node" />
      <text x="268" y="48" className="diagram-root-label">Espaço geográfico</text>
      <text x="128" y="151">Sistemas de objetos</text><text x="408" y="151">Sistemas de ações</text>
    </svg>
    <figcaption>Em Milton Santos, os sistemas de objetos e de ações constituem um conjunto indissociável.</figcaption>
  </figure>;
}

function ScaleDiagram() {
  return <figure className="concept-diagram">
    <svg viewBox="0 0 536 168" role="img" aria-labelledby="scale-diagram-title scale-diagram-desc">
      <title id="scale-diagram-title">Comparação de escalas cartográficas</title>
      <desc id="scale-diagram-desc">Em 1 para 10 mil, um centímetro no mapa representa 100 metros. Em 1 para 1 milhão, o mesmo centímetro representa 10 quilômetros.</desc>
      <rect x="8" y="8" width="252" height="152" rx="6" className="diagram-node" />
      <rect x="276" y="8" width="252" height="152" rx="6" className="diagram-node" />
      <text x="134" y="43">1 : 10.000</text><text x="402" y="43">1 : 1.000.000</text>
      <path d="M76 61v18m0-9h116m0-9v18M344 61v18m0-9h116m0-9v18" className="diagram-line" />
      <text x="134" y="104">1 cm → 100 m</text><text x="402" y="104">1 cm → 10 km</text>
      <text x="134" y="137">Maior escala</text><text x="402" y="137">Menor escala</text>
    </svg>
    <figcaption>Para a mesma medida no mapa, um denominador menor representa uma distância menor no terreno.</figcaption>
  </figure>;
}

export function Summary({ unit }: { unit: Unit }) {
  const summary = unit.sintese_fcc;
  const columns = [...new Set(summary.quadro_comparativo.flatMap(Object.keys))];
  return <article className="summary-body prose">
    <h2>Conceitos nucleares</h2>
    <dl>{summary.conceitos_nucleares.map(item => <div key={item.termo}>
      <dt>{item.termo}</dt><dd>{item.definicao_precisa}<small>{item.fonte}</small></dd>
    </div>)}</dl>
    {columns.length > 0 && <>
      <h2>Quadro comparativo</h2>
      <div className="table-scroll" tabIndex={0}><table>
        <thead><tr>{columns.map(key => <th scope="col" key={key}>{key.replaceAll('_', ' ')}</th>)}</tr></thead>
        <tbody>{summary.quadro_comparativo.map((row, index) =>
          <tr key={index}>{columns.map(key => <td key={key}>{row[key] ?? '–'}</td>)}</tr>)}</tbody>
      </table></div>
    </>}
    <h2>Pegadinhas no padrão FCC</h2>
    {summary.pegadinhas_fcc.map(item => <details key={item.armadilha}>
      <summary>{item.armadilha}</summary><p>{item.como_a_fcc_cobra}</p><p>{item.como_desarmar}</p>
    </details>)}
    <h2>Checklist de revisão</h2><ul>{summary.checklist_revisao.map(item => <li key={item}>{item}</li>)}</ul>
  </article>;
}

export function ExamGuide() {
  const { bundle } = catalog;
  const exam = bundle.edital.identificacao;
  const strategy = bundle.matriz_pesos_estrategia.matematica_objetiva;
  return <section className="panel prose">
    <h2>Prova e pesos</h2>
    <p><a href={safeUrl(exam.site_oficial)}>Edital {exam.edital_numero} · {exam.banca_organizadora}</a></p>
    <p><strong>{strategy.formula}</strong></p><p>{strategy.conclusao_objetiva}</p>
    <ul>{bundle.edital.blocos.map(block => <li key={block.bloco_id}>{block.nome} · {block.questoes_bloco} {block.questoes_bloco === 1 ? 'item' : 'itens'} · peso {block.peso_bloco}</li>)}</ul>
    <h2>Perfil FCC</h2>
    {Object.entries(bundle.perfil_banca_fcc.anatomia_questoes_objetivas).map(([key, value]) =>
      <div key={key}><h3>{key.replaceAll('_', ' ')}</h3>
        {Array.isArray(value) ? <dl>{value.map((entry, index) => {
          if (typeof entry === 'string') return <div key={index}><dt>{entry}</dt></div>;
          if (!entry || typeof entry !== 'object' || typeof entry.tipo !== 'string') return null;
          return <div key={entry.tipo}><dt>{entry.tipo}</dt>
            <dd>{typeof entry.mecanismo === 'string' && <p>{entry.mecanismo}</p>}
              {typeof entry.antidoto === 'string' && <p><strong>Como revisar</strong> · {entry.antidoto}</p>}</dd></div>;
        })}</dl> :
          typeof value === 'string' ? <p>{value}</p> : null}
      </div>)}
    <details><summary>Referências do perfil</summary><ul>{bundle.perfil_banca_fcc.fontes_verificadas.map(source =>
      <li key={source.titulo}><a href={safeUrl(source.url)}>{source.titulo}</a></li>)}</ul></details>
  </section>;
}
