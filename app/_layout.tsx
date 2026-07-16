import { Redirect, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Fase 1: sin auth real todavía. Fase 4 reemplaza esto por sesión real de Supabase Auth.
const hasSession = true;

export default function RootLayout() {
  if (!hasSession) {
    return <Redirect href="/welcome" />;
  }
  return (
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
  );
}
