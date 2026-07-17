import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import type { TriggerSpec } from '../domain/reminders';
import type { Habit, Reminder } from '../domain/types';
import { REMINDERS_CHANNEL_ID } from './channels';

function toNativeTrigger(spec: TriggerSpec): Notifications.NotificationTriggerInput {
  if (spec.type === 'daily') {
    return {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: spec.hour,
      minute: spec.minute,
      channelId: REMINDERS_CHANNEL_ID,
    };
  }
  return {
    type: SchedulableTriggerInputTypes.WEEKLY,
    weekday: spec.weekdayExpo,
    hour: spec.hour,
    minute: spec.minute,
    channelId: REMINDERS_CHANNEL_ID,
  };
}

export async function scheduleReminder(
  reminder: Reminder,
  habit: Habit,
  specs: TriggerSpec[],
  signature: string
): Promise<string[]> {
  const results = await Promise.all(
    specs.map((spec) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: habit.name,
          body: '¡Es hora!',
          data: { reminderId: reminder.id, signature },
        },
        trigger: toNativeTrigger(spec),
      }).catch((error) => {
        console.warn(`[notifications] fallo agendando reminder ${reminder.id}:`, error);
        return null;
      })
    )
  );
  return results.filter((id): id is string => id !== null);
}

export async function cancelNotifications(identifiers: string[]): Promise<void> {
  await Promise.all(identifiers.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}
