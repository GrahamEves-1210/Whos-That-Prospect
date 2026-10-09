import { describe, expect, it } from 'vitest';
import { PROSPECTS } from '../src/data/prospects';
import { PINNED_PUZZLES } from '../src/data/prospects';
import { getDailyProspect, getFilmRoomDays, getPracticeProspect, getRotationPool } from '../src/game/daily';
import { mulberry32 } from '../src/game/random';
import {
  formatCountdown,
  getNextResetTime,
  getPuzzleNumber,
  getZonedParts,
  zonedMidnightToUtc,
} from '../src/game/time';

describe('getDailyProspect', () => {
  it('is deterministic for a puzzle number', () => {
    expect(getDailyProspect(7).id).toBe(getDailyProspect(7).id);
    expect(getDailyProspect(1).id).toBe(getDailyProspect(1).id);
  });

  it('serves the pinned prospects on their days', () => {
    for (const [n, id] of Object.entries(PINNED_PUZZLES)) expect(getDailyProspect(Number(n)).id).toBe(id);
  });

  it('cycles through every rotation prospect before repeating', () => {
    const n = getRotationPool().length;
    const ids = new Set<string>();
    for (let i = 20; i < 20 + n; i++) ids.add(getDailyProspect(i).id);
    expect(ids.size).toBe(n);
    expect(getDailyProspect(20 + n).id).toBe(getDailyProspect(20).id);
  });

  it('falls back to rotating the whole pool when every prospect is pinned', () => {
    expect(getRotationPool().length).toBe(PROSPECTS.length);
    expect(() => getDailyProspect(40)).not.toThrow();
  });

  it('gives consecutive days different prospects', () => {
    for (let i = 1; i < PROSPECTS.length; i++) {
      expect(getDailyProspect(i).id).not.toBe(getDailyProspect(i + 1).id);
    }
  });

  it('handles zero and negative puzzle numbers without throwing', () => {
    expect(() => getDailyProspect(0)).not.toThrow();
    expect(() => getDailyProspect(-5)).not.toThrow();
  });
});

describe('getFilmRoomDays', () => {
  it('never lists a prospect twice, or the one from today, and stops at the first repeat', () => {
    for (const today of [2, 8, 12, 30, 200]) {
      const days = getFilmRoomDays(today);
      const ids = [today, ...days].map((n) => getDailyProspect(n).id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(days.length).toBeLessThan(PROSPECTS.length);
      expect(days).toEqual([...days].sort((a, b) => b - a));
    }
  });

  it('never shows a prospect pinned to a later day', () => {
    const upcoming = Object.entries(PINNED_PUZZLES).filter(([d]) => Number(d) > 8).map(([, id]) => id);
    for (const n of getFilmRoomDays(8)) expect(upcoming).not.toContain(getDailyProspect(n).id);
  });

  it('lists the pinned past days', () => {
    expect(getFilmRoomDays(8)).toEqual([7, 6]);
  });
});

describe('getPracticeProspect', () => {
  it('avoids the excluded prospect', () => {
    const rand = mulberry32(42);
    const excluded = PROSPECTS[0].id;
    for (let i = 0; i < 50; i++) {
      expect(getPracticeProspect(excluded, PROSPECTS, rand).id).not.toBe(excluded);
    }
  });
});

describe('Eastern time helpers', () => {
  it('puzzle number is 1 on the epoch date (Eastern)', () => {
    // 2026-10-01 00:30 EDT == 04:30 UTC
    expect(getPuzzleNumber(new Date('2026-10-01T04:30:00Z'))).toBe(1);
    // Still Sept 30 in New York at 03:59 UTC
    expect(getPuzzleNumber(new Date('2026-10-01T03:59:00Z'))).toBe(0);
  });

  it('flips at midnight Eastern, not UTC', () => {
    const beforeMidnightEastern = new Date('2026-10-08T03:59:59Z'); // Oct 7 23:59:59 EDT
    const afterMidnightEastern = new Date('2026-10-08T04:00:00Z'); // Oct 8 00:00:00 EDT
    expect(getPuzzleNumber(afterMidnightEastern)).toBe(getPuzzleNumber(beforeMidnightEastern) + 1);
  });

  it('computes the next reset as the next Eastern midnight', () => {
    const now = new Date('2026-10-07T18:00:00Z'); // Oct 7, 2pm EDT
    const next = getNextResetTime(now);
    expect(new Date(next).toISOString()).toBe('2026-10-08T04:00:00.000Z');
    expect(getZonedParts(new Date(next))).toMatchObject({ month: 10, day: 8, hour: 0, minute: 0 });
  });

  it('handles the DST fall-back night (Nov 1 2026)', () => {
    // Nov 1 2026 02:00 EDT → clocks go back to 01:00 EST. Midnight Nov 2 is 05:00 UTC.
    const now = new Date('2026-11-01T12:00:00Z');
    const next = getNextResetTime(now);
    expect(new Date(next).toISOString()).toBe('2026-11-02T05:00:00.000Z');
  });

  it('handles the DST spring-forward night (Mar 8 2026)', () => {
    const now = new Date('2026-03-08T12:00:00Z');
    const next = getNextResetTime(now);
    // Midnight Mar 9 EDT is 04:00 UTC
    expect(new Date(next).toISOString()).toBe('2026-03-09T04:00:00.000Z');
  });

  it('zonedMidnightToUtc round-trips', () => {
    const ts = zonedMidnightToUtc(2026, 12, 25);
    expect(getZonedParts(new Date(ts))).toMatchObject({ year: 2026, month: 12, day: 25, hour: 0 });
  });

  it('formats countdowns', () => {
    expect(formatCountdown(0)).toBe('00:00:00');
    expect(formatCountdown(-500)).toBe('00:00:00');
    expect(formatCountdown(3_723_000)).toBe('01:02:03');
    expect(formatCountdown(23 * 3600_000 + 59 * 60_000 + 59_000)).toBe('23:59:59');
  });
});
