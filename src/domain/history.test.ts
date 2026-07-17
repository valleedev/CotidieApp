import { computeHabitHistory } from './history';
import type { Completion, Habit, Reminder, Weekday } from './types';

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

const MON_WED_FRI: Weekday[] = [1, 3, 5];

describe('computeHabitHistory', () => {
  it('produces exactly weeks*7 days aligned to weekStartsOn', () => {
    const habit = makeHabit({ createdAt: '2025-01-01T00:00:00.000Z' });
    const now = new Date('2026-07-16T09:00:00'); // Thursday
    const historyMonday = computeHabitHistory(habit, [], [], 4, 1, now);
    const historySunday = computeHabitHistory(habit, [], [], 4, 0, now);

    expect(historyMonday.days).toHaveLength(28);
    expect(historyMonday.days[0].weekday).toBe(1);
    expect(historySunday.days).toHaveLength(28);
    expect(historySunday.days[0].weekday).toBe(0);
  });

  it('marks days before habit creation as not existed, excluded from the ratio', () => {
    const habit = makeHabit({ createdAt: '2026-07-10T00:00:00.000Z' });
    const now = new Date('2026-07-16T09:00:00'); // Thursday
    const history = computeHabitHistory(habit, [], [], 3, 1, now);

    const beforeCreation = history.days.find((d) => d.date === '2026-07-05');
    const afterCreation = history.days.find((d) => d.date === '2026-07-10');

    expect(beforeCreation?.existed).toBe(false);
    expect(beforeCreation?.ratio).toBe(0);
    expect(afterCreation?.existed).toBe(true);
  });

  it('marks non-scheduled days as scheduled:false with ratio 0, never counted as failure', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z', daysOfWeek: MON_WED_FRI });
    const now = new Date('2026-07-16T09:00:00'); // Thursday
    const history = computeHabitHistory(habit, [], [], 2, 1, now);

    // Tuesday 2026-07-14 is not scheduled for a Mon/Wed/Fri habit.
    const tuesday = history.days.find((d) => d.date === '2026-07-14');
    expect(tuesday?.scheduled).toBe(false);
    expect(tuesday?.ratio).toBe(0);
  });

  it('marks future days as isFuture:true with ratio 0', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z' });
    const now = new Date('2026-07-16T09:00:00'); // Thursday
    const history = computeHabitHistory(habit, [], [], 2, 1, now);

    const tomorrow = history.days.find((d) => d.date === '2026-07-17');
    expect(tomorrow?.isFuture).toBe(true);
    expect(tomorrow?.ratio).toBe(0);
  });

  it('computes a partial ratio for targetPerDay > 1', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z', targetPerDay: 2 });
    const now = new Date('2026-07-16T09:00:00');
    const completions = [makeCompletion('2026-07-15')]; // only 1 of 2
    const history = computeHabitHistory(habit, [], completions, 2, 1, now);

    const day = history.days.find((d) => d.date === '2026-07-15');
    expect(day?.count).toBe(1);
    expect(day?.target).toBe(2);
    expect(day?.ratio).toBe(0.5);
  });

  it('gives ratio 1 for a fully completed day', () => {
    const habit = makeHabit({ createdAt: '2026-07-01T00:00:00.000Z' });
    const now = new Date('2026-07-16T09:00:00');
    const completions = [makeCompletion('2026-07-15')];
    const history = computeHabitHistory(habit, [], completions, 2, 1, now);

    const day = history.days.find((d) => d.date === '2026-07-15');
    expect(day?.ratio).toBe(1);
  });

  it('counts reminder-scoped completions instead of generic ones when reminders are active', () => {
    const habit = makeHabit({ createdAt: '2026-07-13T00:00:00.000Z', targetPerDay: 1 });
    const reminders = [makeReminder({ id: 'r1' }), makeReminder({ id: 'r2' })];
    const now = new Date('2026-07-14T09:00:00');
    const completions = [
      makeCompletion('2026-07-13', { reminderId: 'r1' }),
      makeCompletion('2026-07-13', { reminderId: 'r2' }),
    ];
    const history = computeHabitHistory(habit, reminders, completions, 1, 1, now);

    const day = history.days.find((d) => d.date === '2026-07-13');
    expect(day?.count).toBe(2);
    expect(day?.target).toBe(2);
    expect(day?.ratio).toBe(1);
  });
});
