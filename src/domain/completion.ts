import { activeRemindersOn, effectiveTargetOn } from './reminders';
import { toLocalDateString } from '../lib/dates';
import type { Completion, Habit, ID, ISODate, Reminder, Weekday } from './types';

export function countCompletions(completions: Completion[], habitId: ID, date: ISODate): number {
  return completions.filter(
    (c) => c.habitId === habitId && c.date === date && c.deletedAt === null
  ).length;
}

// Completions persistidas antes de que `reminderId` existiera no tienen la clave
// (undefined) en vez de `null` explícito — normalizar aquí evita que el filtro por
// reminderId rompa silenciosamente el "deshacer" de hábitos ya existentes sin recordatorios.
function normalizedReminderId(c: Completion): ID | null {
  return c.reminderId ?? null;
}

export function completionsForReminder(
  completions: Completion[],
  habitId: ID,
  date: ISODate,
  reminderId: ID
): Completion[] {
  return completions.filter(
    (c) =>
      c.habitId === habitId &&
      c.date === date &&
      c.deletedAt === null &&
      normalizedReminderId(c) === reminderId
  );
}

export function isReminderDone(
  completions: Completion[],
  habitId: ID,
  date: ISODate,
  reminderId: ID
): boolean {
  return completionsForReminder(completions, habitId, date, reminderId).length > 0;
}

export function countCompletedReminders(
  completions: Completion[],
  habitId: ID,
  date: ISODate,
  reminderIds: ID[]
): number {
  return reminderIds.filter((rid) => isReminderDone(completions, habitId, date, rid)).length;
}

export function isDone(count: number, targetPerDay: number): boolean {
  return count >= targetPerDay;
}

// Cuenta "hecho" de un día contra su target efectivo: si hay recordatorios activos
// ese weekday, cuenta completions ligadas a esos recordatorios (uno por recordatorio,
// ignorando targetPerDay); si no, cae a completions genéricas + targetPerDay manual.
export function dayCompletionRatio(
  habit: Habit,
  reminders: Reminder[],
  completions: Completion[],
  date: Date
): { count: number; target: number; done: boolean } {
  const weekday = date.getDay() as Weekday;
  const dateStr = toLocalDateString(date);
  const active = activeRemindersOn(reminders, habit, weekday);
  const count =
    active.length > 0
      ? countCompletedReminders(completions, habit.id, dateStr, active.map((r) => r.id))
      : countCompletions(completions, habit.id, dateStr);
  const target = effectiveTargetOn(habit, reminders, weekday);
  return { count, target, done: isDone(count, target) };
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
  date: ISODate,
  reminderId: ID | null = null
): Completion | undefined {
  const candidates = completions.filter(
    (c) =>
      c.habitId === habitId &&
      c.date === date &&
      c.deletedAt === null &&
      normalizedReminderId(c) === reminderId
  );
  if (candidates.length === 0) return undefined;
  return candidates.reduce((latest, c) => (c.completedAt > latest.completedAt ? c : latest));
}
