import { syncState } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';

const habitsSync$ = syncState(habits$);
const completionsSync$ = syncState(completions$);
const remindersSync$ = syncState(reminders$);

// Antes de que SQLite termine de hidratar, habits$/completions$/reminders$
// leen como `{}` (su fallback `initial: {}`) — sin este chequeo, un usuario
// offline que reabre la app ve un falso "no tienes hábitos" hasta que carga
// la caché local. `isPersistLoaded` (no `isLoaded`, que depende del fetch
// remoto — ver src/lib/adoptLocalData.ts) es local y no espera a la red.
export function useDataReady(): boolean {
  const habitsLoaded = use$(habitsSync$.isPersistLoaded);
  const completionsLoaded = use$(completionsSync$.isPersistLoaded);
  const remindersLoaded = use$(remindersSync$.isPersistLoaded);
  return habitsLoaded && completionsLoaded && remindersLoaded;
}
