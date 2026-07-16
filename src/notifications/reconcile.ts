import { observe } from '@legendapp/state';
import * as Notifications from 'expo-notifications';
import { planReconcile, type OsScheduledEntry } from '../domain/reconcilePlan';
import { buildTriggerSpecs, resolveReminderDays, signatureOf } from '../domain/reminders';
import { habits$ } from '../state/habits$';
import { reminders$ } from '../state/reminders$';
import { settings$ } from '../state/settings$';
import { cancelNotifications, scheduleReminder } from './scheduler';
import { removeLocalReminderSchedule, setLocalReminderSchedule } from './localSchedule';

function readData(request: Notifications.NotificationRequest): { reminderId: string | null; signature: string | null } {
  const data = request.content.data as { reminderId?: string; signature?: string } | undefined;
  return { reminderId: data?.reminderId ?? null, signature: data?.signature ?? null };
}

export async function reconcile(): Promise<void> {
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
    const habit = habits$[reminder.habitId].get();
    const resolvedDays = resolveReminderDays(reminder, habit);
    const specs = buildTriggerSpecs(reminder, resolvedDays);
    const signature = signatureOf(reminder, resolvedDays);
    const newIds = await scheduleReminder(reminder, habit, specs, signature);
    setLocalReminderSchedule(reminderId, newIds);
  }

  plan.toPurgeLocalSchedule.forEach(removeLocalReminderSchedule);
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
