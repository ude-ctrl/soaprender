import { ArrowDownRight, ArrowRight, BookOpen, ChevronRight, Compass, GraduationCap, MapPinned, Monitor, PenLine, Sigma } from 'lucide-react';
import { useState } from 'react';
import { catalog } from '../content/catalog';
import { mastery, type Review } from '../engine/progress';
import { ExamGuide } from './Content';

const icons = [BookOpen, Sigma, MapPinned, Monitor, Compass, PenLine];

export function StudyMap({ reviews, disciplineId, onDiscipline, onUnit, onReview, dueCount }: {
  reviews: ReadonlyMap<string, Review>; disciplineId: string;
  onDiscipline: (id: string) => void; onUnit: (id: string) => void; onReview: () => void; dueCount: number;
}) {
  const [guide, setGuide] = useState(false);
  const { disciplines, units } = catalog;
  const discipline = disciplines.find(item => item.disciplina_id === disciplineId) ?? disciplines[0];
  return <>
    <section className="hero">
      <div className="hero-lines" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow"><GraduationCap size={16} /> SEDUC–MA / FCC</p>
        <h1>Trilha de estudos</h1>
        <p>Professor de Geografia · Edital {catalog.bundle.edital.identificacao.edital_numero}</p>
        <div className="hero-actions">
          <button onClick={() => {
            const first = discipline.unidades.find(topic => {
              const unit = units.get(topic.id);
              return unit && mastery(unit, reviews) < 100;
            }) ?? discipline.unidades[0];
            if (first) onUnit(first.id);
          }}>Estudar unidade <ArrowRight size={17} /></button>
          <button className="light-outline" onClick={() => setGuide(value => !value)} aria-expanded={guide}>Edital e estratégia <ArrowDownRight size={17} /></button>
        </div>
      </div>
      <div className="hero-compass" aria-hidden="true"><Compass size={116} strokeWidth={.7} /></div>
    </section>
    {guide && <ExamGuide />}
    {dueCount > 0 && <button className="review-callout" onClick={onReview}>
      {dueCount} {dueCount === 1 ? 'revisão disponível' : 'revisões disponíveis'} <ChevronRight size={18} />
    </button>}
    <section className="map-section">
      <div className="section-head"><h2>Disciplinas</h2><span>{disciplines.length} áreas · {units.size} unidades</span></div>
      <div className="disciplines">
        {disciplines.map((item, index) => {
          const Icon = icons[index % icons.length];
          return <button key={item.disciplina_id} aria-pressed={item === discipline}
            onClick={() => onDiscipline(item.disciplina_id)}>
            <span className="disc-icon"><Icon size={19} /></span>
            <span><strong>{item.nome}</strong><small>{item.unidades.length} unidades</small></span>
            <ChevronRight size={16} className="disc-arrow" />
          </button>;
        })}
      </div>
    </section>
    <section className="map-section">
      <div className="section-head units-head"><div><p className="eyebrow">{discipline.block}</p><h2>{discipline.nome}</h2></div></div>
      <ol className="trail">
        {discipline.unidades.map((topic, index) => {
          const unit = units.get(topic.id);
          if (!unit) return null;
          const score = mastery(unit, reviews);
          return <li key={topic.id}>
            <span className="trail-index">{String(index + 1).padStart(2, '0')}</span>
            <button className="unit-link" onClick={() => onUnit(topic.id)}>
              <span className="unit-label"><strong>{topic.titulo}</strong>
                <small>{unit.questoes.length} questões · {unit.flashcards.length} flashcards
                  {topic.status === 'em_auditoria' && ' · Em auditoria'}</small>
              </span>
              <span className="unit-score"><b>{score}%</b><small>domínio</small></span>
              <ChevronRight size={16} />
            </button>
          </li>;
        })}
      </ol>
    </section>
  </>;
}
