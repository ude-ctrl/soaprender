import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CircleAlert } from 'lucide-react';
import { catalog } from '../content/catalog';
import type { Unit } from '../content/schema';

export function safeUrl(url?: string) {
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

export function Prose({ children }: { children: string }) {
  return <div className="prose"><Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown></div>;
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

export function Theory({ unit }: { unit: Unit }) {
  return <article className="panel"><Prose>{unit.teoria_md}</Prose>
    <h2>Referências da unidade</h2>
    <ul className="reference-list">{unit.fontes_primarias.map((source, index) => {
      const url = safeUrl(source.url);
      return <li key={index}>{url ? <a href={url}>{source.referencia_abnt}</a> : source.referencia_abnt}</li>;
    })}</ul>
  </article>;
}

export function Summary({ unit }: { unit: Unit }) {
  const summary = unit.sintese_fcc;
  const columns = [...new Set(summary.quadro_comparativo.flatMap(Object.keys))];
  return <article className="panel prose">
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
    <h2>Edital e estratégia</h2>
    <p><a href={safeUrl(exam.site_oficial)}>Edital {exam.edital_numero} · {exam.banca_organizadora}</a></p>
    <p><strong>{strategy.formula}</strong></p><p>{strategy.conclusao_objetiva}</p>
    <ul>{bundle.edital.blocos.map(block => <li key={block.bloco_id}>{block.nome} · {block.questoes_bloco} {block.questoes_bloco === 1 ? 'item' : 'itens'} · peso {block.peso_bloco}</li>)}</ul>
    <h2>Perfil FCC</h2>
    {Object.entries(bundle.perfil_banca_fcc.anatomia_questoes_objetivas).map(([key, value]) =>
      <div key={key}><h3>{key.replaceAll('_', ' ')}</h3>
        {Array.isArray(value) ? <ul>{value.map((entry, i) => <li key={i}>{String(entry)}</li>)}</ul> :
          typeof value === 'string' ? <p>{value}</p> : null}
      </div>)}
    <details><summary>Referências do perfil</summary><ul>{bundle.perfil_banca_fcc.fontes_verificadas.map(source =>
      <li key={source.titulo}><a href={safeUrl(source.url)}>{source.titulo}</a></li>)}</ul></details>
  </section>;
}
