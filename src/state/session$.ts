import { observable } from '@legendapp/state';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const session$ = observable<Session | null>(null);
export const authReady$ = observable(false);

supabase.auth.getSession().then(({ data }) => {
  session$.set(data.session);
  authReady$.set(true);
});

supabase.auth.onAuthStateChange((_event, session) => {
  session$.set(session);
});

export function currentUserId(): string | null {
  return session$.get()?.user.id ?? null;
}
