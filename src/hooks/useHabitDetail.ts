import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { settings$ } from '../state/settings$';
import { effectiveTargetOn } from '../domain/reminders';
import { bestStreak, currentStreak } from '../domain/streaks';
import { computeHabitHistory, type HabitHistory } from '../domain/history';
import { formatDaysOfWeek } from '../lib/format';
import type { Habit, ID, Reminder, Weekday } from '../domain/types';

const HISTORY_WEEKS = 3;

export interface HabitDetailData {
  habit: Habit;
  currentStreak: number;
  bestStreak: number;
  history: HabitHistory;
  weekStartsOn: Weekday;
  displayReminders: Reminder[];
  reminderTimesLabel: string;
  daysSummary: string;
  targetPerDay: number;
}

export function useHabitDetail(id: ID, now: Date = new Date()): HabitDetailData | undefined {
  const habit = use$(habits$[id]);
  const completions = Object.values(use$(completions$));
  const reminders = Object.values(use$(reminders$));
  const weekStartsOn = use$(settings$.profile.weekStartsOn);

  if (!habit || habit.deletedAt !== null) return undefined;

  const displayReminders = reminders
    .filter((r) => r.habitId === id && r.deletedAt === null && r.enabled)
    .sort((a, b) => a.time.localeCompare(b.time));

  return {
    habit,
    currentStreak: currentStreak(habit, reminders, completions, now),
    bestStreak: bestStreak(habit, reminders, completions, now),
    history: computeHabitHistory(habit, reminders, completions, HISTORY_WEEKS, weekStartsOn, now),
    weekStartsOn,
    displayReminders,
    reminderTimesLabel: displayReminders.map((r) => r.time).join(', '),
    daysSummary: formatDaysOfWeek(habit.daysOfWeek),
    targetPerDay: effectiveTargetOn(habit, reminders, now.getDay() as Weekday),
  };
}
