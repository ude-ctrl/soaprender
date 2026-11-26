import { ArrowLeft, ArrowUpRight, Eye, FileText, Layers3, ListChecks, RotateCcw, Target, Type } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Item } from '../content/catalog';
import type { Unit } from '../content/schema';
import { resetUnit } from '../engine/progress';
import { useStudy } from '../store/study';
import { Editorial, Prose, Summary, Theory } from './Content';
import { useImmersion, usePreference } from './LayoutControls';
import { Confirm } from './Settings';

const textSizes = ['compact', 'standard', 'large'] as const;
const labels = ['Menor', 'Padrão', 'Maior'];

export function UnitPage({ unit, score, outlineHost, onBack, onPractice, immersive, onImmersion }: {
  unit: Unit; score: number; outlineHost: HTMLDivElement | null; onBack: () => void; onPractice: (kind: Item['kind']) => void;
  immersive: boolean; onImmersion: (active: boolean) => void;
}) {
  const [tab, setTab] = useState<'theory' | 'summary'>('theory');
  const [recallRevealed, setRecallRevealed] = useState(false);
  const [reset, setReset] = useState(false);
  const [outline, setOutline] = useState<{ id: string; label: string }[]>([]);
  const [activeSection, setActiveSection] = useState('');
  const [left, setLeft] = usePreference('reader-outline', true, [true, false]);
  const [right, setRight] = usePreference('reader-tools', true, [true, false]);
  const [size, setSize] = usePreference('reader-size', 'standard', textSizes);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1100px)').matches);
  const copy = useRef<HTMLDivElement>(null);
  const update = useStudy(state => state.update);
  const { area, button } = useImmersion(immersive, onImmersion);
  const keyConcept = unit.sintese_fcc.conceitos_nucleares[0];
  const recall = unit.flashcards[0];

  useLayoutEffect(() => {
    const query = window.matchMedia('(max-width: 1100px)');
    const sync = () => setCompact(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    const headings = copy.current?.querySelectorAll<HTMLHeadingElement>('.theory-body h2, .summary-body h2');
    setOutline(Array.from(headings ?? [], (heading, index) => {
      heading.id = `reader-${index + 1}`;
      heading.tabIndex = -1;
      return { id: heading.id, label: heading.textContent ?? '' };
    }));
  }, [tab, unit]);

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      const headings = copy.current?.querySelectorAll<HTMLHeadingElement>('h2[id]');
      const current = Array.from(headings ?? []).reverse().find(heading => heading.getBoundingClientRect().top <= 125)
        ?? headings?.[0];
      setActiveSection(current?.id ?? '');
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [tab, unit]);

  const [mobileLeft, setMobileLeft] = useState(false);
  const [mobileRight, setMobileRight] = useState(false);
  const showLeft = compact ? mobileLeft : left;
  const showRight = compact ? mobileRight : right;

  function switchTab(next: 'theory' | 'summary') {
    setTab(next);
    window.scrollTo(0, 0);
  }

  const contents = <ol>{outline.map(entry => <li key={entry.id}>
    <a href={`#${entry.id}`} aria-current={activeSection === entry.id ? 'location' : undefined} onClick={event => {
      const target = document.getElementById(entry.id);
      if (!target) return;
      event.preventDefault();
      if (compact) setMobileLeft(false);
      requestAnimationFrame(() => {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
      });
    }}><span className="outline-dot" aria-hidden="true" />{entry.label}</a>
  </li>)}</ol>;

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
    <label className="type-control"><span><Type size={16} /> Tamanho do texto</span>
      <select value={size} onChange={event => {
        const selected = textSizes.find(value => value === event.target.value);
        if (selected) setSize(selected);
      }}>{textSizes.map((value, index) => <option key={value} value={value}>{labels[index]}</option>)}</select>
    </label>
    <button className="danger reader-reset" onClick={() => setReset(true)}><RotateCcw size={16} /> Reset desta unidade</button>
  </>;

  const leftPanel = <ReaderPanel title="Sumário" open={showLeft} className="reader-outline" onToggle={() =>
    compact ? setMobileLeft(!mobileLeft) : setLeft(!left)}>
    <p className="outline-unit">{unit.titulo}</p>{contents}
  </ReaderPanel>;
  const inSidebar = !compact && outlineHost;

  return <div ref={area} className="reader">
    <div className="reader-toolbar">
      <button className="back" onClick={onBack}><ArrowLeft size={17} /> Trilha</button>
      <div className="reader-primary-tools">
        <button aria-pressed={tab === 'theory'} onClick={() => switchTab('theory')}>Teoria</button>
        <button aria-pressed={tab === 'summary'} onClick={() => switchTab('summary')}>Síntese</button>
      </div>
      <div className="immerse-control">{button}</div>
    </div>
    {inSidebar && createPortal(leftPanel, outlineHost)}
    <div className={`reader-layout ${inSidebar ? 'outline-in-sidebar' : showLeft ? 'with-outline' : ''} ${showRight ? 'with-tools' : ''}`}>
      {!inSidebar && leftPanel}
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
        <div ref={copy}>{tab === 'theory' ? <Theory unit={unit} /> : <Summary unit={unit} />}</div>
      </article>
    </div>
    {reset && <Confirm title="Zerar esta unidade?" action="Zerar unidade" onCancel={() => setReset(false)}
      onConfirm={() => update(progress => resetUnit(progress, unit.topico_id))}>
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
