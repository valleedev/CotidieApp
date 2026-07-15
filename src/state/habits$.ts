import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';

// Esquema completo en Habit (spec §2.3). CRUD real llega en Fase 1;
// esto solo valida que el patrón local-first (SQLite, sin red) funciona.
export interface Habit {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  daysOfWeek: number[];
  targetPerDay: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const habits$ = observable<Record<string, Habit>>({});

syncObservable(habits$, {
  persist: {
    name: 'habits',
    plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
  },
});
