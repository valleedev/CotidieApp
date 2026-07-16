import { eachDayOfInterval, parseISO } from 'date-fns';
import { countCompletedReminders, countCompletions, isDone } from './completion';
import { activeRemindersOn, effectiveTargetOn } from './reminders';
import { isScheduledOn } from './scheduling';
import type { Completion, Habit, Reminder, Weekday } from './types';
import { toLocalDateString } from '../lib/dates';

function habitCreatedLocalDate(habit: Habit): Date {
  return parseISO(toLocalDateString(new Date(habit.createdAt)));
}

// Cuenta "hecho" de un día: si hay recordatorios activos ese weekday, cuenta
// completions ligadas a esos recordatorios; si no, cuenta genéricas (igual que antes).
function dayCount(habit: Habit, reminders: Reminder[], completions: Completion[], date: Date): number {
  const weekday = date.getDay() as Weekday;
  const dateStr = toLocalDateString(date);
  const active = activeRemindersOn(reminders, habit, weekday);
  if (active.length > 0) {
    return countCompletedReminders(completions, habit.id, dateStr, active.map((r) => r.id));
  }
  return countCompletions(completions, habit.id, dateStr);
}

// Estado "hecho" de cada día PROGRAMADO en [from, to], en orden cronológico.
// Días no programados quedan simplemente ausentes — nunca cuentan como fallo.
function scheduledDayStatuses(
  habit: Habit,
  reminders: Reminder[],
  completions: Completion[],
  from: Date,
  to: Date
): boolean[] {
  if (from > to) return [];
  return eachDayOfInterval({ start: from, end: to })
    .filter((d) => isScheduledOn(habit.daysOfWeek, d))
    .map((d) =>
      isDone(dayCount(habit, reminders, completions, d), effectiveTargetOn(habit, reminders, d.getDay() as Weekday))
    );
}

export function currentStreak(
  habit: Habit,
  reminders: Reminder[],
  completions: Completion[],
  now: Date = new Date()
): number {
  const statuses = scheduledDayStatuses(habit, reminders, completions, habitCreatedLocalDate(habit), now);
  if (statuses.length === 0) return 0;

  // Hoy programado pero aún pendiente no rompe la racha — el día no ha cerrado.
  const last = statuses[statuses.length - 1];
  const trimmed = last === false && isScheduledOn(habit.daysOfWeek, now) ? statuses.slice(0, -1) : statuses;

  let streak = 0;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    if (!trimmed[i]) break;
    streak++;
  }
  return streak;
}

export function bestStreak(
  habit: Habit,
  reminders: Reminder[],
  completions: Completion[],
  now: Date = new Date()
): number {
  const statuses = scheduledDayStatuses(habit, reminders, completions, habitCreatedLocalDate(habit), now);
  let best = 0;
  let running = 0;
  for (const done of statuses) {
    running = done ? running + 1 : 0;
    best = Math.max(best, running);
  }
  return best;
}

// % de días programados hechos en los últimos 30 días (recortado a la fecha de creación
// del hábito). null si la ventana resultante no tiene ningún día programado.
export function consistency30d(
  habit: Habit,
  reminders: Reminder[],
  completions: Completion[],
  now: Date = new Date()
): number | null {
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - 29);
  const createdLocal = habitCreatedLocalDate(habit);
  const from = windowStart > createdLocal ? windowStart : createdLocal;

  const statuses = scheduledDayStatuses(habit, reminders, completions, from, now);
  if (statuses.length === 0) return null;
  return statuses.filter(Boolean).length / statuses.length;
}
