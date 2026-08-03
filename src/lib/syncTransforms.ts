import type { Habit, Completion, Reminder, Settings } from '../domain/types';

type KeySpec<TRemote, TLocal> =
  | (keyof TRemote & keyof TLocal & string)
  | { from: keyof TRemote & string; to: keyof TLocal & string };

// Rename-only snake_case <-> camelCase, sin parseo JSON: ninguna columna de
// estas tablas es json/jsonb (son uuid/text/timestamptz/smallint[]), así que
// `transformStringifyKeys` de legend-state rompe acá — hace JSON.parse a
// ciegas sobre cualquier string recibido (id, user_id, updated_at, name...),
// y revienta con "Unexpected character in number: -" apenas llega un UUID o
// un timestamp por Realtime. PostgREST ya serializa smallint[] como array
// JSON nativo, no hace falta stringify tampoco.
function renameKeys<TRemote extends object, TLocal extends object>(
  ...keys: KeySpec<TRemote, TLocal>[]
) {
  const pairs = keys.map((key) =>
    typeof key === 'string' ? { from: key, to: key } : key
  );
  return {
    load: (value: any) => {
      for (const { from, to } of pairs) {
        if (from in value) {
          const v = value[from];
          if ((to as string) !== (from as string)) delete value[from];
          value[to] = v;
        }
      }
      return value;
    },
    save: (value: any) => {
      for (const { from, to } of pairs) {
        if (to in value) {
          const v = value[to];
          if ((to as string) !== (from as string)) delete value[to];
          value[from] = v;
        }
      }
      return value;
    },
  };
}

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

export const habitTransform = renameKeys<HabitRow, Habit>(
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

export const completionTransform = renameKeys<CompletionRow, Completion>(
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

export const reminderTransform = renameKeys<ReminderRow, Reminder>(
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

export const settingsTransform = renameKeys<SettingsRow, Settings>(
  { from: 'user_id', to: 'userId' },
  { from: 'week_starts_on', to: 'weekStartsOn' },
  { from: 'display_name', to: 'displayName' },
  { from: 'updated_at', to: 'updatedAt' },
  'theme'
);
