import { observable } from '@legendapp/state';
import { session$ } from './session$';
import { localDataAdopted$ } from './localDataAdopted$';

// Gatea el push/pull remoto: hay sesión Y ya se adoptaron (reasignaron) los
// datos locales previos a LOCAL_USER_ID (ver adoptLocalData.ts). Sin esto,
// la RLS `with check (user_id = auth.uid())` rechazaría filas aún bajo
// LOCAL_USER_ID.
export const isSyncEnabled$ = observable(() => !!session$.get() && localDataAdopted$.get());
