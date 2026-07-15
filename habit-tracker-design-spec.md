# Cotidie — Documento de Diseño y Especificación (MVP)

> **Estado:** Diseño cerrado, listo para desarrollo.
> **Nombre de la app:** Cotidie (del latín "a diario"). Dominio previsto: `cotidie.app`.
> **Tipo de proyecto:** App móvil personal en React Native (Expo managed).
> **Alcance de este documento:** Especificación funcional y técnica del MVP. No incluye implementación.

---

## 0. Contexto y restricciones del proyecto

| Aspecto | Decisión |
|---|---|
| Plataformas | iOS + Android (uso diario en iOS; desarrollo principal en Android por no tener Mac) |
| Framework | Expo **managed** (elegido también para reutilizar el aprendizaje en otro proyecto) |
| Nivel del autor | Principiante en React Native; avanzado en desarrollo general y en uso de IA para programar |
| Datos | **Nube + offline-first** (multi-dispositivo); patrón reutilizable en otro proyecto |
| Build sin Mac | Desarrollo en Expo Go (Android) + *development build* vía **EAS Build** (compila en la nube) para probar iOS en iPhone físico y para publicar |
| Volumen esperado | ~10–15 hábitos |
| Objetivo | App que se usará a diario **y** aprender bien el patrón offline-first + sync |

---

## 1. Definición de producto

### 1.1 Problema y usuario
**Usuario:** el autor — persona disciplinada que quiere sostener ~10–15 hábitos, pero sin un sistema pierde constancia, olvida hábitos concretos y se desmotiva sin señales visibles de progreso.

**Problema:** no existe un lugar único que (a) diga *qué toca hoy*, (b) *recuerde* en el momento y (c) muestre que *se está siendo constante* (racha), funcionando siempre al instante —con o sin internet— y en todos los dispositivos.

### 1.2 Propuesta de valor
> *Mi app personal que me dice qué hábitos tengo hoy, me recuerda hacerlos y me muestra mi racha — siempre rápida, funcione o no el internet, y sincronizada en todos mis dispositivos.*

### 1.3 Alcance del MVP

| Funcionalidad | Prioridad |
|---|---|
| Crear / editar / borrar hábitos | Must |
| Lista de "Hoy" (qué toca) | Must |
| Marcar completado / deshacer | Must |
| Hábitos por días específicos (ej. L-X-V) | Must |
| Completar varias veces al día (sub-items) | Must |
| Recordatorios / notificaciones por hábito | Must |
| Rachas y progreso básico | Must |
| Gráficas | Must *(se construyen al final: requieren historial)* |
| Autenticación (cuenta) | Must *(por decisión de nube)* |
| Sync offline-first multi-dispositivo | Must *(por decisión de nube)* |
| Meta numérica real (ej. medir 2L de agua) | Nice-to-have |
| Historial visual tipo calendario / heatmap | Nice-to-have |
| Social / compartir / retos | Fuera de alcance |
| Widgets / Apple Health / Google Fit | Fuera de alcance |
| Gamificación (logros, puntos) | Fuera de alcance |

> **Distinción clave:** *"completar N veces al día"* (`targetPerDay`) está **dentro** del MVP. *"Medir una cantidad"* (2L de agua como magnitud) está **fuera**. Son cosas distintas; el modelo deja lista la primera sin arrastrar la segunda.

### 1.4 Flujos de usuario principales

**A — Onboarding / primer hábito**
1. Bienvenida → 2. Crear cuenta (necesaria por la sync) → 3. Estado vacío "Crea tu primer hábito" → 4. Formulario (nombre, días, hora) → 5. Permiso de notificaciones (en contexto) → 6. Aterriza en "Hoy".

**B — Día a día (flujo de mayor frecuencia)**
1. Abrir → "Hoy" con lo que toca → 2. Tocar check → completado, racha sube, feedback → 3. (Opcional) deshacer → 4. Cerrar. Todo instantáneo, con o sin internet.

**C — Recordatorio**
1. Llega notificación a la hora → 2. Tocar → abre la app en "Hoy" *(marcar desde la notificación = post-MVP)*.

