import { transformStringifyKeys } from '@legendapp/state/sync';
import type { Habit, Completion, Reminder, Settings } from '../domain/types';

interface HabitRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  category: string;
  days_of_week: number[];
  target_per_day: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const habitTransform = transformStringifyKeys<HabitRow, Habit>(
  { from: 'user_id', to: 'userId' },
  { from: 'days_of_week', to: 'daysOfWeek' },
  { from: 'target_per_day', to: 'targetPerDay' },
  { from: 'sort_order', to: 'sortOrder' },
  { from: 'created_at', to: 'createdAt' },
  { from: 'updated_at', to: 'updatedAt' },
  { from: 'deleted_at', to: 'deletedAt' },
  'id',
  'name',
  'color',
  'icon',
  'category'
);

interface CompletionRow {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed_at: string;
  reminder_id: string | null;
  updated_at: string;
  deleted_at: string | null;
}

export const completionTransform = transformStringifyKeys<CompletionRow, Completion>(
  { from: 'habit_id', to: 'habitId' },
  { from: 'user_id', to: 'userId' },
  { from: 'completed_at', to: 'completedAt' },
  { from: 'reminder_id', to: 'reminderId' },
  { from: 'updated_at', to: 'updatedAt' },
  { from: 'deleted_at', to: 'deletedAt' },
  'id',
  'date'
);

interface ReminderRow {
  id: string;
  habit_id: string;
  user_id: string;
  time: string;
  days_of_week: number[] | null;
  enabled: boolean;
  updated_at: string;
  deleted_at: string | null;
}

export const reminderTransform = transformStringifyKeys<ReminderRow, Reminder>(
  { from: 'habit_id', to: 'habitId' },
  { from: 'user_id', to: 'userId' },
  { from: 'days_of_week', to: 'daysOfWeek' },
  { from: 'updated_at', to: 'updatedAt' },
  { from: 'deleted_at', to: 'deletedAt' },
  'id',
  'time',
  'enabled'
);

export interface SettingsRow {
  user_id: string;
  week_starts_on: number;
  theme: 'system' | 'light' | 'dark';
  display_name: string;
  updated_at: string;
}

export const settingsTransform = transformStringifyKeys<SettingsRow, Settings>(
  { from: 'user_id', to: 'userId' },
  { from: 'week_starts_on', to: 'weekStartsOn' },
  { from: 'display_name', to: 'displayName' },
  { from: 'updated_at', to: 'updatedAt' },
  'theme'
);
