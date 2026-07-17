import { observable } from '@legendapp/state';
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';
import type { ID, Reminder, Weekday } from '../domain/types';
import { newId } from '../lib/uuid';
import { nowIso } from '../lib/dates';
import { currentUserId } from './session$';
import { supabase } from '../lib/supabase';
import '../lib/supabaseSync';
import { reminderTransform } from '../lib/syncTransforms';

export type { Reminder };

export const reminders$ = observable<Record<string, Reminder>>(
  syncedSupabase({
    supabase,
    collection: 'reminders',
    actions: ['create', 'read', 'update'],
    realtime: true,
    changesSince: 'last-sync',
    fieldUpdatedAt: 'updated_at',
    transform: reminderTransform,
    initial: {},
    persist: {
      name: 'reminders',
      plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
    },
  })
);

export interface CreateReminderInput {
  habitId: ID;
  time: string;
  daysOfWeek: Weekday[] | null;
  enabled: boolean;
}

export function createReminder(input: CreateReminderInput): Reminder {
  const timestamp = nowIso();
  const reminder: Reminder = {
    id: newId(),
    userId: currentUserId()!,
    habitId: input.habitId,
    time: input.time,
    daysOfWeek: input.daysOfWeek,
    enabled: input.enabled,
    updatedAt: timestamp,
    deletedAt: null,
  };
  reminders$[reminder.id].set(reminder);
  return reminder;
}

export function updateReminder(
  id: ID,
  patch: Partial<Pick<Reminder, 'time' | 'daysOfWeek' | 'enabled'>>
): void {
  reminders$[id].assign({ ...patch, updatedAt: nowIso() });
}

export function softDeleteReminder(id: ID): void {
  reminders$[id].assign({ deletedAt: nowIso(), updatedAt: nowIso() });
}
