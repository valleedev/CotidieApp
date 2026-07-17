import {
  activeRemindersOn,
  buildTriggerSpecs,
  computeSlotCount,
  diffReminderDrafts,
  effectiveTargetOn,
  isApproachingIOSLimit,
  resolveReminderDays,
  signatureOf,
  toExpoWeekday,
} from './reminders';
import type { Habit, Reminder, Weekday } from './types';

const baseHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Leer',
  color: '#000',
  icon: 'book',
  category: '',
  daysOfWeek: [1, 3, 5],
  targetPerDay: 1,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

const baseReminder: Reminder = {
  id: 'reminder-1',
  habitId: 'habit-1',
  userId: 'user-1',
  time: '08:00',
  daysOfWeek: null,
  enabled: true,
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('resolveReminderDays', () => {
  it('inherits habit days when reminder.daysOfWeek is null', () => {
    expect(resolveReminderDays(baseReminder, baseHabit)).toEqual([1, 3, 5]);
  });

  it('uses reminder override when present', () => {
    expect(resolveReminderDays({ daysOfWeek: [0, 6] }, baseHabit)).toEqual([0, 6]);
  });
});

describe('toExpoWeekday', () => {
  it('converts JS weekday (0=domingo) to expo weekday (1=domingo)', () => {
    expect(toExpoWeekday(0)).toBe(1);
    expect(toExpoWeekday(6)).toBe(7);
  });
});

describe('buildTriggerSpecs', () => {
  it('produces a single DAILY spec when resolved days cover all 7', () => {
    const daily: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
    const specs = buildTriggerSpecs({ time: '07:30' }, daily);
    expect(specs).toEqual([{ type: 'daily', hour: 7, minute: 30 }]);
  });

  it('produces one WEEKLY spec per day for a subset', () => {
    const specs = buildTriggerSpecs({ time: '08:00' }, [1, 3, 5]);
    expect(specs).toEqual([
      { type: 'weekly', weekdayExpo: 2, hour: 8, minute: 0 },
      { type: 'weekly', weekdayExpo: 4, hour: 8, minute: 0 },
      { type: 'weekly', weekdayExpo: 6, hour: 8, minute: 0 },
    ]);
  });
});

describe('signatureOf', () => {
  it('is stable regardless of day order', () => {
    const a = signatureOf({ time: '08:00', enabled: true }, [5, 1, 3]);
    const b = signatureOf({ time: '08:00', enabled: true }, [1, 3, 5]);
    expect(a).toBe(b);
  });

  it('changes when time, enabled, or days change', () => {
    const base = signatureOf({ time: '08:00', enabled: true }, [1, 3, 5]);
    expect(signatureOf({ time: '09:00', enabled: true }, [1, 3, 5])).not.toBe(base);
    expect(signatureOf({ time: '08:00', enabled: false }, [1, 3, 5])).not.toBe(base);
    expect(signatureOf({ time: '08:00', enabled: true }, [1, 3])).not.toBe(base);
  });
});

describe('computeSlotCount', () => {
  it('counts 1 slot for a daily reminder and N for a partial-week reminder', () => {
    const dailyHabit: Habit = { ...baseHabit, id: 'habit-2', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] };
    const dailyReminder: Reminder = { ...baseReminder, id: 'reminder-2', habitId: 'habit-2' };
    const count = computeSlotCount(
      { [baseReminder.id]: baseReminder, [dailyReminder.id]: dailyReminder },
      { [baseHabit.id]: baseHabit, [dailyHabit.id]: dailyHabit }
    );
    expect(count).toBe(3 + 1); // baseReminder inherits [1,3,5] => 3 slots, dailyReminder => 1 slot
  });

  it('ignores deleted/disabled reminders and orphaned/deleted habits', () => {
    const deletedReminder: Reminder = { ...baseReminder, deletedAt: '2026-02-01T00:00:00.000Z' };
    const disabledReminder: Reminder = { ...baseReminder, id: 'r-disabled', enabled: false };
    const orphanReminder: Reminder = { ...baseReminder, id: 'r-orphan', habitId: 'missing-habit' };
    const count = computeSlotCount(
      {
        [deletedReminder.id]: deletedReminder,
        [disabledReminder.id]: disabledReminder,
        [orphanReminder.id]: orphanReminder,
      },
      { [baseHabit.id]: baseHabit }
    );
    expect(count).toBe(0);
  });
});

describe('isApproachingIOSLimit', () => {
  it('is false below threshold and true at/above it', () => {
    expect(isApproachingIOSLimit(49)).toBe(false);
    expect(isApproachingIOSLimit(50)).toBe(true);
    expect(isApproachingIOSLimit(10, 5)).toBe(true);
  });
});

describe('diffReminderDrafts', () => {
  it('classifies new drafts (no id) as toCreate', () => {
    const diff = diffReminderDrafts('habit-1', [], [
      { time: '08:00', daysOfWeek: null, enabled: true },
    ]);
    expect(diff.toCreate).toEqual([
      { habitId: 'habit-1', time: '08:00', daysOfWeek: null, enabled: true },
    ]);
    expect(diff.toUpdate).toEqual([]);
    expect(diff.toDeleteIds).toEqual([]);
  });

  it('classifies drafts with id as toUpdate', () => {
    const diff = diffReminderDrafts('habit-1', [baseReminder], [
      { id: baseReminder.id, time: '09:00', daysOfWeek: [0], enabled: false },
    ]);
    expect(diff.toUpdate).toEqual([
      { id: baseReminder.id, patch: { time: '09:00', daysOfWeek: [0], enabled: false } },
    ]);
    expect(diff.toDeleteIds).toEqual([]);
  });

  it('classifies existing reminders missing from drafts as toDeleteIds', () => {
    const diff = diffReminderDrafts('habit-1', [baseReminder], []);
    expect(diff.toDeleteIds).toEqual([baseReminder.id]);
  });
});

describe('activeRemindersOn / effectiveTargetOn', () => {
  // baseHabit.daysOfWeek = [1,3,5] (Mon/Wed/Fri). baseReminder inherits (daysOfWeek: null).
  it('includes a reminder that inherits a day the habit is scheduled on', () => {
    expect(activeRemindersOn([baseReminder], baseHabit, 1)).toEqual([baseReminder]);
  });

  it('excludes a reminder on a day not in its resolved days', () => {
    expect(activeRemindersOn([baseReminder], baseHabit, 2)).toEqual([]);
  });

  it('excludes disabled reminders', () => {
    const disabled: Reminder = { ...baseReminder, enabled: false };
    expect(activeRemindersOn([disabled], baseHabit, 1)).toEqual([]);
  });

  it('excludes soft-deleted reminders', () => {
    const deleted: Reminder = { ...baseReminder, deletedAt: '2026-02-01T00:00:00.000Z' };
    expect(activeRemindersOn([deleted], baseHabit, 1)).toEqual([]);
  });

  it('effectiveTargetOn returns the count of active reminders, ignoring targetPerDay', () => {
    const second: Reminder = { ...baseReminder, id: 'reminder-2' };
    expect(effectiveTargetOn(baseHabit, [baseReminder, second], 1)).toBe(2);
  });

  it('effectiveTargetOn falls back to targetPerDay when no reminder is active that day', () => {
    const customDayReminder: Reminder = { ...baseReminder, daysOfWeek: [2] }; // Tuesday only
    expect(effectiveTargetOn(baseHabit, [customDayReminder], 1)).toBe(baseHabit.targetPerDay);
  });
});
