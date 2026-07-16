import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Redirect, Stack, ThemeProvider, DarkTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../src/notifications/handler';
import { ensureNotificationChannelAsync } from '../src/notifications/channels';
import { refreshPermissionStatusAsync } from '../src/notifications/permissions';
import { startReconcileWatcher } from '../src/notifications/reconcile';
import { colors } from '../src/theme/tokens';

// Fase 1: sin auth real todavía. Fase 4 reemplaza esto por sesión real de Supabase Auth.
const hasSession = true;

// Colorea el chrome nativo (headers de los modales de hábito) con la paleta dark-navy —
// sin esto, `habit/new`/`habit/[id]` (los únicos con headerShown: true) se ven con los
// colores claros por defecto de React Navigation.
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.dark.primary,
    background: colors.dark.background,
    card: colors.dark.surface,
    text: colors.dark.text,
    border: colors.dark.border,
    notification: colors.dark.danger,
  },
};

export default function RootLayout() {
  useEffect(() => {
    ensureNotificationChannelAsync();
    refreshPermissionStatusAsync();
    const stopWatcher = startReconcileWatcher();

    const subscription = AppState.addEventListener('change', (state) => {
      // Cubre volver del deep link a Ajustes del SO tras conceder/denegar permiso.
      if (state === 'active') refreshPermissionStatusAsync();
    });
    return () => {
      subscription.remove();
      stopWatcher();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        {!hasSession ? (
          <Redirect href="/welcome" />
        ) : (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="habit/new"
                options={{ presentation: 'modal', headerShown: true, title: 'Crear hábito' }}
              />
              <Stack.Screen
                name="habit/[id]"
                options={{ presentation: 'modal', headerShown: true, title: 'Editar hábito' }}
              />
            </Stack>
          </GestureHandlerRootView>
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
