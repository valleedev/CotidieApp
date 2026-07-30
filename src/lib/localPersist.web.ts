import { observablePersistIndexedDB } from '@legendapp/state/persist-plugins/indexeddb';

// `expo-sqlite/kv-store` no es importable en el bundle web (Metro no resuelve
// el .wasm de wa-sqlite que trae su implementación web) — de ahí el split
// .native.ts/.web.ts en vez de una rama `Platform.OS` en un solo archivo:
// Metro resuelve por extensión de plataforma en build time, así el bundle web
// nunca llega a intentar resolver expo-sqlite.
const TABLE_NAMES = [
  'habits',
  'reminders',
  'completions',
  'settingsProfile',
  'settingsLocal',
  'localDataAdopted',
  'local_reminder_schedules',
];

const webPersist = observablePersistIndexedDB({ databaseName: 'cotidie-local', version: 1, tableNames: TABLE_NAMES });

export function localPersistPlugin() {
  return webPersist;
}
