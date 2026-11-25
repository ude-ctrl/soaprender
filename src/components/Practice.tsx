import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, Layers3, Zap } from 'lucide-react';
import type { Item } from '../content/catalog';
import { letters, type Letter } from '../content/schema';
import type { Rating } from '../engine/progress';
import { useStudy } from '../store/study';
import { Editorial, Media, Prose } from './Content';

const ratingLabels: Record<Rating, string> = { again: 'Errei', hard: 'Difícil', good: 'Bom', easy: 'Fácil' };
const arenaSeconds = 90;

export function Practice({ items, recovery = false, onExit }: {
  items: Item[]; recovery?: boolean; onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const arena = useStudy(state => state.progress.intensity === 'arena');
  const item = items[index];

  if (!item) return <section className="panel session-end">
    <CheckCircle2 size={30} />
    <h2>{items.length ? 'Sessão concluída' : 'Nenhum item disponível'}</h2>
    {items.length > 0 && <p>{items.length} itens praticados · {correct} respostas corretas ou recuperadas.</p>}
    <button className="primary" onClick={onExit}>Voltar</button>
  </section>;

  return <Prompt key={item.id} item={item} ordinal={index + 1} total={items.length}
    arena={arena} combo={combo} recovery={recovery}
    onGrade={success => {
      setCombo(value => success ? value + 1 : 0);
      if (success) setCorrect(value => value + 1);
    }}
    onNext={() => setIndex(value => value + 1)} />;
}

function Prompt({ item, ordinal, total, arena, combo, recovery, onGrade, onNext }: {
  item: Item; ordinal: number; total: number; arena: boolean; combo: number; recovery: boolean;
  onGrade: (success: boolean) => void; onNext: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState<Letter | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [confidence, setConfidence] = useState<'know' | 'think' | 'guess'>('think');
  const [seconds, setSeconds] = useState(arenaSeconds);
  const record = useStudy(state => state.record);
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const submitted = useRef(false);
  const isQuestion = item.kind === 'question';
  const timed = arena && isQuestion && rating === null;

  useEffect(() => { heading.current?.focus(); }, []);
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
    if (rating !== null) feedback.current?.focus();
  }, [rating]);

  function grade(result: Rating, choice?: Letter) {
    if (submitted.current) return;
    submitted.current = true;
    if (!record({ itemId: item.id, rating: result, at: Date.now(),
      wasRecovery: recovery, confidence: isQuestion ? confidence : undefined })) {
      submitted.current = false;
      return;
    }
    setRating(result);
    setAnswer(choice ?? null);
    onGrade(result !== 'again');
  }

  const successful = rating !== null && rating !== 'again';
  return <section className="panel practice">
    <div className="practice-meta">
      <span>{isQuestion ? 'Questão' : 'Flashcard'} {ordinal} / {total}</span>
      {arena && combo > 1 && <span className="xp"><Zap size={15} /> Combo ×{combo}</span>}
      {timed && <span><Clock3 size={15} /> {seconds}s</span>}
    </div>
    {timed && <div className="timer" aria-hidden="true">
      <motion.div initial={false} animate={{ scaleX: seconds / arenaSeconds }} transition={{ duration: reduced ? 0 : .2 }} />
    </div>}
    {timed && seconds === 0 && <p role="status">Tempo de treino encerrado. Você ainda pode responder.</p>}
    <Editorial status={item.unit.status} />
    <h2 ref={heading} tabIndex={-1} className="prompt-title">
      {isQuestion ? item.data.enunciado : item.data.frente}
    </h2>
    <Media url={item.data.mediaUrl} caption={item.data.mediaCaption} />
    {item.kind === 'question' ? <>
      <p className="muted">{item.data.origem === 'inedita_padrao_fcc' ? 'Questão inédita · padrão FCC' :
        `Origem: ${item.data.origem.replaceAll('_', ' ')}`} · {item.data.dificuldade}</p>
      <fieldset className="options" disabled={rating !== null}>
        <legend className="sr-only">Escolha uma alternativa</legend>
        {letters.map(letter => {
          const correctOption = rating !== null && letter === item.data.gabarito;
          const wrongOption = rating !== null && letter === answer && !correctOption;
          return <label className={`option ${correctOption ? 'correct' : wrongOption ? 'wrong' : ''}`} key={letter}>
            <input type="radio" name={item.id} value={letter} checked={answer === letter}
              onChange={() => setAnswer(letter)} />
            <span className="letter">{letter}</span><span>{item.data.alternativas[letter]}</span>
            {correctOption && <CheckCircle2 size={18} aria-label="Resposta correta" />}
            {wrongOption && <CircleAlert size={18} aria-label="Resposta incorreta" />}
          </label>;
        })}
      </fieldset>
      {rating === null && <div className="answer-controls">
        <label>Confiança
          <select value={confidence} onChange={event => setConfidence(event.target.value as typeof confidence)}>
            <option value="know">Sei</option><option value="think">Acho que sei</option><option value="guess">Chutei</option>
          </select>
        </label>
        <button className="primary" disabled={!answer} onClick={() => {
          if (answer) grade(answer === item.data.gabarito ? 'good' : 'again', answer);
        }}>Confirmar resposta</button>
      </div>}
      {rating !== null && <div className={`feedback ${successful ? 'correct' : 'wrong'}`} ref={feedback} tabIndex={-1}>
        <h3>{successful ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
          {successful ? 'Resposta correta' : 'Revise esta resposta'} · gabarito {item.data.gabarito}</h3>
        <Prose>{item.data.justificativa_gabarito}</Prose>
        <h4>Análise dos distratores</h4>
        <dl>{letters.filter(letter => letter !== item.data.gabarito).map(letter =>
          <div key={letter}><dt>Alternativa {letter}</dt><dd>{item.data.analise_distratores[letter]}</dd></div>)}</dl>
        <small>{item.data.referencia_prova}</small>
      </div>}
    </> : <>
      {!revealed && <div className="card-reveal">
        <p className="muted">Recupere a resposta de memória antes de conferir.</p>
        <button className="primary" onClick={() => setRevealed(true)}><Layers3 size={17} /> Revelar resposta</button>
      </div>}
      {revealed && <motion.div className="card-answer" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
        <Prose>{item.data.verso}</Prose>
        {rating === null && <div className="ratings" aria-label="Avalie sua recuperação">
          {Object.entries(ratingLabels).map(([value, label]) =>
            <button key={value} onClick={() => grade(value as Rating)}>{label}</button>)}
        </div>}
      </motion.div>}
      {rating && <div className="feedback" ref={feedback} tabIndex={-1}>
        {rating === 'again' ? 'Volta à revisão em 10 minutos.' : `Recuperação registrada · ${ratingLabels[rating]}.`}
      </div>}
    </>}
    {rating !== null && <div className="next-action"><button className="primary" onClick={onNext}>
      {ordinal === total ? 'Ver resultado' : 'Próximo item'} <ArrowRight size={17} />
    </button></div>}
  </section>;
}
