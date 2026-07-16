import { configureSyncedSupabase } from '@legendapp/state/sync-plugins/supabase';
import { isSyncEnabled$ } from '../state/syncGate$';

// `supabase` (el cliente) se pasa por-tabla en cada syncedSupabase() call —
// el .d.ts de configureSyncedSupabase no declara ese campo aunque el runtime
// sí lo soporta como default global; evitamos depender de eso.
configureSyncedSupabase({
  enabled: isSyncEnabled$,
});
