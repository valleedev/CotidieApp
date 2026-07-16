import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { isScheduledToday } from '../domain/scheduling';
import { countCompletions, isDone, isReminderDone } from '../domain/completion';
import { activeRemindersOn } from '../domain/reminders';
import { currentStreak } from '../domain/streaks';
import { todayLocalDateString } from '../lib/dates';
import type { Habit, Reminder, Weekday } from '../domain/types';

export interface ReminderStatus {
  reminder: Reminder;
  done: boolean;
}

export interface TodayHabitEntry {
  habit: Habit;
  count: number;
  target: number;
  currentStreak: number;
  reminders: ReminderStatus[]; // [] = hábito genérico, render CompletionControl normal
}

export interface UseTodayResult {
  totalActive: number;
  pending: TodayHabitEntry[];
  completed: TodayHabitEntry[];
}

export function useToday(): UseTodayResult {
  const habits = use$(habits$);
  const completions = use$(completions$);
  const reminders = use$(reminders$);

  const activeHabits = Object.values(habits)
    .filter((h) => h.deletedAt === null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const now = new Date();
  const today = todayLocalDateString();
  const completionList = Object.values(completions);
  const reminderList = Object.values(reminders);

  const scheduledToday = activeHabits.filter((h) => isScheduledToday(h.daysOfWeek as Weekday[], now));

  const pending: TodayHabitEntry[] = [];
  const completed: TodayHabitEntry[] = [];

  for (const habit of scheduledToday) {
    const activeReminders = activeRemindersOn(reminderList, habit, now.getDay() as Weekday);
    const reminderStatuses: ReminderStatus[] = activeReminders.map((r) => ({
      reminder: r,
      done: isReminderDone(completionList, habit.id, today, r.id),
    }));

    const target = activeReminders.length > 0 ? activeReminders.length : habit.targetPerDay;
    const count =
      activeReminders.length > 0
        ? reminderStatuses.filter((r) => r.done).length
        : countCompletions(completionList, habit.id, today);

    const entry: TodayHabitEntry = {
      habit,
      count,
      target,
      currentStreak: currentStreak(habit, reminderList, completionList, now),
      reminders: reminderStatuses,
    };

    (isDone(count, target) ? completed : pending).push(entry);
  }

  return { totalActive: activeHabits.length, pending, completed };
}
