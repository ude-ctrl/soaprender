import { describe, expect, test } from 'vitest';
import { catalog } from '../src/content/catalog';
import { day, initialProgress, mastery, resetUnit, reviewIndex, reviewQueue, stats, type StudyAttempt } from '../src/engine/progress';
import { LocalStorageAdapter, parseBackup } from '../src/engine/storage';

const unit = catalog.bundle.unidades[0];
const question = unit.questoes[0].questao_id;
const card = unit.flashcards[0].card_id;
const start = Date.UTC(2026, 0, 5, 12);
const attempt = (itemId: string, rating: StudyAttempt['rating'], at = start): StudyAttempt =>
  ({ itemId, rating, at, wasRecovery: false });

describe('evidência e revisão', () => {
  test('exige cobertura e acerto espaçado para consolidar evidência', () => {
    const first = attempt(question, 'good');
    const fast = attempt(question, 'good', start + 1);
    const delayed = attempt(question, 'good', start + 1 + day);
    expect(mastery(unit, reviewIndex([first, fast, attempt(card, 'easy')]))).toBe(10);
    expect(mastery(unit, reviewIndex([first, fast, delayed]))).toBe(20);
    expect(mastery(unit, reviewIndex([first, fast, delayed, { ...delayed, confidence: 'guess' }]))).toBe(0);
    expect(mastery(unit, reviewIndex([first, fast, delayed, attempt(question, 'again', start + 2 * day)]))).toBe(0);
    expect(stats([first, fast]).xp).toBe(20);
  });

  test('agenda recuperação de erros e remove o item do caderno ao recuperar', () => {
    const failed = attempt(question, 'again');
    const items = catalog.items.values();
    const reviews = reviewIndex([failed, attempt(card, 'good')]);
    expect(reviews.get(question)?.error).toBe(true);
    expect(reviewQueue(items, reviews, start + 599_999)).toHaveLength(0);
    expect(reviewQueue(catalog.items.values(), reviews, start + 600_000).map(item => item.id)).toEqual([question]);
    const recovered = reviewIndex([failed, attempt(question, 'good', start + 600_000)]);
    expect(recovered.get(question)).toMatchObject({ error: false, interval: 1, due: start + 600_000 + day });
  });
});

test('persiste e restaura backup, impede histórico inválido e limita reset à unidade', () => {
  const values = new Map<string, string>();
  const adapter = new LocalStorageAdapter({
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  });
  expect(adapter.read()).toEqual(initialProgress);
  const other = catalog.bundle.unidades[1].questoes[0].questao_id;
  const keep = attempt(other, 'good');
  const progress = { ...initialProgress, appearance: 'dark' as const, attempts: [attempt(question, 'again'), keep] };
  adapter.write(progress);
  expect(adapter.read()).toEqual(progress);
  expect(parseBackup(JSON.stringify(progress))).toEqual(progress);
  expect(resetUnit(progress, unit.topico_id)).toEqual({ ...progress, attempts: [keep] });
  expect(() => parseBackup(JSON.stringify({ ...progress, attempts: [attempt('unknown', 'good')] }))).toThrow();
});
