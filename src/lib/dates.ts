import { format } from 'date-fns';
import type { ISODate, ISOTimestamp } from '../domain/types';

// LOCAL, no UTC — evita el bug de marcas cerca de medianoche cayendo en el día equivocado.
export function toLocalDateString(date: Date): ISODate {
  return format(date, 'yyyy-MM-dd');
}

export function todayLocalDateString(): ISODate {
  return toLocalDateString(new Date());
}

export function nowIso(): ISOTimestamp {
  return new Date().toISOString();
}

export function formatRelativeShort(timestampMs?: number): string {
  if (!timestampMs) return 'nunca';
  const minutes = Math.floor((Date.now() - timestampMs) / 60000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}