**D — Ver progreso**
1. Entrar a un hábito o a la pestaña Progreso → 2. Racha actual, mejor racha e (fase final) gráfica.

**E — Segundo dispositivo**
1. Instalar, iniciar sesión → 2. Hábitos e historial aparecen sincronizados → 3. Marcar en uno aparece en el otro (last-write-wins).

---

## 2. Modelo de datos

### 2.1 Principios (derivados de offline-first + sync)
- **IDs en cliente (UUID):** identidad sin esperar al servidor; se crea en modo avión.
- **Borrado lógico (tombstones):** nunca `DELETE` real; se marca `deletedAt`. Un registro que "desaparece" no se puede sincronizar.
- **`updatedAt` en todo lo que sincroniza:** base de la reconciliación entre dispositivos.

> Estos tres principios coinciden exactamente con lo que la capa de sync elegida (Legend-State + Supabase) espera: campos `created_at` / `updated_at` / `deleted`. No es casual: el modelo se diseñó mirando hacia el stack.

### 2.2 Entidades y relaciones
```
User (1) ──< Habit (N)
Habit (1) ──< Completion (N)      ← el historial vive aquí
Habit (1) ──< Reminder (N)        ← varios recordatorios por hábito (8am, 8pm)
Reminder (1) ── LocalReminderSchedule (1)   ← SOLO local, NO sincroniza
User (1) ── Settings (1)
```

### 2.3 Esquema (tipos ilustrativos)
```typescript
type ID = string;            // UUID v4, generado en cliente
type ISODate = string;       // 'YYYY-MM-DD' → día LOCAL del hábito
type ISOTimestamp = string;  // instante UTC
type Weekday = 0|1|2|3|4|5|6; // 0 = domingo (estilo JS Date)

interface Habit {
  id: ID;
  userId: ID;
  name: string;
  color: string;              // hex
  icon: string;               // nombre de icono
  daysOfWeek: Weekday[];      // fuente única de verdad. Diario = los 7 días
  targetPerDay: number;       // default 1. "Leer AM y PM" = 2
  sortOrder: number;          // orden manual
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  deletedAt: ISOTimestamp | null;
}

interface Completion {        // cada marca = UN registro (log de eventos)
  id: ID;
  habitId: ID;
  userId: ID;
  date: ISODate;              // día LOCAL al que cuenta (clave anti-timezone)
  completedAt: ISOTimestamp;  // instante real del tap
  updatedAt: ISOTimestamp;
  deletedAt: ISOTimestamp | null; // "deshacer" que debe sincronizar
}

interface Reminder {
  id: ID;
  habitId: ID;
  userId: ID;
  time: string;               // 'HH:mm' local
  daysOfWeek: Weekday[] | null; // null = hereda los días del hábito
  enabled: boolean;
  updatedAt: ISOTimestamp;
  deletedAt: ISOTimestamp | null;
}

// SOLO en este teléfono. NUNCA sincroniza.
interface LocalReminderSchedule {
  reminderId: ID;
  osNotificationIds: string[]; // ids que devuelve expo-notifications AQUÍ
}

interface Settings {
  userId: ID;
  weekStartsOn: Weekday;
  theme: 'system' | 'light' | 'dark';
  updatedAt: ISOTimestamp;
  // local, no sincroniza: estado del permiso de notificaciones
}
```

### 2.4 Decisiones clave y su justificación

1. **`Completion` es un log de eventos, no un contador.** Un `count` mutable por (hábito, día) se pisa entre dispositivos → se pierden marcas. Con eventos, cada tap es un registro con su `id`; dos dispositivos generan dos registros que se fusionan sin conflicto. Bonus: "varias veces al día" sale gratis y hay historial exacto. Costo: para "¿hecho hoy?" hay que contar registros (trivial para 10–15 hábitos).
   - **Regla de completado:** `hecho hoy = nº de Completions no borradas de (habitId, hoy) >= targetPerDay`. Progreso = `min(count, target) / target`.

