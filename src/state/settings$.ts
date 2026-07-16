import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';
import type { Settings } from '../domain/types';
import { nowIso } from '../lib/dates';
import { LOCAL_USER_ID } from '../lib/localUser';

export type NotificationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface SettingsState {
  profile: Settings; // sincronizable (Fase 4): weekStartsOn, theme, updatedAt
  local: {
    // NUNCA sincroniza: estado de permiso de notificaciones de este dispositivo.
    notificationPermissionStatus: NotificationPermissionStatus;
  };
}

export const settings$ = observable<SettingsState>({
  profile: {
    userId: LOCAL_USER_ID,
    weekStartsOn: 1,
    theme: 'system',
    displayName: '',
    updatedAt: nowIso(),
  },
  local: {
    notificationPermissionStatus: 'undetermined',
  },
});

syncObservable(settings$, {
  persist: {
    name: 'settings',
    plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
  },
});

export function updateSettingsProfile(
  patch: Partial<Pick<Settings, 'weekStartsOn' | 'theme' | 'displayName'>>
): void {
  settings$.profile.assign({ ...patch, updatedAt: nowIso() });
}

export function setNotificationPermissionStatus(status: NotificationPermissionStatus): void {
  settings$.local.notificationPermissionStatus.set(status);
}
