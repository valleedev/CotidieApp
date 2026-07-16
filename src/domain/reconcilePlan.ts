import { buildTriggerSpecs, resolveReminderDays, signatureOf } from './reminders';
import type { Habit, ID, Reminder } from './types';

export interface OsScheduledEntry {
  identifier: string;
  reminderId: ID | null;
  signature: string | null;
}

export interface ReconcilePlan {
  toCancel: string[];
  toSchedule: ID[];
  toPurgeLocalSchedule: ID[];
}

// Planificador puro: el estado del SO (osScheduled) es la fuente de verdad de
// "qué hay agendado ahora"; decide qué cancelar/(re)programar comparando contra
// los Reminder activos. Idempotente: si nada cambió, no produce ninguna acción.
export function planReconcile(
  reminders: Record<ID, Reminder>,
  habits: Record<ID, Habit>,
  osScheduled: OsScheduledEntry[],
  permissionGranted: boolean
): ReconcilePlan {
  const osByReminder = new Map<ID, OsScheduledEntry[]>();
  for (const entry of osScheduled) {
    if (entry.reminderId === null) continue; // agendado fuera de este sistema — no tocar
    const list = osByReminder.get(entry.reminderId) ?? [];
    list.push(entry);
    osByReminder.set(entry.reminderId, list);
  }

  const allIds = new Set<ID>([...Object.keys(reminders), ...osByReminder.keys()]);

  const toCancel: string[] = [];
  const toSchedule: ID[] = [];
  const toPurgeLocalSchedule: ID[] = [];

  for (const id of allIds) {
    const reminder = reminders[id];
    const habit = reminder ? habits[reminder.habitId] : undefined;
    const existing = osByReminder.get(id) ?? [];

    const isActive =
      !!reminder &&
      reminder.deletedAt === null &&
      reminder.enabled &&
      !!habit &&
      habit.deletedAt === null &&
      permissionGranted;

    if (!isActive) {
      if (existing.length > 0) {
        toCancel.push(...existing.map((e) => e.identifier));
      }
      toPurgeLocalSchedule.push(id);
      continue;
    }

    const resolvedDays = resolveReminderDays(reminder, habit);
    const desiredSpecs = buildTriggerSpecs(reminder, resolvedDays);
    const desiredSig = signatureOf(reminder, resolvedDays);

    const matches =
      existing.length === desiredSpecs.length && existing.every((e) => e.signature === desiredSig);

    if (matches) continue;

    if (existing.length > 0) {
      toCancel.push(...existing.map((e) => e.identifier));
    }
    toSchedule.push(id);
  }

  return { toCancel, toSchedule, toPurgeLocalSchedule };
}
