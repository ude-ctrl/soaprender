import { initialProgress, progressSchema, type UserProgress } from './progress';

export interface StorageAdapter {
  read(): UserProgress;
  write(progress: UserProgress): void;
}

export const storageKey = 'soaprender.progress.v1';

export function parseBackup(text: string): UserProgress {
  return progressSchema.parse(JSON.parse(text));
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'>) {}

  read() {
    const value = this.storage.getItem(storageKey);
    return value === null ? initialProgress : parseBackup(value);
  }

  write(progress: UserProgress) {
    this.storage.setItem(storageKey, JSON.stringify(progress));
  }
}
