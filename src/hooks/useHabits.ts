import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import type { Habit } from '../domain/types';

export function useActiveHabits(): Habit[] {
  const habits = use$(habits$);
  return Object.values(habits)
    .filter((h) => h.deletedAt === null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
