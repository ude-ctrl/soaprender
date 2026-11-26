import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarClock, Check, CheckCircle2, CircleAlert, Clock3, Eye, Undo2, X, Zap } from 'lucide-react';
import type { Item } from '../content/catalog';
import { letters, type Letter } from '../content/schema';
import { day, ratings, schedule, type Rating, type Review, type StudyAttempt } from '../engine/progress';
import { useStudy } from '../store/study';
import { Editorial, Media, Prose } from './Content';
import { IconButton, useImmersion } from './LayoutControls';

const ratingLabels: Record<Rating, string> = { again: 'Errei', hard: 'Difícil', good: 'Bom', easy: 'Fácil' };
const difficultyLabels: Record<string, string> = { basica: 'básica', intermediaria: 'intermediária' };
const arenaSeconds = 90;

export function Practice({ items, reviews, recovery = false, onExit, immersive, onImmersion }: {
  items: Item[]; reviews: ReadonlyMap<string, Review>; recovery?: boolean; onExit: () => void;
  immersive: boolean; onImmersion: (active: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const arena = useStudy(state => state.progress.intensity === 'arena');
  const { area, button } = useImmersion(immersive, onImmersion);
  const item = items[index];

  if (!item) return <section className="panel session-end">
    <CheckCircle2 size={30} />
    <h2>{items.length ? 'Sessão concluída' : 'Nenhum item disponível'}</h2>
    {items.length > 0 && <p>{items.length} itens praticados · {correct} respostas corretas ou recuperadas.</p>}
    <button className="primary" onClick={onExit}>Voltar</button>
  </section>;

  return <div className="practice-shell" ref={area}>
    <Prompt key={item.id} item={item} ordinal={index + 1} total={items.length} immersionControl={button}
      previousReview={reviews.get(item.id)} arena={arena} combo={combo} recovery={recovery}
      onGrade={success => {
        setCombo(value => success ? value + 1 : 0);
        if (success) setCorrect(value => value + 1);
      }}
      onNext={() => {
        if (index + 1 >= items.length) onImmersion(false);
        setIndex(value => value + 1);
        window.scrollTo(0, 0);
      }} />
  </div>;
}

function intervalLabel(milliseconds: number) {
  const days = Math.ceil(milliseconds / day);
  if (milliseconds > day) return `em ${days} dias`;
  if (milliseconds === day) return 'em 1 dia';
  const minutes = Math.max(1, Math.ceil(milliseconds / 60_000));
  if (minutes < 60) return `em ${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  return `em ${hours} h`;
}

function Prompt({ item, ordinal, total, arena, combo, recovery, previousReview, immersionControl, onGrade, onNext }: {
  item: Item; ordinal: number; total: number; arena: boolean; combo: number; recovery: boolean;
  previousReview?: Review; immersionControl: ReactNode;
  onGrade: (success: boolean) => void; onNext: () => void;
}) {
  const [revealedAt, setRevealedAt] = useState<number>();
  const [answer, setAnswer] = useState<Letter | null>(null);
  const [excluded, setExcluded] = useState<readonly Letter[]>([]);
  const [result, setResult] = useState<StudyAttempt>();
  const [showFeedback, setShowFeedback] = useState(true);
  const [showReview, setShowReview] = useState(true);
  const [confidence, setConfidence] = useState<'know' | 'think' | 'guess'>('think');
  const [seconds, setSeconds] = useState(arenaSeconds);
  const record = useStudy(state => state.record);
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLButtonElement>(null);
  const revealed = useRef<HTMLDivElement>(null);
  const submitted = useRef(false);
  const isQuestion = item.kind === 'question';
  const timed = arena && isQuestion && !result;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!timed) return;
    const deadline = Date.now() + arenaSeconds * 1000;
    setSeconds(arenaSeconds);
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(left);
      if (!left) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [timed]);
  useEffect(() => {
    if (result) feedback.current?.focus();
  }, [result]);
  useEffect(() => { if (revealedAt !== undefined) revealed.current?.focus(); }, [revealedAt]);

  function attempt(rating: Rating, at: number): StudyAttempt {
    return { itemId: item.id, rating, at, wasRecovery: recovery, confidence: isQuestion ? confidence : undefined };
  }

  function grade(rating: Rating) {
    if (submitted.current) return;
    submitted.current = true;
    const next = attempt(rating, Date.now());
    if (!record(next)) { submitted.current = false; return; }
    setResult(next);
    onGrade(rating !== 'again');
  }

  const success = result && result.rating !== 'again';
  const nextButton = <div className="next-action"><button className="primary" onClick={onNext}>
    {ordinal === total ? 'Ver resultado' : 'Próximo item'} <ArrowRight size={17} />
  </button></div>;
  const hasAside = item.kind === 'question' ? Boolean(result) : Boolean(previousReview);

  return <>
    <header className="practice-toolbar">
      <div className="practice-meta">
        <span>{isQuestion ? 'Questão' : 'Flashcard'} {ordinal} de {total}</span>
        {arena && combo > 1 && <span className="xp"><Zap size={15} /> Combo ×{combo}</span>}
        {timed && <span><Clock3 size={15} /> {seconds}s</span>}
      </div>
      <div className="immerse-control">{immersionControl}</div>
    </header>
    <div className={`practice-layout ${hasAside ? 'practice-has-aside' : ''}`}>
      <section className={`practice ${isQuestion ? 'question-sheet' : 'flashcard-sheet'}`}>
        {timed && <div className="timer" aria-hidden="true">
          <motion.div initial={false} animate={{ scaleX: seconds / arenaSeconds }} transition={{ duration: reduced ? 0 : .2 }} />
        </div>}
        {timed && seconds === 0 && <p role="status">Tempo de treino encerrado. Você ainda pode responder.</p>}
        <div className="practice-context">
          {item.kind === 'question' && <p className="eyebrow">{item.data.origem === 'inedita_padrao_fcc' ? 'Questão inédita · padrão FCC' :
            `Origem: ${item.data.origem.replaceAll('_', ' ')}`} · {difficultyLabels[item.data.dificuldade] ?? item.data.dificuldade}</p>}
          <Editorial status={item.unit.status} />
        </div>
        <h1 ref={heading} tabIndex={-1} className="prompt-title">{isQuestion ? item.data.enunciado : item.data.frente}</h1>
        {(isQuestion || revealedAt !== undefined) && <Media url={item.data.mediaUrl} caption={item.data.mediaCaption} />}
        {item.kind === 'question' ? <>
          <fieldset className="options">
            <legend className="sr-only">Escolha uma alternativa</legend>
            {letters.map(letter => {
              const correct = Boolean(result) && letter === item.data.gabarito;
              const wrong = Boolean(result) && letter === answer && !correct;
              const eliminated = !result && excluded.includes(letter);
              return <div className={`option-row ${correct ? 'correct' : wrong ? 'wrong' : ''} ${eliminated ? 'eliminated' : ''}`} key={letter}>
                <label className="option">
                  <input type="radio" name={item.id} value={letter} checked={answer === letter}
                    disabled={Boolean(result) || eliminated} onChange={() => setAnswer(letter)} />
                  <span className="letter">{letter}</span><span className="option-text">{item.data.alternativas[letter]}</span>
                  {!result && answer === letter && <Check size={17} aria-hidden="true" />}
                  {correct && <CheckCircle2 size={18} aria-label="Resposta correta" />}
                  {wrong && <CircleAlert size={18} aria-label="Resposta incorreta" />}
                </label>
                {!result && <IconButton label={`${eliminated ? 'Restaurar' : 'Eliminar'} alternativa ${letter}`}
                  icon={eliminated ? Undo2 : X} onClick={() => {
                    if (eliminated) setExcluded(values => values.filter(value => value !== letter));
                    else {
                      setExcluded(values => [...values, letter]);
                      if (answer === letter) setAnswer(null);
                    }
                  }} />}
              </div>;
            })}
          </fieldset>
          {!result && <div className="answer-controls">
            <label>Confiança
              <select value={confidence} onChange={event => setConfidence(event.target.value as typeof confidence)}>
                <option value="know">Sei</option><option value="think">Acho que sei</option><option value="guess">Chutei</option>
              </select>
            </label>
            <button className="primary" disabled={!answer} onClick={() => {
              if (answer) grade(answer === item.data.gabarito ? 'good' : 'again');
            }}>Confirmar resposta <ArrowRight size={16} /></button>
          </div>}
        </> : <>
          {revealedAt === undefined && <div className="card-reveal">
            <button className="primary" onClick={() => setRevealedAt(Date.now())}><Eye size={18} /> Mostrar resposta</button>
          </div>}
          {revealedAt !== undefined && <motion.div ref={revealed} tabIndex={-1} className="card-answer"
            initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>Resposta</h2><Prose>{item.data.verso}</Prose>
            {!result && <>
              <h3>Como foi sua recuperação?</h3>
              <div className="ratings">
                {ratings.map(rating => {
                  const preview = schedule(previousReview, attempt(rating, revealedAt));
                  return <button key={rating} onClick={() => grade(rating)}>
                    <strong>{ratingLabels[rating]}</strong><small>{intervalLabel(preview.due - revealedAt)}</small>
                  </button>;
                })}
              </div>
            </>}
            {result && previousReview && <p role="status" className="review-result">
              <CalendarClock size={18} /> Próxima revisão {intervalLabel(previousReview.due - result.at)}.
            </p>}
          </motion.div>}
          {result && nextButton}
        </>}
      </section>
      {item.kind === 'question' && result && <aside className="practice-feedback" aria-label="Feedback da questão" data-result={success ? 'correct' : 'incorrect'}>
        <button ref={feedback} className="panel-toggle" aria-expanded={showFeedback}
          onClick={() => setShowFeedback(!showFeedback)}>{success ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
          <span>{success ? 'Resposta correta' : 'Revise esta resposta'}</span><span aria-hidden="true">{showFeedback ? '−' : '+'}</span>
        </button>
        {showFeedback && <div className="feedback-copy">
          <h2>Gabarito {item.data.gabarito}</h2><Prose>{item.data.justificativa_gabarito}</Prose>
          <h3>Análise dos distratores</h3>
          <dl>{letters.filter(letter => letter !== item.data.gabarito).map(letter =>
            <div key={letter}><dt>Alternativa {letter}</dt><dd>{item.data.analise_distratores[letter]}</dd></div>)}</dl>
          <small>{item.data.referencia_prova}</small>
        </div>}
        {nextButton}
      </aside>}
      {item.kind === 'card' && previousReview && <aside className="practice-review" aria-label="Agenda do flashcard">
        <button className="panel-toggle" aria-expanded={showReview} onClick={() => setShowReview(!showReview)}>
          <CalendarClock size={18} /><span>Agenda do flashcard</span><span aria-hidden="true">{showReview ? '−' : '+'}</span>
        </button>
        {showReview && <p>{previousReview.due <= Date.now() ? 'Revisão disponível.' :
          `Próxima revisão ${intervalLabel(previousReview.due - Date.now())}.`}</p>}
      </aside>}
    </div>
  </>;
}
