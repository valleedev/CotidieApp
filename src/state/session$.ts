import { observable } from '@legendapp/state';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// TEMPORAL: bypass de auth para desarrollar sin loguearse. Poner en false (o
// borrar este bloque) para volver al flujo real de Supabase Auth.
const DEV_BYPASS_AUTH = true;
const FAKE_SESSION = { user: { id: '00000000-0000-4000-8000-000000000001' } } as Session;

export const session$ = observable<Session | null>(DEV_BYPASS_AUTH ? FAKE_SESSION : null);
export const authReady$ = observable(DEV_BYPASS_AUTH);

if (!DEV_BYPASS_AUTH) {
  supabase.auth
    .getSession()
    .then(({ data }) => {
      session$.set(data.session);
    })
    .catch(() => {
      session$.set(null);
    })
    .finally(() => {
      authReady$.set(true);
    });

  supabase.auth.onAuthStateChange((_event, session) => {
    session$.set(session);
  });
}

export function currentUserId(): string | null {
  return session$.get()?.user.id ?? null;
}
