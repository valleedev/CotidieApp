import { configureSyncedSupabase, type SyncedSupabaseConfiguration } from '@legendapp/state/sync-plugins/supabase';
import { isSyncEnabled$ } from '../state/syncGate$';

// `supabase` (el cliente) se pasa por-tabla en cada syncedSupabase() call —
// el .d.ts de configureSyncedSupabase no declara ese campo aunque el runtime
// sí lo soporta como default global; evitamos depender de eso.
//
// `retry` acá aplica a habits$/completions$/reminders$ automáticamente
// (syncedSupabase() mezcla este config global con las props de cada tabla,
// confirmado leyendo sync-plugins/supabase.js) — sin esto un push fallido por
// falta de red no se reintentaba nunca, solo disparaba onSetError una vez.
// `infinite: true` porque la duración de un corte de conexión no tiene techo.
// El .d.ts tipa `SyncedSupabaseConfiguration` con un `Omit<..., keyof
// SyncedOptions>` que excluye `retry` a propósito (mismo tipo de mismatch
// documentado arriba con `supabase`) aunque el runtime sí lo soporta acá —
// el cast documenta ese mismatch, no lo oculta a ciegas. Mantener en sync
// con el `retry` de settings$.ts (usa el plugin synced() de bajo nivel, no
// pasa por acá).
configureSyncedSupabase({
  enabled: isSyncEnabled$,
  retry: { infinite: true, backoff: 'exponential', delay: 1000, maxDelay: 30000 },
} as SyncedSupabaseConfiguration);