2. **`Completion.date` como string local, separado del timestamp.** Evita el bug clásico: una marca a las 11pm puede caer en el día equivocado al convertir a UTC. El "día" lo define el calendario local, no UTC. Costo: un campo "redundante"; beneficio: elimina una categoría entera de bugs de zona horaria.

3. **Las rachas NO se almacenan; se calculan.** Un valor derivado que sincroniza es imán de conflictos y de "drift". El log de completions es la verdad; la racha se computa al vuelo considerando solo **días programados** (un L-X-V no rompe racha un martes). Costo despreciable para este volumen.

4. **Recordatorio partido en dos: intención (sincroniza) vs. agenda del SO (local).** `Reminder` = qué quieres (sincroniza). `LocalReminderSchedule` = los ids que devuelve el SO al programar, distintos en cada teléfono (no sincroniza). Resuelve en el modelo la trampa #1 de notificaciones + sync.

5. **`daysOfWeek` unificado:** "diario" = los 7 días. Un solo camino de código: `daysOfWeek.includes(hoy)`. La UI muestra "Diario" como azúcar visual cuando el array tiene los 7.

### 2.5 Cobertura de casos
| Caso | Solución |
|---|---|
| Diario | `daysOfWeek = [0..6]` |
| Días específicos (L-X-V) | `daysOfWeek = [1,3,5]` |
| Completar varias veces (leer AM/PM) | `targetPerDay = 2` + 2 `Reminder`; cada lectura = 1 `Completion` |
| Historial | Colección de `Completion` (append-only; "deshacer" = tombstone) |
| Día no hecho | **No se guarda nada.** Ausencia de `Completion` = no hecho |

### 2.6 Suposición explícita
**El horario del hábito no está versionado.** Cambiar un hábito de L-X-V a diario aplica hacia adelante; no reescribe cómo se veía la semana pasada para el cálculo de racha. Versionar el historial de horarios queda fuera del MVP.

---

## 3. Diseño UX/UI

### 3.1 Navegación
```
RAÍZ (decide según sesión)
├── STACK DE AUTENTICACIÓN (sin sesión)
│     └── Bienvenida → Registro / Iniciar sesión
└── APP PRINCIPAL (con sesión) → Tabs inferiores
      ├── [Tab 1] Hoy         ← pantalla principal
      ├── [Tab 2] Hábitos     (gestionar todos, incl. los que hoy no tocan)
      ├── [Tab 3] Progreso    (rachas + gráficas)
      ├── [Tab 4] Ajustes
      └── (sobre los tabs) Crear/Editar hábito · Detalle de hábito
```
**Por qué tabs:** acceso de un pulgar para una app de uso frecuente. **Por qué "Hoy" y "Hábitos" separados:** *Hoy* muestra solo lo que toca (foco); *Hábitos* permite editar un hábito de L-X-V un domingo, cuando no aparece en Hoy.

### 3.2 Pantallas

**Hoy**
- Muestra: hábitos donde `daysOfWeek.includes(hoy)`, separados en *Pendientes* / *Completados*; resumen del día; chip de estado de sync (discreto).
- Acciones: tocar círculo → crea `Completion`; tocar completado → deshacer (tombstone); tocar nombre → Detalle; "+" → Crear.
- Sub-items (target > 1): la tarjeta muestra casillas rotuladas con las horas de los recordatorios (ver 3.5).

**Hábitos**
- Muestra: todos los hábitos activos (sin filtrar por día), con días y hora como subtítulo.
- Acciones: tocar → Editar; deslizar → borrar (con confirmación); reordenar (`sortOrder`); "+" crear. No se marca completado aquí (gestión ≠ ejecución).

**Progreso**
- v1 mínimo: racha actual y mejor racha por hábito + "% de constancia (30 días)".
- Fase final: gráfica por hábito (barras semanales o heatmap). Todo derivado del log.

**Ajustes**
- Cuenta (email, cerrar sesión), estado de sync ("última sync", "sincronizar ahora"), inicio de semana, tema, permiso de notificaciones (con acceso directo a Ajustes del SO si está denegado).

