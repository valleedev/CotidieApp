import { subDays } from 'date-fns';
import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { countCompletedReminders, countCompletions, isDone } from '../domain/completion';
import { activeRemindersOn, effectiveTargetOn } from '../domain/reminders';
import { bestStreak, currentStreak } from '../domain/streaks';
import { toLocalDateString } from '../lib/dates';
import type { Habit, ID, ISODate, Weekday } from '../domain/types';

const CALENDAR_DAYS = 35;

export interface HabitDetail {
  habit: Habit;
  currentStreak: number;
  bestStreak: number;
  completedDates: Set<ISODate>;
}

export function useHabitDetail(id: ID, now: Date = new Date()): HabitDetail | undefined {
  const habit = use$(habits$[id]);
  const completions = Object.values(use$(completions$));
  const reminders = Object.values(use$(reminders$));

  if (!habit || habit.deletedAt !== null) return undefined;

  const completedDates = new Set<ISODate>();
  for (let i = 0; i < CALENDAR_DAYS; i++) {
    const day = subDays(now, i);
    const date = toLocalDateString(day);
    const weekday = day.getDay() as Weekday;
    const active = activeRemindersOn(reminders, habit, weekday);
    const count =
      active.length > 0
        ? countCompletedReminders(completions, habit.id, date, active.map((r) => r.id))
        : countCompletions(completions, habit.id, date);
    if (isDone(count, effectiveTargetOn(habit, reminders, weekday))) {
      completedDates.add(date);
    }
  }

  return {
    habit,
    currentStreak: currentStreak(habit, reminders, completions, now),
    bestStreak: bestStreak(habit, reminders, completions, now),
    completedDates,
  };
}
