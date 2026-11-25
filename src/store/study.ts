import { create } from 'zustand';
import { initialProgress, type StudyAttempt, type UserProgress } from '../engine/progress';
import { LocalStorageAdapter, type StorageAdapter } from '../engine/storage';

type StudyState = {
  progress: UserProgress;
  error: string;
  update: (transform: (progress: UserProgress) => UserProgress) => boolean;
  record: (attempt: StudyAttempt) => boolean;
};

export function createStudyStore(storage: StorageAdapter) {
  let progress = initialProgress;
  let error = '';
  try {
    progress = storage.read();
  } catch {
    error = 'Não foi possível ler o progresso local. Importe um backup válido para restaurá-lo.';
  }

  return create<StudyState>((set, get) => ({
    progress,
    error,
    update(transform) {
      const next = transform(get().progress);
      try {
        storage.write(next);
        set({ progress: next, error: '' });
        return true;
      } catch {
        set({ error: 'Não foi possível salvar. Verifique o armazenamento do navegador.' });
        return false;
      }
    },
    record(attempt) {
      return get().update(current => ({ ...current, attempts: [...current.attempts, attempt] }));
    },
  }));
}

export const useStudy = createStudyStore(new LocalStorageAdapter({
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
}));
