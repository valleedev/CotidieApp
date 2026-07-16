import { isDaily, isScheduledDay } from './scheduling';
import type { Habit, ID, Reminder, Weekday } from './types';

export interface ReminderDraft {
  id?: ID;
  time: string; // 'HH:mm' local
  daysOfWeek: Weekday[] | null; // null = hereda los días del hábito
  enabled: boolean;
}

export function resolveReminderDays(
  reminder: Pick<Reminder, 'daysOfWeek'>,
  habit: Pick<Habit, 'daysOfWeek'>
): Weekday[] {
  return reminder.daysOfWeek ?? habit.daysOfWeek;
}

// Único lugar de la conversión: modelo usa Weekday 0-6 (0=domingo, estilo JS);
// WeeklyTrigger de expo-notifications usa weekday 1-7 (1=domingo).
export function toExpoWeekday(weekday: Weekday): number {
  return weekday + 1;
}

export type TriggerSpec =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekdayExpo: number; hour: number; minute: number };

function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

export function buildTriggerSpecs(
  reminder: Pick<Reminder, 'time'>,
  resolvedDays: Weekday[]
): TriggerSpec[] {
  const { hour, minute } = parseTime(reminder.time);
  if (isDaily(resolvedDays)) {
    return [{ type: 'daily', hour, minute }];
  }
  return resolvedDays.map((d) => ({ type: 'weekly', weekdayExpo: toExpoWeekday(d), hour, minute }));
}

// Firma estable para detectar "ya está correcto" sin comparar triggers uno a uno.
export function signatureOf(
  reminder: Pick<Reminder, 'time' | 'enabled'>,
  resolvedDays: Weekday[]
): string {
  const sortedDays = [...resolvedDays].sort((a, b) => a - b).join(',');
  return `${reminder.enabled}|${reminder.time}|${sortedDays}`;
}

export function computeSlotCount(
  reminders: Record<ID, Reminder>,
  habits: Record<ID, Habit>
): number {
  return Object.values(reminders).reduce((total, reminder) => {
    const habit = habits[reminder.habitId];
    if (reminder.deletedAt !== null || !reminder.enabled || !habit || habit.deletedAt !== null) {
      return total;
    }
    const resolvedDays = resolveReminderDays(reminder, habit);
    return total + buildTriggerSpecs(reminder, resolvedDays).length;
  }, 0);
}

export function isApproachingIOSLimit(count: number, threshold = 50): boolean {
  return count >= threshold;
}

// Recordatorios de un hábito que aplican en un weekday dado (activos, no borrados,
// y ese día está dentro de sus días resueltos — propios o heredados del hábito).
export function activeRemindersOn(
  reminders: Reminder[],
  habit: Pick<Habit, 'id' | 'daysOfWeek'>,
  weekday: Weekday
): Reminder[] {
  return reminders.filter(
    (r) =>
      r.habitId === habit.id &&
      r.deletedAt === null &&
      r.enabled &&
      isScheduledDay(resolveReminderDays(r, habit), weekday)
  );
}

// Target efectivo del día: si hay recordatorios activos hoy, uno por recordatorio
// (ignora el targetPerDay manual); si no, cae al targetPerDay configurado.
export function effectiveTargetOn(
  habit: Pick<Habit, 'id' | 'daysOfWeek' | 'targetPerDay'>,
  reminders: Reminder[],
  weekday: Weekday
): number {
  const active = activeRemindersOn(reminders, habit, weekday);
  return active.length > 0 ? active.length : habit.targetPerDay;
}

export interface ReminderCreateInput {
  habitId: ID;
  time: string;
  daysOfWeek: Weekday[] | null;
  enabled: boolean;
}

export interface ReminderUpdatePatch {
  id: ID;
  patch: Partial<Pick<Reminder, 'time' | 'daysOfWeek' | 'enabled'>>;
}

export interface ReminderDraftDiff {
  toCreate: ReminderCreateInput[];
  toUpdate: ReminderUpdatePatch[];
  toDeleteIds: ID[];
}

// Compara los Reminder existentes de un hábito contra los drafts del formulario
// (drafts con `id` = fila existente editada; sin `id` = fila nueva).
export function diffReminderDrafts(
  habitId: ID,
  existing: Reminder[],
  drafts: ReminderDraft[]
): ReminderDraftDiff {
  const draftIds = new Set(drafts.filter((d) => d.id).map((d) => d.id));

  const toCreate: ReminderCreateInput[] = drafts
    .filter((d) => !d.id)
    .map((d) => ({ habitId, time: d.time, daysOfWeek: d.daysOfWeek, enabled: d.enabled }));

  const toUpdate: ReminderUpdatePatch[] = drafts
    .filter((d): d is ReminderDraft & { id: ID } => !!d.id)
    .map((d) => ({ id: d.id, patch: { time: d.time, daysOfWeek: d.daysOfWeek, enabled: d.enabled } }));

  const toDeleteIds = existing.filter((r) => !draftIds.has(r.id)).map((r) => r.id);

  return { toCreate, toUpdate, toDeleteIds };
}
