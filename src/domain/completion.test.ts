import {
  completionsForReminder,
  countCompletedReminders,
  countCompletions,
  isDone,
  isReminderDone,
  pickCompletionToUndo,
  progress,
} from './completion';
import type { Completion } from './types';

function makeCompletion(overrides: Partial<Completion>): Completion {
  return {
    id: 'c1',
    habitId: 'h1',
    userId: 'u1',
    date: '2026-07-15',
    completedAt: '2026-07-15T10:00:00.000Z',
    reminderId: null,
    updatedAt: '2026-07-15T10:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

describe('countCompletions', () => {
  it('excludes soft-deleted completions', () => {
    const completions = [
      makeCompletion({ id: 'c1', deletedAt: null }),
      makeCompletion({ id: 'c2', deletedAt: '2026-07-15T11:00:00.000Z' }),
    ];
    expect(countCompletions(completions, 'h1', '2026-07-15')).toBe(1);
  });

  it('excludes completions from other habits or other dates', () => {
    const completions = [
      makeCompletion({ id: 'c1', habitId: 'h1', date: '2026-07-15' }),
      makeCompletion({ id: 'c2', habitId: 'h2', date: '2026-07-15' }),
      makeCompletion({ id: 'c3', habitId: 'h1', date: '2026-07-14' }),
    ];
    expect(countCompletions(completions, 'h1', '2026-07-15')).toBe(1);
  });
});

describe('isDone', () => {
  it('is false below target', () => {
    expect(isDone(1, 2)).toBe(false);
  });

  it('is true exactly at target', () => {
    expect(isDone(2, 2)).toBe(true);
  });

  it('is true above target', () => {
    expect(isDone(3, 2)).toBe(true);
  });
});

describe('progress', () => {
  it('is a fraction below target', () => {
    expect(progress(1, 2)).toBe(0.5);
  });

  it('clamps at 1 when count exceeds target', () => {
    expect(progress(5, 2)).toBe(1);
  });

  it('guards against targetPerDay <= 0', () => {
    expect(progress(0, 0)).toBe(0);
    expect(progress(1, 0)).toBe(1);
  });
});

describe('pickCompletionToUndo', () => {
  it('returns undefined when there is nothing to undo', () => {
    expect(pickCompletionToUndo([], 'h1', '2026-07-15')).toBeUndefined();
  });

  it('picks the completion with the latest completedAt among active matches', () => {
    const completions = [
      makeCompletion({ id: 'earlier', completedAt: '2026-07-15T08:00:00.000Z' }),
      makeCompletion({ id: 'latest', completedAt: '2026-07-15T20:00:00.000Z' }),
      makeCompletion({ id: 'other-habit', habitId: 'h2', completedAt: '2026-07-15T23:00:00.000Z' }),
    ];
    expect(pickCompletionToUndo(completions, 'h1', '2026-07-15')?.id).toBe('latest');
  });

  it('ignores already soft-deleted completions', () => {
    const completions = [
      makeCompletion({ id: 'deleted', completedAt: '2026-07-15T20:00:00.000Z', deletedAt: '2026-07-15T21:00:00.000Z' }),
      makeCompletion({ id: 'active', completedAt: '2026-07-15T09:00:00.000Z' }),
    ];
    expect(pickCompletionToUndo(completions, 'h1', '2026-07-15')?.id).toBe('active');
  });

  it('only considers completions from the matching reminderId when one is passed', () => {
    const completions = [
      makeCompletion({ id: 'generic', reminderId: null, completedAt: '2026-07-15T09:00:00.000Z' }),
      makeCompletion({ id: 'r1', reminderId: 'rem-1', completedAt: '2026-07-15T10:00:00.000Z' }),
      makeCompletion({ id: 'r2', reminderId: 'rem-2', completedAt: '2026-07-15T11:00:00.000Z' }),
    ];
    expect(pickCompletionToUndo(completions, 'h1', '2026-07-15', 'rem-1')?.id).toBe('r1');
    expect(pickCompletionToUndo(completions, 'h1', '2026-07-15')?.id).toBe('generic');
  });

  it('finds legacy completions missing the reminderId key at all (pre-migration data)', () => {
    const legacy = makeCompletion({ id: 'legacy' }) as Partial<Completion>;
    delete legacy.reminderId;
    const completions = [legacy as Completion];
    expect(pickCompletionToUndo(completions, 'h1', '2026-07-15')?.id).toBe('legacy');
  });
});

describe('completionsForReminder / isReminderDone / countCompletedReminders', () => {
  it('matches completions tied to a specific reminder', () => {
    const completions = [
      makeCompletion({ id: 'r1', reminderId: 'rem-1' }),
      makeCompletion({ id: 'r2', reminderId: 'rem-2' }),
      makeCompletion({ id: 'generic', reminderId: null }),
    ];
    expect(completionsForReminder(completions, 'h1', '2026-07-15', 'rem-1')).toHaveLength(1);
    expect(isReminderDone(completions, 'h1', '2026-07-15', 'rem-1')).toBe(true);
    expect(isReminderDone(completions, 'h1', '2026-07-15', 'rem-3')).toBe(false);
  });

  it('ignores soft-deleted completions for a reminder', () => {
    const completions = [
      makeCompletion({ id: 'r1', reminderId: 'rem-1', deletedAt: '2026-07-15T12:00:00.000Z' }),
    ];
    expect(isReminderDone(completions, 'h1', '2026-07-15', 'rem-1')).toBe(false);
  });

  it('counts how many of the given reminders have a completion', () => {
    const completions = [
      makeCompletion({ id: 'r1', reminderId: 'rem-1' }),
      makeCompletion({ id: 'r2', reminderId: 'rem-2' }),
    ];
    expect(countCompletedReminders(completions, 'h1', '2026-07-15', ['rem-1', 'rem-2', 'rem-3'])).toBe(2);
  });

  it('treats legacy completions without a reminderId key as not matching any reminder', () => {
    const legacy = makeCompletion({ id: 'legacy' }) as Partial<Completion>;
    delete legacy.reminderId;
    const completions = [legacy as Completion];
    expect(isReminderDone(completions, 'h1', '2026-07-15', 'rem-1')).toBe(false);
  });
});
