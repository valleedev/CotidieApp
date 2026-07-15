import { Redirect, Slot } from 'expo-router';

// Fase 4 reemplaza esto por sesión real desde Supabase Auth.
const hasSession = false;

export default function RootLayout() {
  if (!hasSession) {
    return <Redirect href="/welcome" />;
  }
  return <Slot />;
}
