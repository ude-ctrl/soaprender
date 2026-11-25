import { ArrowLeft, BookOpen, Layers3, ListChecks, RotateCcw, StickyNote } from 'lucide-react';
import { useState } from 'react';
import type { Item } from '../content/catalog';
import type { Unit } from '../content/schema';
import { resetUnit } from '../engine/progress';
import { useStudy } from '../store/study';
import { Editorial, Summary, Theory } from './Content';
import { Confirm } from './Settings';

export function UnitPage({ unit, score, onBack, onPractice }: {
  unit: Unit; score: number; onBack: () => void; onPractice: (kind: Item['kind']) => void;
}) {
  const [tab, setTab] = useState<'theory' | 'summary'>('theory');
  const [reset, setReset] = useState(false);
  const update = useStudy(state => state.update);
  return <>
    <button className="back" onClick={onBack}><ArrowLeft size={17} /> Voltar à trilha</button>
    <header className="page-heading">
      <p className="eyebrow">{unit.topico_id}</p><h1>{unit.titulo}</h1>
      <Editorial status={unit.status} />
      <p className="muted">{unit.tempo_leitura_min} min de leitura · {score}% de domínio</p>
      <details><summary>Subtópicos do edital</summary><ul className="reference-list">
        {unit.edital_subtopicos.map(topic => <li key={topic}>{topic}</li>)}</ul></details>
    </header>
    <div className="actions unit-actions">
      <button aria-pressed={tab === 'theory'} onClick={() => setTab('theory')}><BookOpen size={17} /> Teoria</button>
      <button aria-pressed={tab === 'summary'} onClick={() => setTab('summary')}><StickyNote size={17} /> Síntese</button>
      <button onClick={() => onPractice('card')}><Layers3 size={17} /> Flashcards</button>
      <button onClick={() => onPractice('question')}><ListChecks size={17} /> Questões</button>
    </div>
    {tab === 'theory' ? <Theory unit={unit} /> : <Summary unit={unit} />}
    <button className="danger" onClick={() => setReset(true)}><RotateCcw size={16} /> Reset desta unidade</button>
    {reset && <Confirm title="Zerar esta unidade?" action="Zerar unidade" onCancel={() => setReset(false)}
      onConfirm={() => update(progress => resetUnit(progress, unit.topico_id))}>
      As tentativas e as revisões desta unidade serão apagadas. O domínio e o XP serão recalculados.
    </Confirm>}
  </>;
}
