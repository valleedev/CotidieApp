import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { SQLiteStorage } from 'expo-sqlite/kv-store';

// NUNCA sincroniza a Supabase (solo local a este dispositivo). Marca si ya se
// reasignaron los registros de LOCAL_USER_ID al usuario real tras el primer
// login/signup. Separado de settings$ para evitar un ciclo de imports con
// syncGate$.ts (que necesita este flag para gatear el propio sync de settings$).
export const localDataAdopted$ = observable(false);

syncObservable(localDataAdopted$, {
  persist: {
    name: 'localDataAdopted',
    plugin: observablePersistSqlite(new SQLiteStorage('cotidie-local.db')),
  },
});
