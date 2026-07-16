import { observe } from '@legendapp/state';
import { nowIso } from './dates';
import { session$ } from '../state/session$';
import { localDataAdopted$ } from '../state/localDataAdopted$';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { settings$ } from '../state/settings$';

function adoptLocalData(userId: string): void {
  const timestamp = nowIso();
  for (const habit of Object.values(habits$.peek())) {
    habits$[habit.id].assign({ userId, updatedAt: timestamp });
  }
  for (const completion of Object.values(completions$.peek())) {
    completions$[completion.id].assign({ userId, updatedAt: timestamp });
  }
  for (const reminder of Object.values(reminders$.peek())) {
    reminders$[reminder.id].assign({ userId, updatedAt: timestamp });
  }
  settings$.profile.assign({ userId, updatedAt: timestamp });
  localDataAdopted$.set(true);
}

// Corre una sola vez, en la primera sesión no-nula de este dispositivo:
// reasigna userId de todo lo creado bajo LOCAL_USER_ID (Fases 1-3, sin auth)
// al usuario real, ANTES de que isSyncEnabled$ (syncGate$.ts) habilite el
// push — si no, la RLS `with check (user_id = auth.uid())` rechazaría filas
// aún bajo LOCAL_USER_ID. peek() en localDataAdopted$ evita reactividad
// circular (el propio adoptLocalData la pone en true).
export function startAdoptLocalDataWatcher(): () => void {
  return observe(() => {
    const session = session$.get();
    if (!session || localDataAdopted$.peek()) return;
    adoptLocalData(session.user.id);
  });
}