**Crear / Editar hábito (modal)**
- Campos: nombre, icono/color, ¿qué días? (toggles + atajo "Diario"), veces al día (`targetPerDay`), recordatorios (lista con hora + etiqueta + añadir/borrar).
- Validación: nombre no vacío, ≥1 día. Guarda local al instante (sync en segundo plano).

**Detalle de hábito**
- Racha actual / mejor, mini-calendario de días hechos, botón editar. Sin datos nuevos.

**Auth (Bienvenida / Registro / Login)**
- Pitch de una línea + crear cuenta / iniciar sesión. Errores inline.

### 3.3 Componentes reutilizables
`HabitCard`, `CompletionControl` (círculo o sub-items), `StreakBadge`, `WeekdayPicker`, `ReminderRow`, `DaySummaryBar`, `SyncStatusChip`, `EmptyState`.

### 3.4 Estados (offline-first cambia las reglas)
- **Carga:** los datos salen de SQLite local al instante. Sin spinners por pantalla; solo un *splash* breve en arranque en frío.
- **Error:** *sin internet NO es un error.* Nunca pantalla bloqueante de "sin conexión"; el `SyncStatusChip` informa ("cambios guardados localmente"). Solo hay error real donde se requiere red *ahora*: iniciar sesión / registrarse (error inline).
- **Vacío (tres tipos distintos):**
  - Sin hábitos (usuario nuevo): CTA grande "Crea tu primer hábito".
  - Hoy sin pendientes (todo hecho): celebratorio, "¡Listo por hoy!".
  - Hoy no toca nada: "Hoy descansas. Nada programado."

### 3.5 Sub-items — Opción A (elegida): "slots visuales"
Las etiquetas ("mañana"/"tarde") son **decoración**: la tarjeta muestra `targetPerDay` casillas rotuladas con las horas de los recordatorios, que se llenan **en orden**. Marcar la "tarde" primero llena la primera casilla igual (cuenta = 1 de 2). **Cero cambios en el modelo** (los `Completion` siguen siendo anónimos). Da la experiencia visual de sub-items sin añadir complejidad de sync. Migrar a "sub-items con identidad" (añadir `slotId` a `Completion`) sería aditivo si algún día se necesita precisión por slot.

---

## 4. Notificaciones y recordatorios

### 4.1 Librería y entorno
- **`expo-notifications`** (estándar en Expo). **Las notificaciones locales funcionan en Expo Go**; solo el push remoto quedó fuera de Expo Go (Android) desde SDK 53. Esta app usa **solo notificaciones locales** (el teléfono dispara el recordatorio a una hora que ya conoce; no requiere servidor).
- Iterar la lógica en Expo Go (Android); **validar siempre en dispositivo físico** con *development build* (el comportamiento con app cerrada/terminada no se replica en emulador).

### 4.2 Traducción `Reminder` → triggers del SO
```
Si daysOfWeek == 7 días  → 1 trigger DAILY  { hour, minute }         (1 slot)
Si es subconjunto (L-X-V) → 1 trigger WEEKLY por día { weekday,h,m }  (N slots)
```
- **Solo `DAILY` y `WEEKLY`** (funcionan en ambas plataformas). **NO usar `CALENDAR`** (solo iOS). **NO usar `TIME_INTERVAL` repetido** para recordatorios (bug conocido: con la app cerrada puede repetir indefinidamente).
- **Trampa de índice de día:** el modelo usa `Weekday` 0–6 (0=domingo); el `WeeklyTrigger` de expo usa `weekday` 1–7 (1=domingo). Conversión en un solo lugar: `weekday_expo = weekday_js + 1`.

### 4.3 El límite de iOS que gobierna la estrategia
- **iOS: máximo 64 notificaciones locales pendientes por app.** Al superarlo, iOS **descarta en silencio** (sin error). Android no tiene este límite tan estricto, pero se diseña para el más restrictivo.
- **Presupuesto de slots** (con optimización DAILY):

  | Tipo de hábito | Slots |
  |---|---|
  | Diario, 1 recordatorio | 1 (DAILY) |
  | Diario, 2 recordatorios | 2 |
  | L-X-V, 1 recordatorio | 3 (WEEKLY) |
  | L-X-V, 2 recordatorios | 6 |

