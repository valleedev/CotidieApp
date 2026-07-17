import { addDays, parseISO, startOfDay, startOfWeek } from 'date-fns';
import { dayCompletionRatio, progress } from './completion';
import { isScheduledOn } from './scheduling';
import { toLocalDateString } from '../lib/dates';
import type { Completion, Habit, ISODate, Reminder, Weekday } from './types';

export interface HistoryDay {
  date: ISODate;
  weekday: Weekday;
  scheduled: boolean; // según daysOfWeek, independiente de si existía o es futuro
  existed: boolean; // on/after habit.createdAt (día local)
  isFuture: boolean;
  count: number;
  target: number;
  ratio: number; // 0..1; 0 si no scheduled, no existed, o es futuro
}

export interface HabitHistory {
  weeks: number;
  weekStartsOn: Weekday;
  days: HistoryDay[]; // exactamente weeks*7, cronológico, alineado a weekStartsOn
}

function habitCreatedLocalDate(habit: Habit): Date {
  return parseISO(toLocalDateString(new Date(habit.createdAt)));
}

export function computeHabitHistory(
  habit: Habit,
  reminders: Reminder[],
  completions: Completion[],
  weeks: number,
  weekStartsOn: Weekday,
  now: Date = new Date()
): HabitHistory {
  const today = startOfDay(now);
  const createdDay = habitCreatedLocalDate(habit);
  const gridStart = startOfWeek(addDays(today, -(weeks - 1) * 7), { weekStartsOn });

  const days: HistoryDay[] = Array.from({ length: weeks * 7 }, (_, i) => {
    const date = addDays(gridStart, i);
    const weekday = date.getDay() as Weekday;
    const isFuture = date.getTime() > today.getTime();
    const existed = date.getTime() >= createdDay.getTime();
    const scheduled = isScheduledOn(habit.daysOfWeek, date);
    const countable = scheduled && existed && !isFuture;

    const { count, target } = countable
      ? dayCompletionRatio(habit, reminders, completions, date)
      : { count: 0, target: 0 };

    return {
      date: toLocalDateString(date),
      weekday,
      scheduled,
      existed,
      isFuture,
      count,
      target,
      ratio: countable ? progress(count, target) : 0,
    };
  });

  return { weeks, weekStartsOn, days };
}
