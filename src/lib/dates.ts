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