- **Estrategia MVP:** optimizar días completos a `DAILY` (1 slot, no 7); llevar un contador de slots; avisar al usuario si se acerca a ~50 en iOS. Para 10–15 hábitos personales es muy improbable acercarse a 64.
- **Futuro (no MVP):** "ventana rolling" (programar solo los próximos 7–14 días y reprogramar al abrir la app) para apps con cientos de recordatorios.

### 4.4 iOS vs Android
| Tema | iOS | Android |
|---|---|---|
| Permiso | Prompt una vez por instalación; si se niega, se activa en Ajustes | Se puede repedir; Android 13+ pide permiso runtime |
| Canales | No aplica | **Obligatorios desde Android 8**; sin canal se descarta en silencio. `setNotificationChannelAsync` antes de programar |
| Foreground | Requiere `setNotificationHandler` | Se muestra automáticamente |
| Timing exacto | Fiable | Android 12+ requiere `SCHEDULE_EXACT_ALARM` — **no se usa** (minuto exacto no es crítico) |
| App forzada a cerrar | Locales programadas siguen sonando | *Force-stop* exige reabrir la app manualmente (limitación de Android) |
| Fabricantes | Consistente | Xiaomi/Huawei/Samsung/Oppo pueden matar procesos y silenciar recordatorios |

### 4.5 Riesgos y mitigaciones
| Riesgo | Mitigación | MVP |
|---|---|---|
| Usuario niega permiso | Pedirlo **en contexto** (al crear el 1er recordatorio); si niega, estado + botón a Ajustes | Sí |
| Android descarta por falta de canal | Crear canales al arrancar, antes de programar | Sí |
| Superar 64 en iOS | Presupuesto de slots + optimización DAILY | Sí |
| DST (horario de verano) | `DAILY`/`WEEKLY` usan hora local; se ajustan solos. Evitar cálculos manuales de "segundos hasta las 8am" | Sí (gratis) |
| Reinstalación borra notificaciones | `Reminder` sincroniza → se reprograma tras reinstalar | Sí (ya diseñado) |
| Fabricantes matan procesos | Ofrecer abrir ajustes de optimización de batería (`expo-intent-launcher`) | Nice-to-have |

### 4.6 Integración con sync
- **La intención sincroniza; la programación es local.** Cada dispositivo programa sus propias notificaciones con sus propios `osNotificationIds` (en `LocalReminderSchedule`). Nunca se sincronizan ids del SO.
- **Reconciliación** (una función, corre al abrir la app / tras cada sync / tras editar un recordatorio): lee los `Reminder` activos, compara con lo agendado en el SO (`getAllScheduledNotificationsAsync`), cancela lo que sobra, programa lo que falta, actualiza `LocalReminderSchedule`. Patrón declarativo (el SO refleja el estado de mis `Reminder`); resuelve el borrado por sync entrante.

**Fragmento ilustrativo del mapeo** (no es la implementación completa):
```typescript
async function scheduleReminder(r: Reminder): Promise<string[]> {
  const [hour, minute] = r.time.split(':').map(Number);
  const days = r.daysOfWeek ?? habit.daysOfWeek;   // hereda si es null
  const isDaily = days.length === 7;

  if (isDaily) {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: habit.name, body: '¡Es hora!' },
      trigger: { type: SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
    return [id];                                    // 1 slot
  }
  return Promise.all(days.map(d =>                  // N slots
    Notifications.scheduleNotificationAsync({
      content: { title: habit.name, body: '¡Es hora!' },
      trigger: { type: SchedulableTriggerInputTypes.WEEKLY, weekday: d + 1, hour, minute },
    })
  ));
}
```

---

## 5. Arquitectura técnica

