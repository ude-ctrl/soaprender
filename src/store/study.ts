import { create } from 'zustand';
import { initialProgress, resetUnit, type StudyAttempt, type UserProgress } from '../engine/progress';
import { IndexedProgressRepository, LocalStorageAdapter, type ProgressRepository } from '../engine/storage';

type Preferences = Pick<UserProgress, 'appearance' | 'intensity'>;
type StudyState = {
  progress: UserProgress;
  error: string;
  ready: boolean;
  refresh: () => Promise<void>;
  preferences: (apply: (current: Preferences) => Preferences) => Promise<boolean>;
  reset: (unitId?: string) => Promise<boolean>;
  replace: (progress: UserProgress) => Promise<boolean>;
  record: (attempt: StudyAttempt) => Promise<boolean>;
};

export function createStudyStore(repository: ProgressRepository, notify: () => void = () => {}) {
  return create<StudyState>(set => {
    async function write(change: Parameters<ProgressRepository['change']>[0]) {
      try {
        const progress = await repository.change(change);
        set({ progress, error: '', ready: true });
        notify();
        return true;
      } catch {
        set({ error: 'Não foi possível salvar. Verifique o armazenamento do navegador.' });
        return false;
      }
    }

    return {
      progress: initialProgress, error: '', ready: false,
      async refresh() {
        try {
          set({ progress: await repository.read(), ready: true });
        } catch {
          set({ ready: true, error: 'Não foi possível ler o progresso local. Importe um backup válido para restaurá-lo.' });
        }
      },
      preferences: apply => write({ kind: 'preferences', apply }),
      reset: unitId => write({ kind: 'history', apply: current => unitId ?
        { ...current, attempts: resetUnit({ ...initialProgress, ...current }, unitId).attempts } :
        { attempts: [], streakFreezes: 0 } }),
      replace: progress => write({ kind: 'replace', progress }),
      record: attempt => write({ kind: 'history', apply: current => ({
        ...current,
        attempts: attempt.submissionId && current.attempts.some(item => item.submissionId === attempt.submissionId)
          ? current.attempts : [...current.attempts, attempt],
      }) }),
    };
  });
}

const channel = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('soaprender-progress') : undefined;
const repository = typeof window !== 'undefined' ? new IndexedProgressRepository(window.indexedDB, new LocalStorageAdapter({
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
})) : undefined;

export const useStudy = createStudyStore(repository!, () => channel?.postMessage('changed'));
if (typeof window !== 'undefined') {
  const refresh = () => { void useStudy.getState().refresh(); };
  channel?.addEventListener('message', refresh);
  window.addEventListener('focus', refresh);
  refresh();
}
