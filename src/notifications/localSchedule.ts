import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';
import type { ID, LocalReminderSchedule } from '../domain/types';

// Puramente local: ids que devuelve expo-notifications EN ESTE dispositivo.
// Nunca se envuelve para sincronizar (ver CLAUDE.md — "Recordatorios").
export const localSchedule$ = observable<Record<ID, LocalReminderSchedule>>({});

syncObservable(localSchedule$, {
  persist: {
    name: 'local_reminder_schedules',
    plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
  },
});

export function setLocalReminderSchedule(reminderId: ID, osNotificationIds: string[]): void {
  localSchedule$[reminderId].set({ reminderId, osNotificationIds });
}

export function removeLocalReminderSchedule(reminderId: ID): void {
  localSchedule$[reminderId].delete();
}
