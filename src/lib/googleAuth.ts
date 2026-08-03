import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

export async function signInWithGoogle(): Promise<void> {
  ensureConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (response.type !== 'success' || !response.data.idToken) {
    throw new Error('No se pudo obtener el idToken de Google.');
  }
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: response.data.idToken,
  });
  if (error) throw error;
}
