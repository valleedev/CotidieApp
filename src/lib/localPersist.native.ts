import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';

export function localPersistPlugin() {
  return observablePersistSqlite(new SQLiteStorage('cotidie-local.db'));
}
