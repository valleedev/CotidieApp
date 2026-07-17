import { syncState } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { useNetworkStatus } from './useNetworkStatus';

const habitsSync$ = syncState(habits$);
const completionsSync$ = syncState(completions$);
const remindersSync$ = syncState(reminders$);

export type SyncStatus = 'offline' | 'error' | 'syncing' | 'synced';

export interface SyncSummary {
  status: SyncStatus;
  pending: number;
  lastSync: number | undefined;
}

export function useSyncSummary(): SyncSummary {
  const isOnline = useNetworkStatus();
  const habitsState = use$(habitsSync$);
  const completionsState = use$(completionsSync$);
  const remindersState = use$(remindersSync$);

  const pending =
    (habitsState.numPendingSets ?? 0) +
    (completionsState.numPendingSets ?? 0) +
    (remindersState.numPendingSets ?? 0);
  const isSetting = habitsState.isSetting || completionsState.isSetting || remindersState.isSetting;
  const error = habitsState.error ?? completionsState.error ?? remindersState.error;
  const lastSync =
    Math.max(habitsState.lastSync ?? 0, completionsState.lastSync ?? 0, remindersState.lastSync ?? 0) ||
    undefined;

  const status: SyncStatus = !isOnline
    ? 'offline'
    : error
      ? 'error'
      : isSetting || pending > 0
        ? 'syncing'
        : 'synced';

  return { status, pending, lastSync };
}
