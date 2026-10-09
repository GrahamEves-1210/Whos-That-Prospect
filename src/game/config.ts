/** Game-wide constants. */

export const GAME_TITLE = "Who's That Prospect?";
export const SITE_URL = 'whosthatprospect.com';

export const MAX_GUESSES = 5;

/** Daily puzzles reset at midnight in this time zone. */
export const TIME_ZONE = 'America/New_York';

/** Calendar date (in TIME_ZONE) of puzzle #1. */
export const PUZZLE_EPOCH = { year: 2026, month: 10, day: 1 };

/** Seed for the deterministic prospect rotation. Changing it reshuffles every day. */
export const ROTATION_SEED = 0x7a5e3d;

export const STORAGE_KEYS = {
  game: 'wtp:daily-game:v1',
  stats: 'wtp:stats:v1',
  seenHowTo: 'wtp:seen-how-to:v1',
} as const;

/** Typo forgiveness: guesses within this many edits of a long name count. */
export const TYPO_TOLERANCE = 1;
/** Only apply typo forgiveness to names at least this long (normalized). */
export const TYPO_MIN_LENGTH = 9;
