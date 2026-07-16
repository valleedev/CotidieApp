import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { setNotificationPermissionStatus, type NotificationPermissionStatus } from '../state/settings$';

function toStatus(response: Notifications.NotificationPermissionsStatus): NotificationPermissionStatus {
  return response.status as NotificationPermissionStatus;
}

// Lectura pasiva — nunca dispara el prompt del SO. Usar al arranque de la app.
export async function refreshPermissionStatusAsync(): Promise<NotificationPermissionStatus> {
  const response = await Notifications.getPermissionsAsync();
  const status = toStatus(response);
  setNotificationPermissionStatus(status);
  return status;
}

// Dispara el prompt real del SO. Solo debe llamarse en contexto (al crear el
// primer recordatorio), nunca proactivamente al abrir la app.
export async function requestPermissionAsync(): Promise<NotificationPermissionStatus> {
  const response = await Notifications.requestPermissionsAsync();
  const status = toStatus(response);
  setNotificationPermissionStatus(status);
  return status;
}

export async function openOSNotificationSettingsAsync(): Promise<void> {
  await Linking.openSettings();
}
