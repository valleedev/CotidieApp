import { observable } from '@legendapp/state';
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';
import type { Completion, ID, ISODate } from '../domain/types';
import { pickCompletionToUndo } from '../domain/completion';
import { newId } from '../lib/uuid';
import { nowIso, todayLocalDateString } from '../lib/dates';
import { supabase } from '../lib/supabase';
import '../lib/supabaseSync';
import { completionTransform } from '../lib/syncTransforms';

export const completions$ = observable<Record<string, Completion>>(
  syncedSupabase({
    supabase,
    collection: 'completions',
    actions: ['create', 'read', 'update'],
    realtime: true,
    changesSince: 'last-sync',
    fieldUpdatedAt: 'updated_at',
    transform: completionTransform,
    persist: {
      name: 'completions',
      plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
    },
  })
);

export function addCompletion(
  habitId: ID,
  userId: ID,
  date: ISODate = todayLocalDateString(),
  reminderId: ID | null = null
): void {
  const timestamp = nowIso();
  const completion: Completion = {
    id: newId(),
    habitId,
    userId,
    date,
    completedAt: timestamp,
    reminderId,
    updatedAt: timestamp,
    deletedAt: null,
  };
  completions$[completion.id].set(completion);
}

export function undoOneCompletion(
  habitId: ID,
  date: ISODate = todayLocalDateString(),
  reminderId: ID | null = null
): void {
  const toUndo = pickCompletionToUndo(Object.values(completions$.get()), habitId, date, reminderId);
  if (!toUndo) return;
  completions$[toUndo.id].assign({ deletedAt: nowIso(), updatedAt: nowIso() });
}
