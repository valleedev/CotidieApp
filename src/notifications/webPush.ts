import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { currentUserId } from '../state/session$';

export function isWebPushSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window
  );
}

// iOS Safari solo concede permiso de notificaciones si la PWA ya está
// instalada ("Añadir a inicio"); en pestaña normal el permiso queda bloqueado.
export function isRunningAsStandalonePwa(): boolean {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  return Boolean((navigator as unknown as { standalone?: boolean }).standalone);
}

export async function registerServiceWorkerAsync(): Promise<ServiceWorkerRegistration | null> {
  if (!isWebPushSupported()) return null;
  return navigator.serviceWorker.register('/sw.js');
}

function urlBase64ToUint8Array(base64: string): BufferSource {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64Safe);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return buffer;
}

export async function subscribeToPushAsync(): Promise<void> {
  if (!isWebPushSupported()) return;
  const userId = currentUserId();
  if (!userId) return;

  const vapidPublicKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.warn('[webPush] EXPO_PUBLIC_VAPID_PUBLIC_KEY no configurada, no se puede suscribir.');
    return;
  }

  const registration = await registerServiceWorkerAsync();
  if (!registration) return;

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    }));

  const json = subscription.toJSON();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: json.endpoint!,
      p256dh: json.keys!.p256dh,
      auth_key: json.keys!.auth,
      timezone,
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    { onConflict: 'endpoint' }
  );
  if (error) console.warn('[webPush] no se pudo guardar la suscripción:', error);
}

export async function unsubscribeFromPushAsync(): Promise<void> {
  if (!isWebPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  const { error } = await supabase
    .from('push_subscriptions')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('endpoint', endpoint);
  if (error) console.warn('[webPush] no se pudo dar de baja la suscripción:', error);
}
