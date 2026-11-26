import { z } from 'zod';
import { catalog, type Item } from '../content/catalog';
import { letters, type Unit } from '../content/schema';

export const day = 86_400_000;
export const ratings = ['again', 'hard', 'good', 'easy'] as const;
export type Rating = typeof ratings[number];

const date = z.number().int().min(0).max(8_640_000_000_000_000);
const attemptSchema = z.object({
  submissionId: z.string().optional(),
  choice: z.enum(letters).optional(),
  itemId: z.string().refine(id => catalog.items.has(id)),
  at: date,
  rating: z.enum(ratings),
  confidence: z.enum(['know', 'think', 'guess']).optional(),
  wasRecovery: z.boolean(),
});

export const progressSchema = z.object({
  version: z.literal(1),
  appearance: z.enum(['light', 'dark']),
  intensity: z.enum(['focus', 'arena']),
  streakFreezes: z.number().int().nonnegative(),
  attempts: z.array(attemptSchema),
});

export type StudyAttempt = z.infer<typeof attemptSchema>;
export type UserProgress = z.infer<typeof progressSchema>;
export const initialProgress: UserProgress = {
  version: 1, appearance: 'light', intensity: 'focus', streakFreezes: 0, attempts: [],
};

export type Review = {
  due: number;
  interval: number;
  repetitions: number;
  ease: number;
  error: boolean;
  evidence: number;
  last: number;
};

const quality: Record<Rating, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export function schedule(previous: Review | undefined, attempt: StudyAttempt): Review {
  const score = quality[attempt.rating];
  const failure = score < 3;
  const priorEase = previous?.ease ?? 2.5;
  const ease = Math.max(1.3, priorEase + .1 - (5 - score) * (.08 + (5 - score) * .02));
  const repetitions = failure ? 0 : (previous?.repetitions ?? 0) + 1;
  const interval = repetitions <= 1 ? 1 : repetitions === 2 ? 6 :
    Math.min(3650, Math.round((previous?.interval ?? 1) * priorEase));
  const spaced = previous && attempt.at - previous.last >= day;
  let evidence = previous?.evidence ?? 0;
  if (failure || attempt.confidence === 'guess') evidence = 0;
  else if (!evidence) evidence = 0.5;
  else if (spaced) evidence = 1;

  if (previous && !previous.error && !failure && attempt.at < previous.due) {
    return { ...previous, evidence, last: attempt.at };
  }

  return {
    due: attempt.at + (failure ? 10 * 60_000 : interval * day),
    interval, repetitions, ease, error: failure, evidence, last: attempt.at,
  };
}

export function reviewIndex(attempts: readonly StudyAttempt[]) {
  const index = new Map<string, Review>();
  for (const attempt of [...attempts].sort((a, b) => a.at - b.at)) {
    index.set(attempt.itemId, schedule(index.get(attempt.itemId), attempt));
  }
  return index;
}

export function mastery(unit: Unit, reviews: ReadonlyMap<string, Review>) {
  const total = unit.questoes.reduce((sum, question) =>
    sum + (reviews.get(question.questao_id)?.evidence ?? 0), 0);
  return Math.round(100 * total / unit.questoes.length);
}

export function reviewQueue(items: Iterable<Item>, reviews: ReadonlyMap<string, Review>, now: number) {
  return [...items].filter(item => (reviews.get(item.id)?.due ?? Infinity) <= now)
    .sort((a, b) => Number(reviews.get(b.id)?.error) - Number(reviews.get(a.id)?.error) ||
      (reviews.get(a.id)?.due ?? 0) - (reviews.get(b.id)?.due ?? 0));
}

export function stats(attempts: readonly StudyAttempt[], now = new Date()) {
  const dates = new Set<string>();
  let xp = 0;
  for (const attempt of attempts) {
    dates.add(new Date(attempt.at).toDateString());
    xp += attempt.rating === 'again' ? 2 : 10;
  }
  const cursor = new Date(now);
  if (!dates.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { xp, streak, level: Math.floor(xp / 100) + 1 };
}

export function resetUnit(progress: UserProgress, unitId: string): UserProgress {
  return {
    ...progress,
    attempts: progress.attempts.filter(attempt => catalog.items.get(attempt.itemId)?.unit.topico_id !== unitId),
  };
}
