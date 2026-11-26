import { ArrowLeft, ArrowUpRight, Eye, FileText, Layers3, ListChecks, RotateCcw, Target, Type } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLayoutEffect, useState, type ReactNode } from 'react';
import type { Item } from '../content/catalog';
import type { Unit } from '../content/schema';
import { useStudy } from '../store/study';
import { Editorial, Prose, Summary, Theory } from './Content';
import { useImmersion, usePreference } from './LayoutControls';
import { Confirm } from './Settings';

const textSizes = ['compact', 'standard', 'large'] as const;
const labels = ['Menor', 'Padrão', 'Maior'];

export function UnitPage({ unit, score, settingsHost, onBack, onPractice, immersive, onImmersion }: {
  unit: Unit; score: number; settingsHost: HTMLDivElement | null; onBack: () => void; onPractice: (kind: Item['kind']) => void;
  immersive: boolean; onImmersion: (active: boolean) => void;
}) {
  const [tab, setTab] = useState<'theory' | 'summary'>('theory');
  const [recallRevealed, setRecallRevealed] = useState(false);
  const [reset, setReset] = useState(false);
  const [right, setRight] = usePreference('reader-tools', true, [true, false]);
  const [size, setSize] = usePreference('reader-size', 'standard', textSizes);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1040px)').matches);
  const resetProgress = useStudy(state => state.reset);
  const { area, button } = useImmersion(immersive, onImmersion);
  const keyConcept = unit.sintese_fcc.conceitos_nucleares[0];
  const recall = unit.flashcards[0];

  useLayoutEffect(() => {
    const query = window.matchMedia('(max-width: 1040px)');
    const sync = () => setCompact(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const [mobileRight, setMobileRight] = useState(false);
  const showRight = compact ? mobileRight : right;

  function switchTab(next: 'theory' | 'summary') {
    setTab(next);
    window.scrollTo(0, 0);
  }

  const tools = <>
    <div className="reader-links">
      <button onClick={() => onPractice('card')}><Layers3 size={17} /> Flashcards <ArrowUpRight size={14} /></button>
      <button onClick={() => onPractice('question')}><ListChecks size={17} /> Questões <ArrowUpRight size={14} /></button>
    </div>
    <section className="reader-note"><h3><FileText size={19} /> Mapa da unidade</h3>
      <ul>{unit.edital_subtopicos.map(topic => <li key={topic}>{topic}</li>)}</ul>
    </section>
    {keyConcept && <div className="concept-note"><h3><Target size={20} /> Conceito-chave</h3><strong>{keyConcept.termo}</strong>
      <p>{keyConcept.definicao_precisa}</p></div>}
    {recall && <section className="reader-recall">
      <h3><Layers3 size={20} /> Fixe o conteúdo</h3>
      <div className="recall-card">
        <p>{recall.frente}</p>
        {recallRevealed && <Prose>{recall.verso}</Prose>}
        <button aria-expanded={recallRevealed} onClick={() => setRecallRevealed(!recallRevealed)}>
          <Eye size={18} /> {recallRevealed ? 'Ocultar resposta' : 'Ver resposta'}
        </button>
      </div>
    </section>}
  </>;

  const settings = <>
    <label className="type-control"><span><Type size={16} /> Tamanho do texto</span>
      <select value={size} onChange={event => {
        const selected = textSizes.find(value => value === event.target.value);
        if (selected) setSize(selected);
      }}>{textSizes.map((value, index) => <option key={value} value={value}>{labels[index]}</option>)}</select>
    </label>
    <button className="danger reader-reset" onClick={() => setReset(true)}><RotateCcw size={16} /> Reset desta unidade</button>
  </>;

  return <div ref={area} className="reader">
    <div className="reader-toolbar">
      <button className="back" onClick={onBack}><ArrowLeft size={17} /> Trilha</button>
      <div className="reader-primary-tools">
        <button aria-pressed={tab === 'theory'} onClick={() => switchTab('theory')}>Teoria</button>
        <button aria-pressed={tab === 'summary'} onClick={() => switchTab('summary')}>Síntese</button>
      </div>
      <div className="immerse-control">{button}</div>
    </div>
    {settingsHost && createPortal(<section className="reader-settings" aria-label="Ajustes de leitura">
      <h2>Ajustes de leitura</h2>
      {settings}
    </section>, settingsHost)}
    <details className="mobile-reader-settings">
      <summary>Ajustes de leitura</summary>
      {settings}
    </details>
    <div className={`reader-layout ${showRight ? 'with-tools' : ''}`}>
      <ReaderPanel title="Ferramentas" open={showRight} className="reader-tools" onToggle={() =>
        compact ? setMobileRight(!mobileRight) : setRight(!right)}>{tools}</ReaderPanel>
      <article className={`reader-copy type-${size}`}>
        <header className="page-heading reader-heading">
          <p className="eyebrow">{unit.topico_id} <span>·</span> {unit.tempo_leitura_min} min de leitura</p>
          <h1>{unit.titulo}</h1>
          <Editorial status={unit.status} />
          <p className="muted reader-domain">{score}% de domínio estimado</p>
          <details className="reader-subtopics"><summary>Subtópicos do edital</summary><ul className="reference-list">
            {unit.edital_subtopicos.map(topic => <li key={topic}>{topic}</li>)}</ul></details>
        </header>
        <div>{tab === 'theory' ? <Theory unit={unit} /> : <Summary unit={unit} />}</div>
      </article>
    </div>
    {reset && <Confirm title="Zerar esta unidade?" action="Zerar unidade" onCancel={() => setReset(false)}
      onConfirm={() => resetProgress(unit.topico_id)}>
      As tentativas e as revisões desta unidade serão apagadas. O domínio e o XP serão recalculados.
    </Confirm>}
  </div>;
}

function ReaderPanel({ title, open, onToggle, className, children }: {
  title: string; open: boolean; onToggle: () => void; className: string; children: ReactNode;
}) {
  return <aside className={`reader-panel ${className}`} aria-label={title}>
    <button className="panel-toggle" aria-expanded={open} onClick={onToggle}>{title}<span aria-hidden="true">{open ? '−' : '+'}</span></button>
    {open && <div className="reader-panel-content">{children}</div>}
  </aside>;
}
