import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { localPersistPlugin } from '../lib/localPersist';

// NUNCA sincroniza a Supabase (solo local a este dispositivo). Marca si ya se
// reasignaron los registros de LOCAL_USER_ID al usuario real tras el primer
// login/signup. Separado de settings$ para evitar un ciclo de imports con
// syncGate$.ts (que necesita este flag para gatear el propio sync de settings$).
export const localDataAdopted$ = observable(false);

syncObservable(localDataAdopted$, {
  persist: {
    name: 'localDataAdopted',
    plugin: localPersistPlugin(),
  },
});
