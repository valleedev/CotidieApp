import { use$ } from '@legendapp/state/react';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { settings$ } from '../state/settings$';
import { useActiveHabits } from './useHabits';
import { bestStreak, consistency30d, currentStreak } from '../domain/streaks';
import { computeHabitHistory } from '../domain/history';
import type { Habit } from '../domain/types';
import type { HabitHistory } from '../domain/history';

const HEATMAP_WEEKS = 12;

export interface ProgressEntry {
  habit: Habit;
  currentStreak: number;
  bestStreak: number;
  consistency30d: number | null;
  history: HabitHistory;
}

export function useProgress(now: Date = new Date()): ProgressEntry[] {
  const habits = useActiveHabits();
  const completions = Object.values(use$(completions$));
  const reminders = Object.values(use$(reminders$));
  const weekStartsOn = use$(settings$.profile.weekStartsOn);

  return habits.map((habit) => ({
    habit,
    currentStreak: currentStreak(habit, reminders, completions, now),
    bestStreak: bestStreak(habit, reminders, completions, now),
    consistency30d: consistency30d(habit, reminders, completions, now),
    history: computeHabitHistory(habit, reminders, completions, HEATMAP_WEEKS, weekStartsOn, now),
  }));
}
