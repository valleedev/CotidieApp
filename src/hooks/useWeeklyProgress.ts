import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { settings$ } from '../state/settings$';
import { computeWeeklyProgress, type WeeklyProgress } from '../domain/weeklyProgress';

export function useWeeklyProgress(now: Date = new Date()): WeeklyProgress {
  const habits = Object.values(use$(habits$)).filter((h) => h.deletedAt === null);
  const completions = Object.values(use$(completions$));
  const reminders = Object.values(use$(reminders$));
  const weekStartsOn = use$(settings$.profile.weekStartsOn);

  return computeWeeklyProgress(habits, reminders, completions, weekStartsOn, now);
}
