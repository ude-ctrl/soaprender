import { useRef, useState } from 'react';
import { z } from 'zod';
import { catalog, type Item } from '../content/catalog';
import { letters } from '../content/schema';

const pageSchema = z.enum(['home', 'map', 'unit', 'review', 'performance', 'exam', 'settings']);
export type Page = z.infer<typeof pageSchema>;
const draftSchema = z.object({
  answer: z.enum(letters).nullable(),
  excluded: z.array(z.enum(letters)),
  confidence: z.enum(['know', 'think', 'guess']),
  revealedAt: z.number().optional(),
  deadline: z.number().optional(),
});
const sessionSchema = z.object({
  id: z.string().min(1),
  itemIds: z.array(z.string()).min(1),
  index: z.number().int().nonnegative(),
  recovery: z.boolean(),
  returnTo: pageSchema,
  unitId: z.string(),
  discipline: z.string(),
  scrollY: z.number().nonnegative(),
  draft: draftSchema,
}).refine(session => session.index <= session.itemIds.length &&
  session.itemIds.every(id => catalog.items.has(id)) &&
  (session.returnTo !== 'unit' || catalog.units.has(session.unitId)));

export type PracticeSession = z.infer<typeof sessionSchema>;
export type Draft = z.infer<typeof draftSchema>;
export const emptyDraft: Draft = { answer: null, excluded: [], confidence: 'think' };
const storageKey = 'soaprender.practice.v1';
const checkpointsSchema = z.object({
  active: z.string().optional(),
  saved: z.record(z.string(), sessionSchema),
});
type Checkpoints = z.infer<typeof checkpointsSchema>;

function load(): Checkpoints {
  try {
    const value = sessionStorage.getItem(storageKey);
    if (value) return checkpointsSchema.parse(JSON.parse(value));
  } catch { /* An expired or unavailable checkpoint does not block study. */ }
  return { saved: {} };
}

export function useSessionCheckpoints() {
  const [state, setState] = useState(load);
  const [error, setError] = useState('');
  const current = useRef(state);
  const active = state.active ? state.saved[state.active] : undefined;

  function persist(next: Checkpoints) {
    current.current = next;
    setState(next);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      setError('');
    } catch {
      setError('Não foi possível salvar a posição desta sessão para recarregar a página.');
    }
  }

  function start(items: Item[], recovery: boolean,
    context: Pick<PracticeSession, 'returnTo' | 'scrollY' | 'unitId' | 'discipline'>) {
    const first = items[0];
    if (!first) return;
    const itemIds = items.map(item => item.id);
    const key = recovery ? `review:${itemIds.join(',')}` : `${first.kind}:${first.unit.topico_id}`;
    const previous = current.current.saved[key];
    const session = previous && previous.index < previous.itemIds.length ? { ...previous, ...context } :
      { ...context, id: crypto.randomUUID(), itemIds, index: 0, recovery, draft: emptyDraft };
    persist({ active: key, saved: { ...current.current.saved, [key]: session } });
  }

  function suspend() {
    const { active: key, saved } = current.current;
    if (!key) return;
    const session = saved[key];
    if (session && session.index >= session.itemIds.length) {
      const remaining = { ...saved };
      delete remaining[key];
      persist({ saved: remaining });
    } else {
      persist({ saved });
    }
  }

  function edit(session: PracticeSession, change: (latest: PracticeSession) => PracticeSession) {
    const { active: key, saved } = current.current;
    if (!key) return;
    const latest = saved[key];
    if (!latest || latest.id !== session.id || latest.index !== session.index) return;
    persist({ active: key, saved: { ...saved, [key]: change(latest) } });
  }

  return { active, error, start, suspend, edit };
}