### 5.1 Stack (recomendado · alternativa · criterio)
| Capa | Recomendado | Alternativa | Criterio |
|---|---|---|---|
| **Persistencia + Sync** | **Legend-State v3 + Supabase** (SQLite local) | PowerSync + Supabase | Legend-State es la offline-first más simple y transparente para *aprender* el patrón; su modelo (`created_at`/`updated_at`/`deleted`, UUID en cliente) calza con el PASO 2. PowerSync si se necesita sync más robusto (servicio) |
| **Navegación** | **Expo Router** (file-based) | React Navigation | Estándar actual en Expo; menos boilerplate. Bajar a React Navigation solo si se necesita navegación muy atípica |
| **Estado + Sync** | **Legend-State v3** | Zustand + capa sync aparte | Unifica estado y sync (una pieza menos) |
| **Persistencia local** | **Expo SQLite** (vía Legend-State) | MMKV | Datos relacionales/consultables (hábitos ↔ completions); MMKV es clave-valor |
| **Notificaciones** | **expo-notifications** | — | Estándar; corre en Expo Go para locales |
| **Auth** | **Supabase Auth** | — | Un backend para auth + datos + realtime. Ver 5.5 |
| **Fechas** | **date-fns** | Day.js | Ligero, tree-shakeable; toda la lógica de día usa hora **local** |
| **Conectividad** | **@react-native-community/netinfo** | — | Para el `SyncStatusChip`; Legend-State ya reintenta solo |
| **UUID** | **uuid** + `react-native-get-random-values` | expo-crypto | IDs en cliente (base del offline-first) |

**Trade-off honesto de Legend-State + Supabase:** su sync es potente pero tiene aristas reportadas (inconsistencias multi-dispositivo en ciertos escenarios; recuperar cambios tras periodos offline largos). **Para uso personal single-user con last-write-wins es suficiente.** Si en pruebas resulta insuficiente, migrar a **PowerSync** manteniendo Supabase como backend. Todo el stack corre en **Expo managed**; EAS Build (sin Mac) para dev builds y publicación.

### 5.2 Estructura de carpetas
```
app/                        # Expo Router: archivo = ruta
  (auth)/  welcome.tsx  sign-in.tsx  sign-up.tsx
  (tabs)/  today.tsx  habits.tsx  progress.tsx  settings.tsx  _layout.tsx
  habit/   [id].tsx  new.tsx
  _layout.tsx               # raíz: decide auth vs app según sesión
src/
  state/                    # Legend-State: observables + config de sync
    habits$.ts  completions$.ts  reminders$.ts  settings$.ts  supabase.ts
  domain/                   # lógica pura, sin UI ni librerías (testeable)
    streaks.ts  scheduling.ts  completion.ts
  notifications/            # toda la complejidad del PASO 4, aislada
    scheduler.ts  reconcile.ts  permissions.ts  channels.ts  localSchedule.ts
  components/               # UI reutilizable
  hooks/                    # useToday, useStreak, ...
  theme/                    # tokens de diseño
  lib/                      # uuid, fechas, netinfo
supabase/
  migrations/               # esquema Postgres versionado (SQL)
```
**Columnas vertebrales:** `domain/` (lógica pura testeable: rachas, "¿toca hoy?", "¿hecho?") y `notifications/` (complejidad concentrada en un sitio).

### 5.3 Flujo de datos
- **Principio:** la UI nunca habla con la red; habla con observables locales, y el sync ocurre por debajo.
- **Lectura:** observables (Legend-State/SQLite) → hooks (derivan "qué toca hoy" con `domain/`) → componentes reactivos.
- **Escritura:** tap → se añade `Completion` al observable (instantáneo) → SQLite local + cola de sync → Supabase en segundo plano (con reintento).
- **Derivados (racha/progreso):** no se escriben; se recalculan al vuelo desde los completions.
- **Notificaciones:** un cambio en observables de `Reminder` (local o por sync) dispara `notifications/reconcile.ts`.

### 5.4 Backend (Supabase)
- Postgres con **Row-Level Security (RLS)**: cada usuario solo ve/edita sus filas (`user_id = auth.uid()`).
- Tablas espejo del modelo con `created_at` / `updated_at` / `deleted` para el sync por diffs.
- Realtime opcional para propagación entre dispositivos.

