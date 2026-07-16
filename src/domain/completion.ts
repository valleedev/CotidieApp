import type { Completion, ID, ISODate } from './types';

export function countCompletions(completions: Completion[], habitId: ID, date: ISODate): number {
  return completions.filter(
    (c) => c.habitId === habitId && c.date === date && c.deletedAt === null
  ).length;
}

export function isDone(count: number, targetPerDay: number): boolean {
  return count >= targetPerDay;
}

export function progress(count: number, targetPerDay: number): number {
  const target = Math.max(targetPerDay, 1);
  return Math.min(count, target) / target;
}

// "Deshacer" siempre quita el tap más reciente — los Completion son anónimos/
// intercambiables (spec §3.5: la posición del slot es solo visual).
export function pickCompletionToUndo(
  completions: Completion[],
  habitId: ID,
  date: ISODate
): Completion | undefined {
  const candidates = completions.filter(
    (c) => c.habitId === habitId && c.date === date && c.deletedAt === null
  );
  if (candidates.length === 0) return undefined;
  return candidates.reduce((latest, c) => (c.completedAt > latest.completedAt ? c : latest));
}
