import { toLocalDateString } from './dates';

describe('toLocalDateString', () => {
  it('formats a local Date as yyyy-MM-dd', () => {
    const date = new Date(2026, 6, 15, 10, 0, 0); // 15 jul 2026, mediodía local
    expect(toLocalDateString(date)).toBe('2026-07-15');
  });

  it('does not shift the day for a late-night local timestamp (the classic UTC-boundary bug)', () => {
    const lateNight = new Date(2026, 6, 15, 23, 59, 0); // 11:59pm local
    expect(toLocalDateString(lateNight)).toBe('2026-07-15');
  });

  it('does not shift the day for an early-morning local timestamp', () => {
    const earlyMorning = new Date(2026, 6, 15, 0, 1, 0); // 12:01am local
    expect(toLocalDateString(earlyMorning)).toBe('2026-07-15');
  });
});
