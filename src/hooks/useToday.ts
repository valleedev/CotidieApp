import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { isScheduledToday } from '../domain/scheduling';
import { countCompletions, isDone } from '../domain/completion';
import { currentStreak } from '../domain/streaks';
import { todayLocalDateString } from '../lib/dates';
import type { Habit, Weekday } from '../domain/types';

export interface TodayHabitEntry {
  habit: Habit;
  count: number;
  currentStreak: number;
}

export interface UseTodayResult {
  totalActive: number;
  pending: TodayHabitEntry[];
  completed: TodayHabitEntry[];
}

export function useToday(): UseTodayResult {
  const habits = use$(habits$);
  const completions = use$(completions$);

  const activeHabits = Object.values(habits)
    .filter((h) => h.deletedAt === null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const now = new Date();
  const today = todayLocalDateString();
  const completionList = Object.values(completions);

  const scheduledToday = activeHabits.filter((h) => isScheduledToday(h.daysOfWeek as Weekday[], now));

  const pending: TodayHabitEntry[] = [];
  const completed: TodayHabitEntry[] = [];

  for (const habit of scheduledToday) {
    const count = countCompletions(completionList, habit.id, today);
    const entry: TodayHabitEntry = { habit, count, currentStreak: currentStreak(habit, completionList, now) };
    if (isDone(count, habit.targetPerDay)) {
      completed.push(entry);
    } else {
      pending.push(entry);
    }
  }

  return { totalActive: activeHabits.length, pending, completed };
}
