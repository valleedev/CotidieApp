// Cron (pg_cron + pg_net, cada minuto — ver README/CLAUDE.md para el
// `cron.schedule(...)` que invoca esta función) que revisa los `reminders`
// activos y empuja una notificación Web Push a cada `push_subscriptions`
// cuyo dueño coincida y a quien le toque ahora mismo, en SU zona horaria.
//
// Esto es el canal de entrega remoto para la PWA (web/iOS) — el canal nativo
// (Android/dev build) sigue agendando localmente vía expo-notifications y no
// pasa por aquí. Ambos leen la misma tabla `reminders` como única fuente de
// intención.
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@^3.6.7';

// Copia mínima de src/domain/scheduling.ts (isScheduledDay) y
// src/domain/reminders.ts (resolveReminderDays) — sin dependencias RN, así
// que en teoría podrían compartirse, pero las Edge Functions desplegadas no
// pueden importar rutas fuera de supabase/functions/. Mantener en sync a mano
// si esa lógica cambia en el cliente.
function isScheduledDay(daysOfWeek: number[], weekday: number): boolean {
  return daysOfWeek.includes(weekday);
}
function resolveReminderDays(reminderDays: number[] | null, habitDays: number[]): number[] {
  return reminderDays ?? habitDays;
}

interface ReminderRow {
  id: string;
  habit_id: string;
  user_id: string;
  time: string;
  days_of_week: number[] | null;
  enabled: boolean;
  deleted_at: string | null;
}

interface HabitRow {
  id: string;
  name: string;
  days_of_week: number[];
  deleted_at: string | null;
}

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  timezone: string;
  deleted_at: string | null;
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
  const vapidSubject = Deno.env.get('VAPID_SUBJECT')!;

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const [subsResult, remindersResult, habitsResult] = await Promise.all([
    supabase.from('push_subscriptions').select('*').is('deleted_at', null),
    supabase.from('reminders').select('*').is('deleted_at', null).eq('enabled', true),
    supabase.from('habits').select('*').is('deleted_at', null),
  ]);

  const firstError = subsResult.error ?? remindersResult.error ?? habitsResult.error;
  if (firstError) {
    return new Response(JSON.stringify({ error: firstError.message }), { status: 500 });
  }

  const subscriptions = (subsResult.data ?? []) as PushSubscriptionRow[];
  const reminders = (remindersResult.data ?? []) as ReminderRow[];
  const habitsById = new Map((habitsResult.data as HabitRow[]).map((habit) => [habit.id, habit]));

  let sent = 0;

  for (const subscription of subscriptions) {
    // Hora/día "de reloj" en la timezone del dispositivo suscrito (guardada al
    // registrar la suscripción) — no hay forma de saberla sin ese dato, ya que
    // `Reminder.time` es local sin zona.
    const localNow = new Date(new Date().toLocaleString('en-US', { timeZone: subscription.timezone }));
    const currentHHmm = `${String(localNow.getHours()).padStart(2, '0')}:${String(localNow.getMinutes()).padStart(2, '0')}`;
    const weekday = localNow.getDay();

    const dueReminders = reminders.filter((reminder) => {
      if (reminder.user_id !== subscription.user_id) return false;
      if (reminder.time !== currentHHmm) return false;
      const habit = habitsById.get(reminder.habit_id);
      if (!habit) return false;
      const resolvedDays = resolveReminderDays(reminder.days_of_week, habit.days_of_week);
      return isScheduledDay(resolvedDays, weekday);
    });

    for (const reminder of dueReminders) {
      const habit = habitsById.get(reminder.habit_id)!;
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } },
          JSON.stringify({ title: habit.name, body: '¡Es hora!' })
        );
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', subscription.id);
        } else {
          console.error('[send-reminder-push] fallo enviando a', subscription.id, error);
        }
      }
    }
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
});
