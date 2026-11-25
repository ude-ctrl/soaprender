import { ArrowRight, BookX, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { catalog, type Item } from '../content/catalog';
import type { Review } from '../engine/progress';

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function ReviewPage({ due, reviews, onPractice }: {
  due: Item[]; reviews: ReadonlyMap<string, Review>; onPractice: (items: Item[]) => void;
}) {
  const [tab, setTab] = useState<'due' | 'errors'>('due');
  const errors = [...catalog.items.values()].filter(item => reviews.get(item.id)?.error);
  const items = tab === 'due' ? due : errors;
  const future = [...reviews.values()].map(review => review.due).filter(dueAt => dueAt > Date.now()).sort((a, b) => a - b)[0];

  return <>
    <header className="page-heading"><h1>Revisões</h1>
      <p className="muted">Recupere o conteúdo no intervalo programado e retome os itens que errou.</p></header>
    <div className="actions unit-actions">
      <button aria-pressed={tab === 'due'} onClick={() => setTab('due')}><CalendarClock size={17} /> Hoje ({due.length})</button>
      <button aria-pressed={tab === 'errors'} onClick={() => setTab('errors')}><BookX size={17} /> Caderno de erros ({errors.length})</button>
    </div>
    {items.length ? <section className="panel review-list">
      <button className="primary" onClick={() => onPractice(items.slice(0, 15))}>
        {tab === 'due' ? 'Iniciar revisão' : 'Refazer erros'} <ArrowRight size={17} />
      </button>
      <ul>{items.map(item => <li key={item.id}>
        <button onClick={() => onPractice([item])}>
          <span><small>{item.unit.titulo} · {item.kind === 'question' ? 'Questão' : 'Flashcard'}</small>
            {item.kind === 'question' ? item.data.enunciado : item.data.frente}</span><ArrowRight size={16} />
        </button>
      </li>)}</ul>
    </section> : <section className="panel empty">
      <h2>{tab === 'due' ? 'Nenhuma revisão disponível' : 'Caderno de erros vazio'}</h2>
      <p>{tab === 'errors' ? 'Questões e flashcards com erro ficam aqui até serem recuperados.' :
        future ? `Próxima revisão em ${dateFormat.format(future)}.` : 'Pratique questões ou flashcards para agendar a primeira revisão.'}</p>
    </section>}
  </>;
}
