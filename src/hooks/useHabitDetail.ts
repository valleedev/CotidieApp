import { subDays } from 'date-fns';
import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { countCompletions, isDone } from '../domain/completion';
import { bestStreak, currentStreak } from '../domain/streaks';
import { toLocalDateString } from '../lib/dates';
import type { Habit, ID, ISODate } from '../domain/types';

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

  if (!habit || habit.deletedAt !== null) return undefined;

  const completedDates = new Set<ISODate>();
  for (let i = 0; i < CALENDAR_DAYS; i++) {
    const date = toLocalDateString(subDays(now, i));
    if (isDone(countCompletions(completions, habit.id, date), habit.targetPerDay)) {
      completedDates.add(date);
    }
  }

  return {
    habit,
    currentStreak: currentStreak(habit, completions, now),
    bestStreak: bestStreak(habit, completions, now),
    completedDates,
  };
}
