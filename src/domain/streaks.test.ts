import { bestStreak, consistency30d, currentStreak } from './streaks';
import type { Completion, Habit, Reminder, Weekday } from './types';
import { toLocalDateString } from '../lib/dates';

function makeReminder(overrides: Partial<Reminder>): Reminder {
  return {
    id: 'r1',
    habitId: 'h1',
    userId: 'u1',
    time: '08:00',
    daysOfWeek: null,
    enabled: true,
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

function makeHabit(overrides: Partial<Habit>): Habit {
  return {
    id: 'h1',
    userId: 'u1',
    name: 'Test habit',
    color: '#000000',
    icon: 'star',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    targetPerDay: 1,
    sortOrder: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

let completionSeq = 0;

function makeCompletion(date: string, overrides: Partial<Completion> = {}): Completion {
  completionSeq += 1;
  return {
    id: `c${completionSeq}`,
    habitId: 'h1',
    userId: 'u1',
    date,
    completedAt: `${date}T10:00:00.000Z`,
    reminderId: null,
    updatedAt: `${date}T10:00:00.000Z`,
    deletedAt: null,
    ...overrides,
  };
}

function completionsForDates(dates: string[]): Completion[] {
  return dates.map((date) => makeCompletion(date));
}

const MON_WED_FRI: Weekday[] = [1, 3, 5];

describe('currentStreak', () => {
  it('does not break when today is scheduled but still pending, but does not count it either', () => {
    const habit = makeHabit({ createdAt: '2026-06-01T00:00:00.000Z' });
    const completions = completionsForDates(['2026-07-13', '2026-07-14', '2026-07-15']);
    const now = new Date('2026-07-16T09:00:00'); // Thursday, not marked yet
    expect(currentStreak(habit, [], completions, now)).toBe(3);
  });

  it('counts today when it has already been marked done', () => {
    const habit = makeHabit({ createdAt: '2026-06-01T00:00:00.000Z' });
    const completions = completionsForDates(['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16']);
    const now = new Date('2026-07-16T09:00:00');
    expect(currentStreak(habit, [], completions, now)).toBe(4);
  });

  it('stops at a missed scheduled day', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z' });
    // 2026-07-11 (scheduled, daily) is missing between the two runs.
    const completions = completionsForDates(['2026-07-12', '2026-07-13', '2026-07-14']);
    const now = new Date('2026-07-14T09:00:00');
    expect(currentStreak(habit, [], completions, now)).toBe(3);
  });

  it('is not broken by a non-scheduled day in between', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z', daysOfWeek: MON_WED_FRI });
    // Mon 07-13 and Wed 07-15 done; Tue 07-14 is not a scheduled day.
    const completions = completionsForDates(['2026-07-13', '2026-07-15']);
    const now = new Date('2026-07-15T09:00:00'); // Wednesday
    expect(currentStreak(habit, [], completions, now)).toBe(2);
  });

  it('is 0 when the habit has no scheduled days', () => {
    const habit = makeHabit({ daysOfWeek: [] });
    const now = new Date('2026-07-16T09:00:00');
    expect(currentStreak(habit, [], [], now)).toBe(0);
  });

  it('is 1 for a habit created today with a completion today', () => {
    const habit = makeHabit({ createdAt: '2026-07-16T00:00:00.000Z' });
    const completions = completionsForDates(['2026-07-16']);
    const now = new Date('2026-07-16T09:00:00');
    expect(currentStreak(habit, [], completions, now)).toBe(1);
  });

  it('does not count a soft-deleted completion', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z' });
    const completions = [
      makeCompletion('2026-07-14'), // active
      makeCompletion('2026-07-15', { deletedAt: '2026-07-15T12:00:00.000Z' }), // undone
    ];
    const now = new Date('2026-07-16T09:00:00'); // today pending, trimmed
    expect(currentStreak(habit, [], completions, now)).toBe(0);
  });
});

describe('bestStreak', () => {
  it('keeps the historical best even after the streak breaks', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z' });
    const completions = completionsForDates([
      '2026-07-05',
      '2026-07-06',
      '2026-07-07',
      '2026-07-08',
      '2026-07-09',
    ]);
    const now = new Date('2026-07-16T09:00:00'); // gap since 07-09, today pending
    expect(bestStreak(habit, [], completions, now)).toBe(5);
    expect(currentStreak(habit, [], completions, now)).toBe(0);
  });

  it('is not inflated or deflated by non-scheduled days for a 3x/week habit', () => {
    const habit = makeHabit({ createdAt: '2026-06-01T00:00:00.000Z', daysOfWeek: MON_WED_FRI });
    const completions = completionsForDates([
      '2026-06-29',
      '2026-07-01',
      '2026-07-03',
      '2026-07-06',
      '2026-07-08',
      '2026-07-10',
      '2026-07-13',
      '2026-07-15',
      '2026-07-17',
    ]);
    const now = new Date('2026-07-18T09:00:00'); // Saturday, not scheduled
    expect(bestStreak(habit, [], completions, now)).toBe(9);
  });

  it('is 0 with no completions', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z' });
    const now = new Date('2026-07-16T09:00:00');
    expect(bestStreak(habit, [], [], now)).toBe(0);
  });
});

