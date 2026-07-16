export type ID = string; // UUID v4, generado en cliente
export type ISODate = string; // 'YYYY-MM-DD' → día LOCAL del hábito
export type ISOTimestamp = string; // instante UTC
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo (estilo JS Date)

export interface Habit {
  id: ID;
  userId: ID;
  name: string;
  color: string;
  icon: string;
  daysOfWeek: Weekday[]; // fuente única de verdad. Diario = los 7 días
  targetPerDay: number;
  sortOrder: number;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  deletedAt: ISOTimestamp | null;
}

export interface Completion {
  id: ID;
  habitId: ID;
  userId: ID;
  date: ISODate; // día LOCAL al que cuenta (clave anti-timezone)
  completedAt: ISOTimestamp; // instante real del tap
  reminderId: ID | null; // null = completado genérico (sin recordatorio específico)
  updatedAt: ISOTimestamp;
  deletedAt: ISOTimestamp | null; // "deshacer" que debe sincronizar
}

export interface Reminder {
  id: ID;
  habitId: ID;
  userId: ID;
  time: string; // 'HH:mm' local
  daysOfWeek: Weekday[] | null; // null = hereda los días del hábito
  enabled: boolean;
  updatedAt: ISOTimestamp;
  deletedAt: ISOTimestamp | null;
}

// SOLO local. NUNCA sincroniza (ids del SO, distintos por dispositivo).
export interface LocalReminderSchedule {
  reminderId: ID;
  osNotificationIds: string[];
}

export interface Settings {
  userId: ID;
  weekStartsOn: Weekday;
  theme: 'system' | 'light' | 'dark';
  displayName: string; // local, usado en el saludo de "Hoy"
  updatedAt: ISOTimestamp;
}
