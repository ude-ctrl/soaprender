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

type Preferences = Pick<UserProgress, 'appearance' | 'intensity'>;
type History = Pick<UserProgress, 'streakFreezes' | 'attempts'>;
type Change =
  | { kind: 'preferences'; apply: (current: Preferences) => Preferences }
  | { kind: 'history'; apply: (current: History) => History }
  | { kind: 'replace'; progress: UserProgress };

export interface ProgressRepository {
  read(): Promise<UserProgress>;
  change(change: Change): Promise<UserProgress>;
}

function preferencesOf({ appearance, intensity }: UserProgress): Preferences {
  return { appearance, intensity };
}

function historyOf({ streakFreezes, attempts }: UserProgress): History {
  return { streakFreezes, attempts };
}

export class IndexedProgressRepository implements ProgressRepository {
  private connection?: Promise<IDBDatabase>;

  constructor(private readonly factory: IDBFactory, private readonly legacy: StorageAdapter,
    private readonly name = 'soaprender-progress') {}

  private open() {
    return this.connection ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.factory.open(this.name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('progress');
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); this.connection = undefined; };
        resolve(db);
      };
      request.onerror = () => { this.connection = undefined; reject(request.error); };
    });
  }

  read() {
    return this.transact();
  }

  change(change: Change) {
    return this.transact(change);
  }

  private async transact(change?: Change): Promise<UserProgress> {
    const db = await this.open();
    // A read-write transaction also serializes first-run migration across tabs.
    return new Promise((resolve, reject) => {
      const tx = db.transaction('progress', 'readwrite');
      const store = tx.objectStore('progress');
      const preferences = store.get('preferences');
      const history = store.get('history');
      let result: UserProgress;
      let failure: unknown;

      history.onsuccess = () => {
        try {
          const migrating = preferences.result === undefined && history.result === undefined;
          const current = migrating ? (change?.kind === 'replace' ? initialProgress : this.legacy.read()) :
            { version: 1 as const, ...preferences.result as Preferences, ...history.result as History };
          result = change?.kind === 'replace' ? change.progress :
            change?.kind === 'preferences' ? { ...current, ...change.apply(preferencesOf(current)) } :
            change?.kind === 'history' ? { ...current, ...change.apply(historyOf(current)) } : current;
          if (migrating || change?.kind === 'preferences' || change?.kind === 'replace') {
            store.put(preferencesOf(result), 'preferences');
          }
          if (migrating || change?.kind === 'history' || change?.kind === 'replace') {
            store.put(historyOf(result), 'history');
          }
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(failure ?? tx.error);
    });
  }
}
