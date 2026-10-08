import { PUZZLE_EPOCH, TIME_ZONE } from './config';

const DAY_MS = 86_400_000;

export interface ZonedParts {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = formatterCache.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    formatterCache.set(timeZone, fmt);
  }
  return fmt;
}

/** Wall-clock parts of `date` in the given IANA time zone. */
export function getZonedParts(date: Date, timeZone: string = TIME_ZONE): ZonedParts {
  const parts = getFormatter(timeZone).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number(part.value) : 0;
  };
  let hour = pick('hour');
  if (hour === 24) hour = 0; // some engines report midnight as "24"
  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour,
    minute: pick('minute'),
    second: pick('second'),
  };
}

/**
 * UTC timestamp of wall-clock midnight on the given calendar date in `timeZone`.
 * Two refinement passes handle DST transitions correctly.
 */
export function zonedMidnightToUtc(
  year: number,
  month: number,
  day: number,
  timeZone: string = TIME_ZONE,
): number {
  const wanted = Date.UTC(year, month - 1, day, 0, 0, 0);
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const p = getZonedParts(new Date(guess), timeZone);
    const seen = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    const offset = seen - guess; // zone offset in ms (negative for US zones)
    guess = wanted - offset;
  }
  return guess;
}

/** Days since the Unix epoch for the calendar date currently showing in the game's time zone. */
export function getZonedDayNumber(now: Date = new Date(), timeZone: string = TIME_ZONE): number {
  const p = getZonedParts(now, timeZone);
  return Math.floor(Date.UTC(p.year, p.month - 1, p.day) / DAY_MS);
}

const EPOCH_DAY_NUMBER = Math.floor(
  Date.UTC(PUZZLE_EPOCH.year, PUZZLE_EPOCH.month - 1, PUZZLE_EPOCH.day) / DAY_MS,
);

/** Today's daily puzzle number (1-based). Same for everyone, flips at midnight Eastern. */
export function getPuzzleNumber(now: Date = new Date()): number {
  return getZonedDayNumber(now) - EPOCH_DAY_NUMBER + 1;
}

/** UTC timestamp (ms) of the next midnight in the game's time zone. */
export function getNextResetTime(now: Date = new Date(), timeZone: string = TIME_ZONE): number {
  const p = getZonedParts(now, timeZone);
  // Date.UTC handles month/year overflow for day + 1
  return zonedMidnightToUtc(p.year, p.month, p.day + 1, timeZone);
}

/** "HH:MM:SS" countdown string for a duration in ms (clamped at zero). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Short human date for the header, e.g. "Oct 7" (in the game's time zone). */
/** Compact elapsed time for share text and the leaderboard: "0:42", "12:05", "1:02:09". */
export function formatShortTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** Calendar date of a puzzle number, e.g. "Oct 6". Puzzle #1 is PUZZLE_EPOCH. */
export function formatPuzzleNumberDate(puzzleNumber: number, style: 'short' | 'long' = 'short'): string {
  const { year, month, day } = PUZZLE_EPOCH;
  const d = new Date(Date.UTC(year, month - 1, day + puzzleNumber - 1, 12));
  const opts: Intl.DateTimeFormatOptions =
    style === 'long' ? { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' } : { timeZone: 'UTC', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', opts).format(d);
}

export function formatPuzzleDate(now: Date = new Date(), timeZone: string = TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric' }).format(now);
}