### 5.5 Autenticación
- **MVP:** email + contraseña (Supabase Auth).
- **Previsto y priorizado:** **Google OAuth** primero; **Apple Sign-In** después.
- ⚠️ **Requisito de App Store:** si la app ofrece un login social de terceros (Google) en iOS, Apple **exige** también ofrecer *Sign in with Apple*. Por tanto, para publicar en iOS con Google, **Apple deja de ser opcional**. Planificar ambos juntos de cara al lanzamiento en iOS.

---

## 6. Decisiones abiertas (pendientes del autor)
1. **Sync definitivo:** confirmar Legend-State tras probarlo en multi-dispositivo real; tener PowerSync como plan B si las aristas molestan.
2. **Identidad visual:** paleta, tipografía y set de iconos (aún sin definir).
3. **Copys de notificación:** ¿mensaje fijo genérico o personalizable por hábito?
4. **`weekStartsOn` por defecto:** lunes o domingo (afecta vistas semanales y cálculo de racha).
5. **Retención de historial:** confirmar que los `Completion` se guardan indefinidamente (probablemente sí; el volumen es pequeño).
6. **Onboarding:** ¿empezar vacío o sugerir 2–3 hábitos de ejemplo?
7. ~~Nombre de la app.~~ **Resuelto: Cotidie** (`cotidie.app`). Verificado sin competencia directa en el nicho de hábitos; único roce menor es una app de diario en turco (otra función, otro mercado). Pendiente solo registrar el dominio y, si se publica formalmente, una búsqueda de marca en el país de publicación.
8. **Cuenta obligatoria desde el inicio** vs. permitir uso local y pedir cuenta al activar sync (el diseño actual asume cuenta desde el arranque por simplicidad de sync).

---

## 7. Roadmap por fases (MVP)

> Orden acordado: primero una app **local usable de punta a punta**; luego **sync como fase aislada**; **gráficas al final** (requieren historial).

**Fase 0 — Cimientos**
Proyecto Expo + Expo Router + estructura de carpetas · Supabase creado + migración inicial del esquema · Legend-State con persistencia SQLite local · tokens de diseño básicos.

**Fase 1 — App local usable (sin nube aún)**
CRUD de hábitos (con tombstone) · pantalla Hoy (pendientes/completados) · marcar/deshacer (log de completions) · `targetPerDay` con sub-items (Opción A) · `domain/scheduling` y `domain/completion` · pantalla Hábitos · estados vacíos.
→ **Hito:** app usable localmente; ya se usa a diario.

**Fase 2 — Rachas y progreso básico**
`domain/streaks` (actual/mejor) · `StreakBadge` en Hoy · pantalla Progreso (racha + % constancia) · Detalle de hábito.
→ **Hito:** motivación visible.

**Fase 3 — Notificaciones**
Permisos + canales (Android) · `scheduler` (Reminder → DAILY/WEEKLY) · `reconcile` · `localSchedule` · UI de recordatorios · presupuesto de slots iOS · pruebas en *dev build* (iPhone físico + Android).
→ **Hito:** recordatorios funcionando en dispositivo real.

**Fase 4 — Nube: auth + sync (fase aislada)**
Supabase Auth (email primero) · stack de auth · activar sync de Legend-State con Supabase · RLS por `user_id` · `SyncStatusChip` + NetInfo · reconciliación de notificaciones tras sync entrante · pruebas multi-dispositivo.
→ **Hito:** offline-first + multi-dispositivo real.

**Fase 5 — Gráficas (cierre del MVP)**
Progreso: gráfica por hábito (barras semanales o heatmap), sobre el historial ya acumulado.
→ **Hito:** MVP completo.

**Backlog post-MVP**
Google OAuth (prioritario) + Apple Sign-In (requerido por App Store si hay Google en iOS) · botones de acción en notificaciones (marcar desde la notificación) · meta numérica real (`unit` + `amount`) · ventana rolling de notificaciones (si se superan 64 en iOS) · helper de optimización de batería (fabricantes Android) · reordenar hábitos, temas, historial tipo calendario.

---

*Fin del documento.*
