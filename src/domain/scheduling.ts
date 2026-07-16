import type { Weekday } from './types';

export function isScheduledDay(daysOfWeek: Weekday[], weekday: Weekday): boolean {
  return daysOfWeek.includes(weekday);
}

export function isScheduledOn(daysOfWeek: Weekday[], date: Date): boolean {
  return isScheduledDay(daysOfWeek, date.getDay() as Weekday);
}

export function isScheduledToday(daysOfWeek: Weekday[], now: Date = new Date()): boolean {
  return isScheduledOn(daysOfWeek, now);
}

export function isDaily(daysOfWeek: Weekday[]): boolean {
  return daysOfWeek.length === 7;
}
