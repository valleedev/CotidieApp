import { use$ } from '@legendapp/state/react';
import { completions$ } from '../state/completions$';
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

  return habits.map((habit) => ({
    habit,
    currentStreak: currentStreak(habit, completions, now),
    bestStreak: bestStreak(habit, completions, now),
    consistency30d: consistency30d(habit, completions, now),
  }));
}
