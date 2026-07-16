import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const REMINDERS_CHANNEL_ID = 'reminders';

// Android 8+ descarta notificaciones en silencio si no existe el canal antes
// de programar (spec §4.4). No-op en iOS.
export async function ensureNotificationChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
    name: 'Recordatorios',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}
