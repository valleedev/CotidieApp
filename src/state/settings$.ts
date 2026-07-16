import { observable } from '@legendapp/state';
import { synced, syncObservable } from '@legendapp/state/sync';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';
import type { Settings } from '../domain/types';
import { nowIso } from '../lib/dates';
import { LOCAL_USER_ID } from '../lib/localUser';
import { supabase } from '../lib/supabase';
import { currentUserId } from './session$';
import { isSyncEnabled$ } from './syncGate$';
import { settingsTransform, type SettingsRow } from '../lib/syncTransforms';

export type NotificationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface SettingsState {
  profile: Settings; // sincronizable (Fase 4): weekStartsOn, theme, displayName, updatedAt
  local: {
    // NUNCA sincroniza: estado de permiso de notificaciones de este dispositivo.
    notificationPermissionStatus: NotificationPermissionStatus;
  };
}

// PK real es user_id (no id), así que no encaja en syncedSupabase() (asume
// fieldId 'id' + shape lista). Usamos synced() de bajo nivel con get/set
// manuales sobre .eq('user_id', uid).
const defaultProfileRow: SettingsRow = {
  user_id: LOCAL_USER_ID,
  week_starts_on: 1,
  theme: 'system',
  display_name: '',
  updated_at: nowIso(),
};

export const settings$ = observable<SettingsState>({
  profile: synced<SettingsRow, Settings>({
    get: async () => {
      const uid = currentUserId();
      if (!uid) return defaultProfileRow;
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();
      if (error) throw error;
      return (data as SettingsRow | null) ?? { ...defaultProfileRow, user_id: uid };
    },
    set: async ({ value }) => {
      const { error } = await supabase.from('settings').upsert(value, { onConflict: 'user_id' });
      if (error) throw error;
    },
    transform: settingsTransform,
    waitFor: isSyncEnabled$,
    initial: defaultProfileRow,
    persist: {
      name: 'settingsProfile',
      plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
    },
  }),
  local: {
    notificationPermissionStatus: 'undetermined',
  },
});

syncObservable(settings$.local, {
  persist: {
    name: 'settingsLocal',
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
