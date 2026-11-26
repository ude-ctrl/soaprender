import { ArrowDownRight, ArrowRight, BookOpen, CalendarClock, ChartNoAxesCombined, Check, ChevronRight, CircleCheck, CircleX, Clock3, Compass, Layers3, ListChecks, MapPinned, Monitor, PenLine, Sigma, Target } from 'lucide-react';
import { Cartography } from './EditorialArt';
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
  return { answered: latest.size, correct, accuracy: latest.size >= 5 ? Math.round(100 * correct / latest.size) : null,
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
      const total = discipline.unidades.length;
      return <li key={discipline.disciplina_id}><button onClick={() => onDiscipline(discipline.disciplina_id)}
        aria-pressed={selected ? discipline.disciplina_id === selected : undefined}>
        <span className="disc-icon"><Icon size={24} /></span>
        <span className="discipline-info"><strong>{discipline.nome}</strong>
          <progress value={count} max={total} aria-hidden="true" /></span>
        <span className="discipline-count" title="Unidades com prática">{count}/{total}<span className="sr-only"> unidades com prática</span></span>
      </button></li>;
    })}
  </ul>;
}

export function StudyHome({ reviews, due, attempts, onUnit, onDiscipline, onReview, onPerformance, onMap }: {
  reviews: Reviews; due: Item[]; attempts: readonly StudyAttempt[];
  onUnit: (id: string) => void; onDiscipline: (id: string) => void;
  onReview: () => void; onPerformance: () => void; onMap: () => void;
}) {
  const recent = attempts.reduce<StudyAttempt | undefined>((last, item) => !last || item.at >= last.at ? item : last, undefined);
  const previous = recent && catalog.items.get(recent.itemId)?.unit;
  const ordered = priority.flatMap(discipline => discipline.unidades.map(topic => catalog.units.get(topic.id)!));
  const unfinished = previous && mastery(previous, reviews) < 100;
  const next = unfinished ? previous : ordered.find(unit => mastery(unit, reviews) < 100);
  const featured = due[0]?.unit ?? next;
  const titleSeparator = next?.titulo.indexOf(': ') ?? -1;
  const missionTitle = titleSeparator > 0 ? next?.titulo.slice(0, titleSeparator) : next?.titulo;
  const missionSubtitle = titleSeparator > 0 ? next?.titulo.slice(titleSeparator + 2) : undefined;
  const featuredDiscipline = priority.find(discipline => discipline.disciplina_id === featured?.disciplina_id);
  const visited = coverage(reviews);
  const scores = performance(reviews, attempts);
  const trailIndex = featured ? ordered.indexOf(featured) : 0;
  const trailStart = Math.min(Math.max(0, trailIndex - 2), Math.max(0, ordered.length - 6));
  const dueUnits = [...new Map(due.map(item => [item.unit.topico_id, item.unit])).values()];

  return <div className="home-grid">
    <div className="home-main">
      <header className="home-heading">
        <p className="eyebrow">Sua central de estudos</p>
        <h1>Seu plano de estudos</h1>
        <p>Professor de Geografia · SEDUC–MA / FCC</p>
      </header>
      <section className="mission">
        <Cartography />
        <div className="mission-copy">
          <p className="eyebrow"><Target size={23} />{due.length ? 'Revisão recomendada' : 'Próxima missão'}</p>
          <h2>{due.length ? 'Retome o que você estudou' : missionTitle ?? 'Mantenha o que aprendeu'}</h2>
          {!due.length && missionSubtitle && <p className="mission-subtitle">{missionSubtitle}</p>}
          <p>{due.length ? `${due.length} ${due.length === 1 ? 'item disponível' : 'itens disponíveis'} na sua agenda de revisão.` : next ?
            `${featuredDiscipline?.nome} · ${unfinished ? 'Última unidade praticada' : 'Prioridade pelo peso do edital'}` :
            'Todas as unidades têm evidência consolidada. Consulte sua agenda de revisão.'}</p>
          {featured && !due.length && <ul className="mission-facts">
            <li><Clock3 size={18} /> {featured.tempo_leitura_min} min</li>
            <li><ListChecks size={18} /> {featured.questoes.length} questões</li>
            <li><Layers3 size={18} /> {featured.flashcards.length} flashcards</li>
          </ul>}
          <div className="mission-actions">
            <button className="mission-action" onClick={() => due.length || !next ? onReview() : onUnit(next.topico_id)}>
              {due.length || !next ? 'Abrir revisões' : unfinished ? 'Continuar unidade' : 'Estudar unidade'} <ArrowRight size={17} />
            </button>
            <button className="mission-secondary" onClick={onMap}>Ver trilha <ArrowDownRight size={16} /></button>
          </div>
        </div>
      </section>
      <section className="home-trail" aria-label="Sua trilha no edital">
        <div className="section-head"><h2>Sua trilha no edital</h2>
          <span>{visited.size} de {catalog.units.size} unidades com prática</span></div>
        <ol className="trail-preview">
          {ordered.slice(trailStart, trailStart + 6).map(unit => {
            const practiced = visited.has(unit.topico_id);
            return <li key={unit.topico_id}>
              <button className={practiced ? 'practiced' : ''} aria-current={unit === featured ? 'step' : undefined}
                onClick={() => onUnit(unit.topico_id)} title={unit.titulo}>
                <span className="trail-dot">{practiced && <Check size={14} />}</span>
                <span className="trail-name">{unit.titulo}</span>
                {practiced && <span className="sr-only">Com prática registrada</span>}
              </button>
            </li>;
          })}
        </ol>
      </section>
      <section className="home-disciplines">
        <div className="section-head"><h2>Disciplinas da sua preparação</h2>
          <button className="text-button" onClick={onMap}>Ver todas as unidades <ArrowRight size={16} /></button>
        </div>
        <DisciplineList reviews={reviews} onDiscipline={onDiscipline} />
      </section>
    </div>
    <aside className="home-aside" aria-label="Progresso e agenda">
      <section>
        <div className="aside-title"><ChartNoAxesCombined size={24} /><h2>Seu desempenho</h2></div>
        <div className="score-display">
          <div className="score-ring">
            <svg viewBox="0 0 112 112" aria-hidden="true">
              <circle className="ring-track" cx="56" cy="56" r="49" />
              {scores.accuracy !== null && <circle className="ring-value" cx="56" cy="56" r="49" pathLength="100"
                strokeDasharray={`${scores.accuracy} 100`} />}
            </svg>
            <span><strong>{scores.accuracy === null ? '—' : `${scores.accuracy}%`}</strong><small>Taxa de acerto</small></span>
          </div>
          <dl className="score-stats">
            <div><ListChecks size={19} /><dt>Questões respondidas</dt><dd>{scores.answered}</dd></div>
            <div><CircleCheck size={19} /><dt>Acertos</dt><dd>{scores.correct}</dd></div>
            <div><CircleX size={19} /><dt>Erros</dt><dd>{scores.answered - scores.correct}</dd></div>
          </dl>
        </div>
        <p className="muted">{scores.accuracy === null ? 'Acurácia disponível após cinco questões distintas.' : 'Última resposta por questão.'}</p>
        <button className="text-button" onClick={onPerformance}>Ver desempenho <ArrowRight size={16} /></button>
      </section>
      <section>
        <div className="aside-title"><CalendarClock size={24} /><h2>Revisão espaçada</h2>
          {due.length > 0 && <span className="due-count">{due.length} {due.length === 1 ? 'item' : 'itens'}</span>}</div>
        {due.length ? <ul className="agenda-preview">{dueUnits.slice(0, 3).map(unit =>
          <li key={unit.topico_id}><span aria-hidden="true" />{unit.titulo}</li>)}</ul> :
          <p className="muted">Nenhuma revisão disponível.</p>}
        <button className="text-button" onClick={onReview}>Ver agenda <ArrowRight size={16} /></button>
      </section>
      <section>
        <div className="aside-title"><Target size={24} /><h2>Progresso no edital</h2></div>
        <div className="coverage-row"><span>Unidades com prática</span><strong>{visited.size}/{catalog.units.size}</strong></div>
        <progress value={visited.size} max={catalog.units.size} aria-label="Unidades com prática" />
        <div className="coverage-row"><span>Domínio estimado</span><strong>{scores.domain}%</strong></div>
        <progress value={scores.domain} max={100} aria-label="Domínio estimado" />
      </section>
    </aside>
  </div>;
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
