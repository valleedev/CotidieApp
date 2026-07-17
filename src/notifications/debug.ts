import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { REMINDERS_CHANNEL_ID } from './channels';

const TEST_NOTIFICATION_DELAY_SECONDS = 5;

// Notificación única (repeats: false) a los pocos segundos — sirve para
// confirmar permisos + canal + handler en un dispositivo real sin esperar la
// hora real de un recordatorio. `repeats: false` evita el bug de spec §4.2
// (TIME_INTERVAL repetido puede seguir disparando indefinidamente con la app
// cerrada); un trigger no-repetido no tiene ese problema.
export async function scheduleTestNotificationAsync(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Prueba Cotidie',
      body: 'Si ves esto, las notificaciones funcionan.',
      data: { test: true },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: TEST_NOTIFICATION_DELAY_SECONDS,
      repeats: false,
      channelId: REMINDERS_CHANNEL_ID,
    },
  });
}

export interface ScheduledSummaryEntry {
  title: string;
  description: string;
}

export interface ScheduledSummary {
  count: number;
  entries: ScheduledSummaryEntry[];
}

function describeTrigger(trigger: Notifications.NotificationRequest['trigger']): string {
  if (!trigger || typeof trigger !== 'object') return 'sin horario';
  if ('type' in trigger) {
    if (trigger.type === SchedulableTriggerInputTypes.DAILY) {
      return `diario a las ${String(trigger.hour).padStart(2, '0')}:${String(trigger.minute).padStart(2, '0')}`;
    }
    if (trigger.type === SchedulableTriggerInputTypes.WEEKLY) {
      return `semanal (día ${trigger.weekday}) a las ${String(trigger.hour).padStart(2, '0')}:${String(trigger.minute).padStart(2, '0')}`;
    }
    if (trigger.type === SchedulableTriggerInputTypes.TIME_INTERVAL) {
      return `en ${trigger.seconds}s`;
    }
  }
  return 'horario desconocido';
}

export async function listScheduledSummaryAsync(): Promise<ScheduledSummary> {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  return {
    count: requests.length,
    entries: requests.map((request) => ({
      title: request.content.title ?? '(sin título)',
      description: describeTrigger(request.trigger),
    })),
  };
}
