import { Maximize, Minimize, type LucideIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type Ref } from 'react';

export function usePreference<T extends string | boolean>(key: string, fallback: T, values: readonly T[]) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(`soaprender.layout.${key}`);
      return values.find(candidate => String(candidate) === saved) ?? fallback;
    } catch { return fallback; }
  });
  useEffect(() => {
    try { localStorage.setItem(`soaprender.layout.${key}`, String(value)); }
    catch { /* The current layout remains usable without local storage. */ }
  }, [key, value]);
  return [value, setValue] as const;
}

export function IconButton({ label, icon: Icon, buttonRef, className = '', ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: LucideIcon; buttonRef?: Ref<HTMLButtonElement> }) {
  return <span className="icon-control">
    <button {...props} type="button" ref={buttonRef} aria-label={label} className={`icon-button ${className}`}><Icon size={18} /></button>
    <span className="tooltip" aria-hidden="true">{label}</span>
  </span>;
}

export function useImmersion(active: boolean, onChange: (active: boolean) => void) {
  const area = useRef<HTMLDivElement>(null);
  const control = useRef<HTMLButtonElement>(null);
  const position = useRef<{ block?: Element; offset: number; y: number }>(undefined);

  function toggle(next: boolean) {
    const content = area.current?.querySelector('.reader-copy, .practice');
    const blocks = content?.querySelectorAll('h1, h2, h3, p, li, .option, .card-answer, figure, .table-scroll');
    const block = blocks && Array.from(blocks).find(element => element.getBoundingClientRect().bottom > 115);
    position.current = { block, offset: block?.getBoundingClientRect().top ?? 0, y: window.scrollY };
    onChange(next);
  }

  useLayoutEffect(() => {
    const anchor = position.current;
    if (!anchor) return;
    position.current = undefined;
    control.current?.focus({ preventScroll: true });
    window.scrollTo(0, anchor.block?.isConnected ?
      window.scrollY + anchor.block.getBoundingClientRect().top - anchor.offset : anchor.y);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) toggle(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [active, onChange]);

  return { area, button: <IconButton label={active ? 'Sair da leitura imersiva' : 'Leitura imersiva'}
    icon={active ? Minimize : Maximize} buttonRef={control} aria-pressed={active} onClick={() => toggle(!active)} /> };
}
