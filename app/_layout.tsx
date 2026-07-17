import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { use$ } from '@legendapp/state/react';
import '../src/notifications/handler';
import { ensureNotificationChannelAsync } from '../src/notifications/channels';
import { refreshPermissionStatusAsync } from '../src/notifications/permissions';
import { startReconcileWatcher } from '../src/notifications/reconcile';
import { startAdoptLocalDataWatcher } from '../src/lib/adoptLocalData';
import { colors } from '../src/theme/tokens';
import { useThemeMode } from '../src/theme/useThemeColors';
import { supabase } from '../src/lib/supabase';
import { session$, authReady$ } from '../src/state/session$';

export default function RootLayout() {
  const session = use$(session$);
  const authReady = use$(authReady$);
  const mode = useThemeMode();
  const themeColors = colors[mode];

  // Colorea el chrome nativo (headers de los modales de hábito) con la paleta activa —
  // sin esto, `habit/new`/`habit/[id]`/`habit/[id]/edit` (los únicos con headerShown: true)
  // se ven con los colores por defecto de React Navigation.
  const navigationTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: themeColors.primary,
      background: themeColors.background,
      card: themeColors.surface,
      text: themeColors.text,
      border: themeColors.border,
      notification: themeColors.danger,
    },
  };

  useEffect(() => {
    ensureNotificationChannelAsync();
    refreshPermissionStatusAsync();
    const stopWatcher = startReconcileWatcher();
    const stopAdoptWatcher = startAdoptLocalDataWatcher();

    const subscription = AppState.addEventListener('change', (state) => {
      // Cubre volver del deep link a Ajustes del SO tras conceder/denegar permiso.
      if (state === 'active') {
        refreshPermissionStatusAsync();
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => {
      subscription.remove();
      stopWatcher();
      stopAdoptWatcher();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        {!authReady ? null : (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Protected guard={!session}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
              <Stack.Protected guard={!!session}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="habit/new"
                  options={{ presentation: 'modal', headerShown: true, animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="habit/[id]"
                  options={{ presentation: 'modal', headerShown: true, animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="habit/[id]/edit"
                  options={{ presentation: 'modal', headerShown: true, animation: 'slide_from_bottom' }}
                />
              </Stack.Protected>
            </Stack>
          </GestureHandlerRootView>
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
