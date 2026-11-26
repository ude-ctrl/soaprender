import { ChevronRight } from 'lucide-react';
import { catalog } from '../content/catalog';
import { mastery, type Review } from '../engine/progress';
import { DisciplineList } from './StudyOverview';

export function StudyMap({ reviews, disciplineId, onDiscipline, onUnit }: {
  reviews: ReadonlyMap<string, Review>; disciplineId: string;
  onDiscipline: (id: string) => void; onUnit: (id: string) => void;
}) {
  const { disciplines, units } = catalog;
  const discipline = disciplines.find(item => item.disciplina_id === disciplineId) ?? disciplines[0];
  return <>
    <header className="page-heading"><p className="eyebrow">SEDUC–MA / FCC</p><h1>Trilha de estudos</h1>
      <p className="muted">{disciplines.length} disciplinas · {units.size} unidades do edital</p></header>
    <div className="trail-layout">
      <section><h2>Disciplinas</h2><DisciplineList reviews={reviews} selected={discipline.disciplina_id} onDiscipline={onDiscipline} /></section>
      <section aria-labelledby="trail-title">
        <div className="section-head units-head"><div><p className="eyebrow">{discipline.block}</p><h2 id="trail-title">{discipline.nome}</h2></div></div>
        <ol className="trail">
          {discipline.unidades.map((topic, index) => {
            const unit = units.get(topic.id);
            if (!unit) return null;
            return <li key={topic.id}>
              <span className="trail-index">{String(index + 1).padStart(2, '0')}</span>
              <button className="unit-link" onClick={() => onUnit(topic.id)}>
                <span className="unit-label"><strong>{topic.titulo}</strong>
                  <small>{unit.questoes.length} questões · {unit.flashcards.length} flashcards
                    {topic.status === 'em_auditoria' && ' · Em auditoria'}</small>
                </span>
                <span className="unit-score"><b>{mastery(unit, reviews)}%</b><small>domínio</small></span>
                <ChevronRight size={16} />
              </button>
            </li>;
          })}
        </ol>
      </section>
    </div>
  </>;
}
