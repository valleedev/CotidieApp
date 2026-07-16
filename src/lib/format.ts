import { isDaily } from '../domain/scheduling';
import type { Weekday } from '../domain/types';

const SHORT_LABELS: Record<Weekday, string> = {
  0: 'D',
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
  6: 'S',
};

export function formatDaysOfWeek(daysOfWeek: Weekday[]): string {
  if (isDaily(daysOfWeek)) return 'Diario';
  const sorted = [...daysOfWeek].sort((a, b) => a - b);
  return sorted.map((d) => SHORT_LABELS[d]).join('·');
}

export function weekdayLetter(weekday: Weekday): string {
  return SHORT_LABELS[weekday];
}

export function formatDayPart(time: string): 'Mañana' | 'Tarde' {
  const [hour] = time.split(':').map(Number);
  return hour < 13 ? 'Mañana' : 'Tarde';
}
