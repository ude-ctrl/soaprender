import { ArrowDownRight, ArrowRight, BookOpen, CalendarClock, ChartNoAxesCombined, ChevronRight, Compass, MapPinned, Monitor, PenLine, Sigma } from 'lucide-react';
import { catalog, type Item } from '../content/catalog';
import { mastery, type Review, type StudyAttempt } from '../engine/progress';

type Reviews = ReadonlyMap<string, Review>;
const icons = [BookOpen, Sigma, MapPinned, Monitor, Compass, PenLine];
const priority = [...catalog.disciplines].sort((a, b) => b.weight - a.weight);
const questionCount = catalog.bundle.resumo_cobertura.total_questoes;

function coverage(reviews: Reviews) {
  return new Set([...reviews.keys()].map(id => catalog.items.get(id)?.unit.topico_id));
}

function performance(reviews: Reviews, attempts: readonly StudyAttempt[]) {
  const latest = new Map<string, StudyAttempt>();
  for (const attempt of attempts) {
    if (catalog.items.get(attempt.itemId)?.kind !== 'question') continue;
    if ((latest.get(attempt.itemId)?.at ?? -1) <= attempt.at) latest.set(attempt.itemId, attempt);
  }
  const correct = [...latest.values()].filter(attempt => attempt.rating !== 'again').length;
  const evidence = [...latest.keys()].reduce((sum, id) => sum + (reviews.get(id)?.evidence ?? 0), 0);
  return { answered: latest.size, accuracy: latest.size >= 5 ? Math.round(100 * correct / latest.size) : null,
    domain: Math.round(100 * evidence / questionCount) };
}

export function DisciplineList({ reviews, selected, onDiscipline }: {
  reviews: Reviews; selected?: string; onDiscipline: (id: string) => void;
}) {
  const visited = coverage(reviews);
  return <ul className="discipline-list">
    {priority.map(discipline => {
      const Icon = icons[catalog.disciplines.indexOf(discipline)];
      const count = discipline.unidades.filter(topic => visited.has(topic.id)).length;
      return <li key={discipline.disciplina_id}><button onClick={() => onDiscipline(discipline.disciplina_id)}
        aria-pressed={selected ? discipline.disciplina_id === selected : undefined}>
        <span className="disc-icon"><Icon size={21} /></span>
        <span><strong>{discipline.nome}</strong><small>{discipline.unidades.length} unidades
          {count > 0 && ` · ${count} com prática`}</small></span>
        <ChevronRight size={16} className="disc-arrow" />
      </button></li>;
    })}
  </ul>;
}

function Cartography() {
  return <svg className="mission-art" viewBox="0 0 330 260" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth=".8">
      <path opacity=".32" d="M1 207h328M1 53h328M46 1v258m239-258v258M1 130h328M165 1v258" strokeDasharray="3 5" />
      <circle cx="165" cy="130" r="119" opacity=".33" /><circle cx="165" cy="130" r="98" />
      <ellipse cx="165" cy="130" rx="70" ry="98" /><ellipse cx="165" cy="130" rx="31" ry="98" />
      <ellipse cx="165" cy="130" rx="98" ry="65" transform="rotate(-23 165 130)" />
      <ellipse cx="165" cy="130" rx="98" ry="32" transform="rotate(-23 165 130)" />
      <path d="m125 150 55-74 1 52 45 26-101-4Z" fill="currentColor" fillOpacity=".13" />
      <path d="M125 150l56-22 14-15" />
      <path d="M35 45h22m-11-11v22m230 151h20m-10-10v20" />
    </g>
    <circle cx="181" cy="128" r="4" fill="var(--mission-gold)" />
    <circle cx="125" cy="150" r="3" fill="currentColor" />
  </svg>;
}

