import { countCompletions, isDone, pickCompletionToUndo, progress } from './completion';
import type { Completion } from './types';

function makeCompletion(overrides: Partial<Completion>): Completion {
  return {
    id: 'c1',
    habitId: 'h1',
    userId: 'u1',
    date: '2026-07-15',
    completedAt: '2026-07-15T10:00:00.000Z',
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
});
