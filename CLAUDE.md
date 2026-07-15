# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Estado del repositorio

Repo pre-implementación. Único artefacto actual: `habit-tracker-design-spec.md` — spec de diseño cerrada (MVP) del proyecto. No hay código todavía, ni `package.json`, ni build/lint/test configurados. Al iniciar implementación, seguir la estructura de carpetas y stack definidos en la spec (secciones 5.1 y 5.2) y actualizar este archivo con comandos reales (`expo start`, `eas build`, test runner, etc.) una vez existan.

## Producto

**Cotidie** — app móvil personal de hábitos (React Native, Expo managed), offline-first con sync multi-dispositivo. Uso diario del propio autor; objetivo doble: app usable + aprender bien el patrón offline-first + sync. Dominio previsto `cotidie.app`.

- Plataformas: iOS + Android. Dev principal en Android (sin Mac); iOS se prueba vía EAS Build (dev build) en iPhone físico.
- Volumen esperado: ~10–15 hábitos por usuario.
- Todo el detalle funcional/UX vive en `habit-tracker-design-spec.md` — consultarlo antes de tomar decisiones de producto o modelo de datos.

## Stack elegido

| Capa | Elección |
|---|---|
| Persistencia + sync | Legend-State v3 + Supabase (SQLite local) |
| Navegación | Expo Router (file-based) |
| Estado | Legend-State v3 (unifica estado + sync) |
| Notificaciones | expo-notifications (solo locales, no push remoto) |
| Auth | Supabase Auth (email/password MVP; Google OAuth y luego Apple Sign-In post-MVP) |
| Fechas | date-fns, siempre hora local |
| Conectividad | @react-native-community/netinfo |
| UUID | uuid + react-native-get-random-values (IDs generados en cliente) |

Alternativa de respaldo si Legend-State da problemas multi-dispositivo: migrar a PowerSync manteniendo Supabase como backend (ver spec §5.1, §6.1).

## Arquitectura de datos (crítico — leer antes de tocar el modelo)

Tres principios gobiernan todo el modelo, derivados de offline-first + sync (spec §2.1, §2.4):

1. **IDs en cliente (UUID v4).** Nunca esperar al servidor para generar identidad.
2. **Borrado lógico únicamente (`deletedAt`).** Nunca `DELETE` real — un registro que desaparece no sincroniza.
3. **`updatedAt` en toda entidad sincronizable.** Base de la reconciliación last-write-wins.

Entidades: `User (1)──<Habit(N)──<Completion(N)`, `Habit(1)──<Reminder(N)──(1)LocalReminderSchedule` (esta última NUNCA sincroniza), `User(1)──(1)Settings`. Esquema TypeScript completo en spec §2.3.

Decisiones de modelo que no son obvias y no deben revertirse sin releer la justificación (spec §2.4):

- **`Completion` es un log de eventos, no un contador.** Cada tap = un registro con su propio id. Un contador mutable se pisaría entre dispositivos. `hecho hoy = nº Completions no borradas de (habitId, hoy) >= targetPerDay`.
- **`Completion.date` es un string local `YYYY-MM-DD`, separado de `completedAt` (timestamp UTC).** Evita que una marca a las 11pm caiga en el día equivocado al convertir a UTC.
- **Las rachas nunca se almacenan — siempre se calculan** al vuelo desde el log de completions, considerando solo días programados (`daysOfWeek`). Un valor derivado sincronizado es imán de conflictos.
- **Recordatorio partido en dos capas:** `Reminder` = intención (sincroniza); `LocalReminderSchedule` = ids que devuelve el SO al programar (solo local, distintos por dispositivo, nunca sincronizan).
- **`daysOfWeek` es la única fuente de verdad para "qué día toca".** "Diario" = array con los 7 días; no hay un flag separado.
- El horario de un hábito **no está versionado**: cambiarlo aplica hacia adelante, no reescribe el cálculo de racha de semanas pasadas.

## Notificaciones (spec §4 — zona de trampas conocidas)

- Solo notificaciones **locales** vía `expo-notifications` (funcionan en Expo Go); push remoto está fuera de alcance.
- Solo triggers `DAILY` y `WEEKLY`. **No usar `CALENDAR`** (solo iOS) ni `TIME_INTERVAL` repetido (bug conocido: puede repetirse indefinidamente con la app cerrada).
- **Conversión de índice de día obligatoria en un solo punto:** modelo usa `Weekday` 0-6 (0=domingo); `WeeklyTrigger` de expo usa 1-7 (1=domingo) → `weekday_expo = weekday_js + 1`.
- **Límite duro: 64 notificaciones locales pendientes por app en iOS**, descartadas en silencio si se supera. Optimizar días completos a un único trigger `DAILY` en vez de 7 `WEEKLY` para no gastar presupuesto de slots.
- Android 8+ requiere canal de notificación creado (`setNotificationChannelAsync`) antes de programar, o se descarta en silencio.
- **La intención sincroniza; la programación al SO es siempre local.** Función de reconciliación (corre al abrir la app / tras sync / tras editar un reminder): lee `Reminder` activos → compara con `getAllScheduledNotificationsAsync` → cancela sobrantes, programa faltantes, actualiza `LocalReminderSchedule`. Patrón declarativo — nunca sincronizar `osNotificationIds`.
- Validar siempre en *development build* sobre dispositivo físico (comportamiento con app cerrada no se replica en emulador/Expo Go).

## Estructura de carpetas prevista (spec §5.2)

```
app/                        # Expo Router: archivo = ruta
  (auth)/  welcome.tsx  sign-in.tsx  sign-up.tsx
  (tabs)/  today.tsx  habits.tsx  progress.tsx  settings.tsx  _layout.tsx
  habit/   [id].tsx  new.tsx
  _layout.tsx               # raíz: decide auth vs app según sesión
src/
  state/                    # Legend-State: observables + config de sync
  domain/                   # lógica pura sin UI (streaks, scheduling, completion) — testeable
  notifications/            # scheduler, reconcile, permissions, channels, localSchedule
  components/               # UI reutilizable
  hooks/
  theme/
  lib/                      # uuid, fechas, netinfo
supabase/
  migrations/               # esquema Postgres versionado (SQL)
```

Columnas vertebrales del código: `domain/` (lógica pura testeable: rachas, "¿toca hoy?", "¿hecho?") y `notifications/` (toda la complejidad de notificaciones concentrada ahí, aislada del resto).

## Flujo de datos (principio de diseño a mantener)

La UI **nunca** habla directamente con la red. Lectura: observables locales (Legend-State/SQLite) → hooks (que aplican `domain/`) → componentes reactivos. Escritura: tap → observable local (instantáneo) → SQLite + cola de sync → Supabase en background con reintento. Derivados (racha, progreso) nunca se escriben, se recalculan. Un cambio en `Reminder` (local o por sync entrante) dispara `notifications/reconcile.ts`.

Backend Supabase: Postgres con Row-Level Security (`user_id = auth.uid()`), tablas espejo del modelo con `created_at`/`updated_at`/`deleted` para sync por diffs.

## Roadmap de fases (orden acordado, no reordenar sin razón)

Fase 0 Cimientos → Fase 1 App local usable (CRUD hábitos, Hoy, marcar/deshacer, sin nube) → Fase 2 Rachas y progreso básico → Fase 3 Notificaciones → Fase 4 Nube (auth + sync, fase aislada) → Fase 5 Gráficas (al final, requieren historial acumulado). Ver spec §7 para el detalle de cada hito.