describe('consistency30d', () => {
  it('is 0.5 for a daily habit done 15 of the last 30 days', () => {
    const habit = makeHabit({ createdAt: '2025-01-01T00:00:00.000Z' });
    // Window is 2026-06-17..2026-07-16 (30 days); mark the first 15.
    const dates: string[] = [];
    const start = new Date('2026-06-17T00:00:00');
    for (let i = 0; i < 15; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(toLocalDateString(d));
    }
    const now = new Date('2026-07-16T09:00:00');
    expect(consistency30d(habit, [], completionsForDates(dates), now)).toBe(0.5);
  });

  it('uses only scheduled days as the denominator for a 3x/week habit', () => {
    const habit = makeHabit({ createdAt: '2025-01-01T00:00:00.000Z', daysOfWeek: MON_WED_FRI });
    // Mon/Wed/Fri within 2026-06-17..2026-07-16: 13 scheduled days total.
    const scheduledInWindow = [
      '2026-06-17',
      '2026-06-19',
      '2026-06-22',
      '2026-06-24',
      '2026-06-26',
      '2026-06-29',
      '2026-07-01',
      '2026-07-03',
      '2026-07-06',
      '2026-07-08',
      '2026-07-10',
      '2026-07-13',
      '2026-07-15',
    ];
    expect(scheduledInWindow).toHaveLength(13);
    const doneHalf = scheduledInWindow.slice(0, 6);
    const now = new Date('2026-07-16T09:00:00');
    expect(consistency30d(habit, [], completionsForDates(doneHalf), now)).toBeCloseTo(6 / 13);
  });

  it('clamps the window to the habit creation date instead of diluting with pre-creation days', () => {
    const habit = makeHabit({ createdAt: '2026-07-07T12:00:00.000Z' });
    const dates: string[] = [];
    const start = new Date('2026-07-07T00:00:00');
    for (let i = 0; i < 10; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(toLocalDateString(d));
    }
    const now = new Date('2026-07-16T09:00:00');
    expect(consistency30d(habit, [], completionsForDates(dates), now)).toBe(1);
  });

  it('is null when the habit has no scheduled days', () => {
    const habit = makeHabit({ daysOfWeek: [] });
    const now = new Date('2026-07-16T09:00:00');
    expect(consistency30d(habit, [], [], now)).toBeNull();
  });

  it('counts today as-is, unlike currentStreak which trims a pending today', () => {
    const habit = makeHabit({ createdAt: '2025-01-01T00:00:00.000Z' });
    const dates: string[] = [];
    const start = new Date('2026-06-17T00:00:00');
    for (let i = 0; i < 29; i++) {
      // every day in the window except today (2026-07-16)
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(toLocalDateString(d));
    }
    const now = new Date('2026-07-16T09:00:00');
    expect(consistency30d(habit, [], completionsForDates(dates), now)).toBeCloseTo(29 / 30);
  });
});

describe('reminder-aware effective target', () => {
  it('currentStreak requires one completion per active reminder, ignoring targetPerDay', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z', targetPerDay: 1 });
    const reminders = [makeReminder({ id: 'r1' }), makeReminder({ id: 'r2' })];
    const now = new Date('2026-07-15T09:00:00');
    // Only one of the two reminders done on 07-14 → that day should NOT count as complete.
    const completions = [
      makeCompletion('2026-07-14', { reminderId: 'r1' }),
      makeCompletion('2026-07-13', { reminderId: 'r1' }),
      makeCompletion('2026-07-13', { reminderId: 'r2' }),
    ];
    // 07-13 fully done (both reminders), 07-14 only half done → breaks the streak at 07-14.
    expect(currentStreak(habit, reminders, completions, now)).toBe(0);
  });

  it('currentStreak counts a day where all active reminders got their own completion', () => {
    const habit = makeHabit({ createdAt: '2026-07-13T00:00:00.000Z', targetPerDay: 1 });
    const reminders = [makeReminder({ id: 'r1' }), makeReminder({ id: 'r2' })];
    const now = new Date('2026-07-13T09:00:00');
    const completions = [
      makeCompletion('2026-07-13', { reminderId: 'r1' }),
      makeCompletion('2026-07-13', { reminderId: 'r2' }),
    ];
    expect(currentStreak(habit, reminders, completions, now)).toBe(1);
  });

  it('falls back to targetPerDay + generic completions when no reminders are active', () => {
    const habit = makeHabit({ createdAt: '2026-07-13T00:00:00.000Z', targetPerDay: 1 });
    const now = new Date('2026-07-13T09:00:00');
    const completions = [makeCompletion('2026-07-13', { reminderId: null })];
    expect(currentStreak(habit, [], completions, now)).toBe(1);
  });
});
