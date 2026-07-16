import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';
import type { Habit, ID, Weekday } from '../domain/types';
import { newId } from '../lib/uuid';
import { nowIso } from '../lib/dates';
import { LOCAL_USER_ID } from '../lib/localUser';
import { reminders$, softDeleteReminder } from './reminders$';

export type { Habit };

export const habits$ = observable<Record<string, Habit>>({});

syncObservable(habits$, {
  persist: {
    name: 'habits',
    plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
  },
});

export interface CreateHabitInput {
  name: string;
  color: string;
  icon: string;
  daysOfWeek: Weekday[];
  targetPerDay: number;
}

export function createHabit(input: CreateHabitInput): Habit {
  const existing = Object.values(habits$.get()).filter((h) => h.deletedAt === null);
  const sortOrder = existing.reduce((max, h) => Math.max(max, h.sortOrder), -1) + 1;
  const timestamp = nowIso();
  const habit: Habit = {
    id: newId(),
    userId: LOCAL_USER_ID,
    name: input.name,
    color: input.color,
    icon: input.icon,
    daysOfWeek: input.daysOfWeek,
    targetPerDay: input.targetPerDay,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
  habits$[habit.id].set(habit);
  return habit;
}

export function updateHabit(
  id: ID,
  patch: Partial<Pick<Habit, 'name' | 'color' | 'icon' | 'daysOfWeek' | 'targetPerDay'>>
): void {
  habits$[id].assign({ ...patch, updatedAt: nowIso() });
}

export function softDeleteHabit(id: ID): void {
  habits$[id].assign({ deletedAt: nowIso(), updatedAt: nowIso() });
  // Cascada: evita reminders activos huérfanos apuntando a un hábito borrado.
  Object.values(reminders$.get())
    .filter((r) => r.habitId === id && r.deletedAt === null)
    .forEach((r) => softDeleteReminder(r.id));
}

// Reasigna sortOrder secuencial tras un drag-reorder.
export function reorderHabits(orderedIds: ID[]): void {
  const timestamp = nowIso();
  orderedIds.forEach((id, index) => {
    habits$[id].assign({ sortOrder: index, updatedAt: timestamp });
  });
}
