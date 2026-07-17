import { computeWeeklyProgress } from './weeklyProgress';
import type { Completion, Habit, Reminder } from './types';

const MONDAY = 1;

function makeHabit(overrides: Partial<Habit>): Habit {
  return {
    id: 'h1',
    userId: 'u1',
    name: 'Test habit',
    color: '#000000',
    icon: 'star',
    category: '',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    targetPerDay: 1,
    sortOrder: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

let seq = 0;
function makeCompletion(habitId: string, date: string, overrides: Partial<Completion> = {}): Completion {
  seq += 1;
  return {
    id: `c${seq}`,
    habitId,
    userId: 'u1',
    date,
    completedAt: `${date}T10:00:00.000Z`,
    reminderId: null,
    updatedAt: `${date}T10:00:00.000Z`,
    deletedAt: null,
    ...overrides,
  };
}

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

describe('computeWeeklyProgress', () => {
  // Week of 2026-07-13 (Mon) .. 2026-07-19 (Sun), "now" = Wed 2026-07-15.
  const now = new Date('2026-07-15T12:00:00');

  it('counts fully completed days up through today, excludes future days from the ratio', () => {
    const habit = makeHabit({ createdAt: '2026-01-01T00:00:00.000Z' });
    const completions = [
      makeCompletion('h1', '2026-07-13'),
      makeCompletion('h1', '2026-07-14'),
      // 07-15 (today) not done yet
    ];
    const result = computeWeeklyProgress([habit], [], completions, MONDAY, now);
    expect(result.totalCount).toBe(3); // Mon, Tue, Wed (today) — Thu-Sun are future
    expect(result.completedCount).toBe(2); // Mon, Tue done; Wed not
    const wed = result.days.find((d) => d.date === '2026-07-15')!;
    expect(wed.isToday).toBe(true);
    expect(wed.isFullyCompleted).toBe(false);
    const thu = result.days.find((d) => d.date === '2026-07-16')!;
    expect(thu.isFuture).toBe(true);
  });

  it('excludes a day with zero scheduled habits from both numerator and denominator', () => {
    const habit = makeHabit({ createdAt: '2026-01-01T00:00:00.000Z', daysOfWeek: [1] }); // Monday only
    const result = computeWeeklyProgress([habit], [], [makeCompletion('h1', '2026-07-13')], MONDAY, now);
    // Only Monday is scheduled; Tue/Wed have zero scheduled habits and are excluded.
    expect(result.totalCount).toBe(1);
    expect(result.completedCount).toBe(1);
    const tue = result.days.find((d) => d.date === '2026-07-14')!;
    expect(tue.hasScheduledHabits).toBe(false);
  });

  it('excludes days before the habit was created', () => {
    const habit = makeHabit({ createdAt: '2026-07-14T12:00:00.000Z' }); // created Tuesday noon UTC
    const result = computeWeeklyProgress([habit], [], [], MONDAY, now);
    expect(result.totalCount).toBe(2); // only Tue + Wed count, Mon excluded (pre-creation)
  });

  it('uses effectiveTargetOn (reminder count) instead of targetPerDay when reminders are active', () => {
    const habit = makeHabit({ createdAt: '2026-01-01T00:00:00.000Z', targetPerDay: 1 });
    const reminders = [makeReminder({ id: 'r1' }), makeReminder({ id: 'r2' })];
    // Only one of two reminders done on Monday -> should not count as fully completed.
    const completions = [makeCompletion('h1', '2026-07-13', { reminderId: 'r1' })];
    const result = computeWeeklyProgress([habit], reminders, completions, MONDAY, now);
    const mon = result.days.find((d) => d.date === '2026-07-13')!;
    expect(mon.isFullyCompleted).toBe(false);
  });

  it('always returns exactly 7 days ordered starting at weekStartsOn', () => {
    const result = computeWeeklyProgress([], [], [], MONDAY, now);
    expect(result.days).toHaveLength(7);
    expect(result.days.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });
});
