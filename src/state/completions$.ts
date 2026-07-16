import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';
import type { Completion, ID, ISODate } from '../domain/types';
import { pickCompletionToUndo } from '../domain/completion';
import { newId } from '../lib/uuid';
import { nowIso, todayLocalDateString } from '../lib/dates';

export const completions$ = observable<Record<string, Completion>>({});

syncObservable(completions$, {
  persist: {
    name: 'completions',
    plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
  },
});

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
