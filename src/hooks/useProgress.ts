import { use$ } from '@legendapp/state/react';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { useActiveHabits } from './useHabits';
import { bestStreak, consistency30d, currentStreak } from '../domain/streaks';
import type { Habit } from '../domain/types';

export interface ProgressEntry {
  habit: Habit;
  currentStreak: number;
  bestStreak: number;
  consistency30d: number | null;
}

export function useProgress(now: Date = new Date()): ProgressEntry[] {
  const habits = useActiveHabits();
  const completions = Object.values(use$(completions$));
  const reminders = Object.values(use$(reminders$));

  return habits.map((habit) => ({
    habit,
    currentStreak: currentStreak(habit, reminders, completions, now),
    bestStreak: bestStreak(habit, reminders, completions, now),
    consistency30d: consistency30d(habit, reminders, completions, now),
  }));
}