export function StudyHome({ reviews, due, attempts, onUnit, onDiscipline, onReview, onPerformance, onExam }: {
  reviews: Reviews; due: Item[]; attempts: readonly StudyAttempt[];
  onUnit: (id: string) => void; onDiscipline: (id: string) => void;
  onReview: () => void; onPerformance: () => void; onExam: () => void;
}) {
  const recent = attempts.reduce<StudyAttempt | undefined>((last, item) => !last || item.at >= last.at ? item : last, undefined);
  const previous = recent && catalog.items.get(recent.itemId)?.unit;
  const ordered = priority.flatMap(discipline => discipline.unidades.map(topic => catalog.units.get(topic.id)!));
  const unfinished = previous && mastery(previous, reviews) < 100;
  const next = unfinished ? previous : ordered.find(unit => mastery(unit, reviews) < 100);
  const count = coverage(reviews).size;
  const scores = performance(reviews, attempts);
  return <>
    <header className="home-heading">
      <p className="eyebrow">SEDUC–MA <span> / </span> FCC</p>
      <h1>Seu plano de estudos</h1>
      <p>Professor de Geografia <span>·</span> Edital {catalog.bundle.edital.identificacao.edital_numero}</p>
    </header>
    <div className="home-grid">
      <div className="home-main">
        <section className="mission">
          <Cartography />
          <div className="mission-copy">
            <p className="eyebrow">{due.length ? 'Revisão recomendada' : 'Missão recomendada'}</p>
            <h2>{due.length ? 'Retome o que você estudou' : next?.titulo ?? 'Mantenha o que aprendeu'}</h2>
            <p>{due.length ? `${due.length} ${due.length === 1 ? 'item disponível' : 'itens disponíveis'} na sua agenda de revisão.` : next ?
              `${unfinished ? 'Continue a última unidade praticada.' : 'Próxima unidade na ordem de peso do edital.'} · ${next.tempo_leitura_min} min de leitura` :
              'Todas as unidades têm evidência consolidada. Consulte sua agenda de revisão.'}</p>
            <button className="mission-action" onClick={() => due.length || !next ? onReview() : onUnit(next.topico_id)}>
              {due.length || !next ? 'Abrir revisões' : unfinished ? 'Continuar unidade' : 'Estudar unidade'} <ArrowRight size={17} />
            </button>
          </div>
        </section>
        <section className="home-disciplines">
          <div className="section-head"><h2>Disciplinas</h2><span>{catalog.disciplines.length} áreas · {catalog.units.size} unidades</span></div>
          <DisciplineList reviews={reviews} onDiscipline={onDiscipline} />
        </section>
      </div>
      <aside className="home-aside" aria-label="Progresso e agenda">
        <section>
          <h2>Progresso de estudo</h2>
          <p className="metric">{count}<small> / {catalog.units.size}</small></p>
          <progress value={count} max={catalog.units.size} aria-label="Unidades com prática" />
          <p className="muted">Unidades com pelo menos uma prática registrada.</p>
        </section>
        <section>
          <div className="aside-title"><CalendarClock size={20} /><h2>Revisões</h2></div>
          <p>{due.length ? `${due.length} ${due.length === 1 ? 'item disponível' : 'itens disponíveis'}` : 'Nenhuma revisão disponível.'}</p>
          <button className="text-button" onClick={onReview}>Ver agenda <ArrowDownRight size={16} /></button>
        </section>
        <section>
          <div className="aside-title"><ChartNoAxesCombined size={20} /><h2>Desempenho</h2></div>
          <p>{scores.accuracy === null ? 'Acurácia disponível após responder cinco questões diferentes.' :
            `${scores.accuracy}% de acertos nas últimas respostas de ${scores.answered} questões distintas.`}</p>
          <p className="domain-metric"><strong>{scores.domain}%</strong> de domínio estimado</p>
          <button className="text-button" onClick={onPerformance}>Ver evidências <ArrowDownRight size={16} /></button>
        </section>
        <button className="text-button exam-link" onClick={onExam}>Edital e estratégia <ArrowDownRight size={16} /></button>
      </aside>
    </div>
  </>;
}

export function PerformancePage({ reviews, attempts, onDiscipline }: {
  reviews: Reviews; attempts: readonly StudyAttempt[]; onDiscipline: (id: string) => void;
}) {
  const scores = performance(reviews, attempts);
  return <div className="standard-page">
    <header className="page-heading"><h1>Desempenho</h1>
      <p className="muted">Acompanhe cobertura, acurácia e evidências de domínio.</p></header>
    <dl className="performance-metrics">
      <div><dt>Unidades praticadas</dt><dd>{coverage(reviews).size} / {catalog.units.size}</dd></div>
      <div><dt>Questões respondidas</dt><dd>{scores.answered} / {questionCount}</dd></div>
      <div><dt>Domínio estimado</dt><dd>{scores.domain}%</dd></div>
      <div><dt>Acurácia</dt><dd>{scores.accuracy === null ? 'Amostra insuficiente' : `${scores.accuracy}%`}</dd></div>
    </dl>
    <p className="muted metric-note">Acurácia usa a última resposta de cada questão, a partir de cinco questões distintas. O domínio considera as evidências de todas as questões da trilha.</p>
    <h2>Evidências por disciplina</h2>
    <ul className="performance-list">{priority.map(discipline => {
      const questions = discipline.unidades.flatMap(topic => catalog.units.get(topic.id)?.questoes ?? []);
      const evidence = questions.reduce((sum, item) => sum + (reviews.get(item.questao_id)?.evidence ?? 0), 0);
      return <li key={discipline.disciplina_id}>
        <button onClick={() => onDiscipline(discipline.disciplina_id)}>
          <strong>{discipline.nome}</strong><span>{questions.length ? Math.round(100 * evidence / questions.length) : 0}%</span><ChevronRight size={16} />
        </button>
      </li>;
    })}</ul>
  </div>;
}
