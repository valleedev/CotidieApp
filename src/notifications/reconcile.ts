import { Platform } from 'react-native';
import { observe } from '@legendapp/state';
import * as Notifications from 'expo-notifications';
import { planReconcile, type OsScheduledEntry } from '../domain/reconcilePlan';
import { buildTriggerSpecs, resolveReminderDays, signatureOf } from '../domain/reminders';
import { habits$ } from '../state/habits$';
import { reminders$ } from '../state/reminders$';
import { settings$ } from '../state/settings$';
import { cancelNotifications, scheduleReminder } from './scheduler';
import { removeLocalReminderSchedule, setLocalReminderSchedule } from './localSchedule';
import { subscribeToPushAsync } from './webPush';

function readData(request: Notifications.NotificationRequest): { reminderId: string | null; signature: string | null } {
  const data = request.content.data as { reminderId?: string; signature?: string } | undefined;
  return { reminderId: data?.reminderId ?? null, signature: data?.signature ?? null };
}

export async function reconcile(): Promise<void> {
  // En web la entrega es push remoto (ver webPush.ts/startWebPushWatcher) — no
  // hay nada que agendar en el SO, y `getAllScheduledNotificationsAsync` no
  // tiene implementación web (lanzaría en la primera línea de este try/catch).
  if (Platform.OS === 'web') return;
  try {
    const permissionGranted = settings$.local.notificationPermissionStatus.get() === 'granted';
    const requests = await Notifications.getAllScheduledNotificationsAsync();
    const osScheduled: OsScheduledEntry[] = requests.map((request) => {
      const { reminderId, signature } = readData(request);
      return { identifier: request.identifier, reminderId, signature };
    });

    const plan = planReconcile(reminders$.get(), habits$.get(), osScheduled, permissionGranted);

    if (plan.toCancel.length > 0) {
      await cancelNotifications(plan.toCancel);
    }

    for (const reminderId of plan.toSchedule) {
      const reminder = reminders$[reminderId].get();
      const habit = reminder ? habits$[reminder.habitId].get() : undefined;
      // Con sync remoto (Fase 4), reminders$/habits$ pueden llegar en orden
      // distinto al cascadeo local (p.ej. si un habit se borró entre el cálculo
      // del plan y este loop, tras el `await cancelNotifications` de arriba).
      // Si falta, el próximo disparo reactivo del watcher (habits$/reminders$
      // cambiaron) vuelve a intentarlo.
      if (!reminder || !habit) continue;
      const resolvedDays = resolveReminderDays(reminder, habit);
      const specs = buildTriggerSpecs(reminder, resolvedDays);
      const signature = signatureOf(reminder, resolvedDays);
      const newIds = await scheduleReminder(reminder, habit, specs, signature);
      setLocalReminderSchedule(reminderId, newIds);
    }

    plan.toPurgeLocalSchedule.forEach(removeLocalReminderSchedule);
  } catch (error) {
    console.warn('[notifications] reconcile() falló:', error);
  }
}

// Único mecanismo que dispara reconcile(): arranque de app (observe corre inmediato),
// tras cualquier write a reminders$/habits$ (crear/editar/borrar un recordatorio o
// hábito), y el mismo punto cubrirá el post-sync de Fase 4 sin código nuevo, porque
// el sync hidratará estos mismos observables. Debounce para no disparar por cada
// campo de un write batched.
export function startReconcileWatcher(): () => void {
  let scheduled: ReturnType<typeof setTimeout> | null = null;
  return observe(() => {
    reminders$.get();
    habits$.get();
    settings$.local.notificationPermissionStatus.get();
    if (scheduled) clearTimeout(scheduled);
    scheduled = setTimeout(() => {
      reconcile();
    }, 300);
  });
}

// Equivalente web de startReconcileWatcher(): no hay nada que agendar en el
// SO, sólo asegurar que exista una suscripción push cuando el permiso está
// concedido. subscribeToPushAsync() es idempotente (getSubscription() antes
// de pedir una nueva).
export function startWebPushWatcher(): () => void {
  if (Platform.OS !== 'web') return () => {};
  let scheduled: ReturnType<typeof setTimeout> | null = null;
  return observe(() => {
    const granted = settings$.local.notificationPermissionStatus.get() === 'granted';
    if (scheduled) clearTimeout(scheduled);
    if (!granted) return;
    scheduled = setTimeout(() => {
      subscribeToPushAsync();
    }, 300);
  });
}
