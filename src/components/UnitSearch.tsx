import { ArrowUpRight, Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { catalog } from '../content/catalog';
import { IconButton } from './LayoutControls';

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const searchIndex = [...catalog.units.values()].map(unit => ({
  unit, text: normalize([unit.titulo, unit.topico_id, ...unit.edital_subtopicos].join(' ')),
}));

export function UnitSearch({ onSelect }: { onSelect: (unitId: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const title = useId();
  const [query, setQuery] = useState('');
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const matches = words.length ? searchIndex.filter(item => words.every(word => item.text.includes(word))) : [];

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k' || !trigger.current?.getClientRects().length) return;
      if (document.querySelector('dialog[open]') && !dialog.current?.open) return;
      event.preventDefault();
      open();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  function open() {
    if (!dialog.current?.open) {
      setQuery('');
      dialog.current?.showModal();
    }
    field.current?.focus();
  }

  return <div className="unit-search">
    <button ref={trigger} className="search-trigger" onClick={open} aria-label="Buscar unidade ou assunto" aria-keyshortcuts="Control+K Meta+K">
      <Search size={18} /><span>Buscar unidade ou assunto</span>
    </button>
    <kbd className="search-shortcut" aria-hidden="true">Ctrl K</kbd>
    <dialog ref={dialog} className="panel search-dialog" aria-labelledby={title}>
      <div className="search-header"><h2 id={title}>Buscar unidade</h2>
        <IconButton label="Fechar busca" icon={X} onClick={() => dialog.current?.close()} />
      </div>
      <input ref={field} type="search" value={query} placeholder="Título, código ou assunto" aria-label="Título, código ou assunto"
        autoComplete="off" onChange={event => setQuery(event.target.value)} />
      <p className="muted" role="status">{words.length ? `${matches.length} ${matches.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}` :
        'Digite para buscar no conteúdo do edital.'}</p>
      <ul>{matches.map(({ unit }) => <li key={unit.topico_id}>
        <button onClick={() => { dialog.current?.close(); onSelect(unit.topico_id); }}>
          <span>{unit.titulo}<small>{unit.topico_id}</small></span><ArrowUpRight size={16} />
        </button>
      </li>)}</ul>
    </dialog>
  </div>;
}
