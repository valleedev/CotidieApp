import { isDaily, isScheduledDay, isScheduledOn, isScheduledToday, weekOrder } from './scheduling';
import type { Weekday } from './types';

describe('isScheduledDay', () => {
  it('returns true when weekday is in daysOfWeek', () => {
    expect(isScheduledDay([1, 3, 5], 3)).toBe(true);
  });

  it('returns false when weekday is not in daysOfWeek', () => {
    expect(isScheduledDay([1, 3, 5], 2)).toBe(false);
  });

  it('returns true for every weekday when daily', () => {
    const daily: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
    for (let d = 0 as Weekday; d <= 6; d++) {
      expect(isScheduledDay(daily, d)).toBe(true);
    }
  });
});

describe('isDaily', () => {
  it('is true when all 7 weekdays are present', () => {
    expect(isDaily([0, 1, 2, 3, 4, 5, 6])).toBe(true);
  });

  it('is false for a subset', () => {
    expect(isDaily([1, 3, 5])).toBe(false);
  });
});

describe('isScheduledOn / isScheduledToday', () => {
  it('matches the date getDay() against daysOfWeek', () => {
    const wednesday = new Date('2026-07-15T12:00:00'); // local, a Wednesday
    expect(isScheduledOn([3], wednesday)).toBe(true);
    expect(isScheduledOn([1, 2], wednesday)).toBe(false);
  });

  it('accepts an injected "now" instead of relying on the system clock', () => {
    const sunday = new Date('2026-07-19T09:00:00');
    expect(isScheduledToday([0], sunday)).toBe(true);
    expect(isScheduledToday([1, 2, 3, 4, 5], sunday)).toBe(false);
  });
});

describe('weekOrder', () => {
  it('starts at the given weekday and wraps around', () => {
    expect(weekOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(weekOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
