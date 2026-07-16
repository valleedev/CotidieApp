import { addDays, startOfDay, startOfWeek } from 'date-fns';
import { isScheduledOn } from './scheduling';
import { activeRemindersOn, effectiveTargetOn } from './reminders';
import { countCompletedReminders, countCompletions, isDone } from './completion';
import { toLocalDateString } from '../lib/dates';
import type { Habit, Reminder, Completion, Weekday, ISODate } from './types';

export interface DayProgress {
  date: ISODate;
  weekday: Weekday;
  isToday: boolean;
  isFuture: boolean;
  hasScheduledHabits: boolean;
  isFullyCompleted: boolean;
}

export interface WeeklyProgress {
  days: DayProgress[]; // exactamente 7, empezando en weekStartsOn
  completedCount: number;
  totalCount: number;
}

function habitExistedOn(habit: Habit, date: Date): boolean {
  return new Date(habit.createdAt).getTime() <= startOfDay(addDays(date, 1)).getTime() - 1;
}

function isDayFullyCompleted(
  habits: Habit[],
  reminders: Reminder[],
  completions: Completion[],
  date: Date
): { hasScheduledHabits: boolean; isFullyCompleted: boolean } {
  const weekday = date.getDay() as Weekday;
  const dateStr = toLocalDateString(date);

  const scheduledHabits = habits.filter(
    (h) => h.deletedAt === null && habitExistedOn(h, date) && isScheduledOn(h.daysOfWeek, date)
  );

  if (scheduledHabits.length === 0) {
    return { hasScheduledHabits: false, isFullyCompleted: false };
  }

  const allDone = scheduledHabits.every((habit) => {
    const active = activeRemindersOn(reminders, habit, weekday);
    const count =
      active.length > 0
        ? countCompletedReminders(completions, habit.id, dateStr, active.map((r) => r.id))
        : countCompletions(completions, habit.id, dateStr);
    return isDone(count, effectiveTargetOn(habit, reminders, weekday));
  });

  return { hasScheduledHabits: true, isFullyCompleted: allDone };
}

export function computeWeeklyProgress(
  habits: Habit[],
  reminders: Reminder[],
  completions: Completion[],
  weekStartsOn: Weekday,
  now: Date = new Date()
): WeeklyProgress {
  const today = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn });
  const days: DayProgress[] = [];
  let completedCount = 0;
  let totalCount = 0;

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const isFuture = date.getTime() > today.getTime();
    const isToday = date.getTime() === today.getTime();
    const { hasScheduledHabits, isFullyCompleted } = isDayFullyCompleted(habits, reminders, completions, date);

    days.push({
      date: toLocalDateString(date),
      weekday: date.getDay() as Weekday,
      isToday,
      isFuture,
      hasScheduledHabits,
      isFullyCompleted,
    });

    if (!isFuture && hasScheduledHabits) {
      totalCount += 1;
      if (isFullyCompleted) completedCount += 1;
    }
  }

  return { days, completedCount, totalCount };
}
