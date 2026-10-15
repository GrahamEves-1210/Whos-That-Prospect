import { MAX_GUESSES, STORAGE_KEYS } from './config';
import type { GameState, Stats } from './types';

/** Minimal Storage interface so logic can be tested without a browser. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** In-memory fallback used when localStorage is unavailable (private mode, SSR, tests). */
export function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

let fallback: StorageLike | null = null;

export function getDefaultStorage(): StorageLike {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const probe = '__wtp_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    }
  } catch {
    // fall through to memory storage
  }
  if (!fallback) fallback = createMemoryStorage();
  return fallback;
}

function readJson<T>(storage: StorageLike, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(storage: StorageLike, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded / disabled — the game still works for this session
  }
}

// ---------- game state ----------

function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.puzzleNumber === 'number' &&
    typeof v.prospectId === 'string' &&
    Array.isArray(v.guesses) &&
    v.guesses.every((g) => typeof g === 'string') &&
    (v.status === 'playing' || v.status === 'won' || v.status === 'lost')
  );
}

/** Persist the daily game. Practice/preview games are never saved. */
export function saveGameState(state: GameState, storage: StorageLike = getDefaultStorage()): void {
  if (state.mode !== 'daily') return;
  writeJson(storage, STORAGE_KEYS.game, state);
}

/**
 * Load the saved daily game, but only if it belongs to `expectedPuzzleNumber`
 * and the same prospect — otherwise it's yesterday's game and we start fresh.
 */
export function loadGameState(
  expectedPuzzleNumber: number,
  expectedProspectId: string,
  storage: StorageLike = getDefaultStorage(),
): GameState | null {
  const saved = readJson<unknown>(storage, STORAGE_KEYS.game);
  if (!isValidGameState(saved)) return null;
  if (saved.puzzleNumber !== expectedPuzzleNumber) return null;
  if (saved.prospectId !== expectedProspectId) return null;
  return { ...saved, mode: 'daily' };
}

export function clearGameState(storage: StorageLike = getDefaultStorage()): void {
  try {
    storage.removeItem(STORAGE_KEYS.game);
  } catch {
    /* ignore */
  }
}

// ---------- stats ----------

export function createEmptyStats(): Stats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: new Array<number>(MAX_GUESSES).fill(0),
    lastCompletedPuzzle: null,
  };
}

export function loadStats(storage: StorageLike = getDefaultStorage()): Stats {
  return normalizeStats(readJson<Partial<Stats>>(storage, STORAGE_KEYS.stats));
}

/**
 * Clean up stats from storage or another device. If they were saved when the game allowed more
 * guesses (it used to be 6), wins on those extra guesses fold into the last bar so nothing is lost.
 */
export function normalizeStats(saved: Partial<Stats> | null | undefined): Stats {
  const empty = createEmptyStats();
  if (!saved || typeof saved !== 'object') return empty;
  const dist = Array.isArray(saved.guessDistribution)
    ? saved.guessDistribution.map((n) => (typeof n === 'number' && n >= 0 ? n : 0))
    : [];
  while (dist.length < MAX_GUESSES) dist.push(0);
  if (dist.length > MAX_GUESSES) {
    const extra = dist.splice(MAX_GUESSES).reduce((a, b) => a + b, 0);
    dist[MAX_GUESSES - 1] += extra;
  }
  return {
    played: typeof saved.played === 'number' ? saved.played : 0,
    wins: typeof saved.wins === 'number' ? saved.wins : 0,
    currentStreak: typeof saved.currentStreak === 'number' ? saved.currentStreak : 0,
    maxStreak: typeof saved.maxStreak === 'number' ? saved.maxStreak : 0,
    guessDistribution: dist.slice(0, MAX_GUESSES),
    lastCompletedPuzzle:
      typeof saved.lastCompletedPuzzle === 'number' ? saved.lastCompletedPuzzle : null,
  };
}

export function saveStats(stats: Stats, storage: StorageLike = getDefaultStorage()): void {
  writeJson(storage, STORAGE_KEYS.stats, stats);
}

export interface ResultRecord {
  puzzleNumber: number;
  won: boolean;
  /** Number of guesses used (1 to MAX_GUESSES). Required when `won` is true. */
  guessCount: number;
}

/**
 * Pure: fold a finished daily game into the stats.
 * Streaks continue only when the previous completed puzzle was yesterday's and was won.
 * Each day counts once: a day already recorded (or an older one) leaves the stats unchanged.
 */
export function recordResult(stats: Stats, result: ResultRecord): Stats {
  if (stats.lastCompletedPuzzle != null && result.puzzleNumber <= stats.lastCompletedPuzzle) return stats;
  const next: Stats = {
    ...stats,
    guessDistribution: [...stats.guessDistribution],
  };
  next.played += 1;
  if (result.won) {
    next.wins += 1;
    const idx = Math.min(Math.max(result.guessCount, 1), MAX_GUESSES) - 1;
    next.guessDistribution[idx] += 1;
    const continues =
      stats.lastCompletedPuzzle === result.puzzleNumber - 1 && stats.currentStreak > 0;
    next.currentStreak = continues ? stats.currentStreak + 1 : 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
  } else {
    next.currentStreak = 0;
  }
  next.lastCompletedPuzzle = result.puzzleNumber;
  return next;
}

/** Current streak, treating a missed day as a broken streak when displaying. */
export function getDisplayStreak(stats: Stats, todayPuzzleNumber: number): number {
  if (stats.lastCompletedPuzzle == null) return 0;
  // Streak is intact if the last completion was today or yesterday.
  if (todayPuzzleNumber - stats.lastCompletedPuzzle <= 1) return stats.currentStreak;
  return 0;
}

// ---------- misc flags ----------

export function hasSeenHowToPlay(storage: StorageLike = getDefaultStorage()): boolean {
  try {
    return storage.getItem(STORAGE_KEYS.seenHowTo) === '1';
  } catch {
    return true;
  }
}

export function markHowToPlaySeen(storage: StorageLike = getDefaultStorage()): void {
  try {
    storage.setItem(STORAGE_KEYS.seenHowTo, '1');
  } catch {
    /* ignore */
  }
}

/** Anonymous id for this browser, created once (used only to count each device once per day in play stats). */
export function getClientId(storage: StorageLike = getDefaultStorage()): string {
  try {
    const saved = storage.getItem(STORAGE_KEYS.clientId);
    if (saved && /^[0-9a-f-]{36}$/i.test(saved)) return saved;
    const id = crypto.randomUUID();
    storage.setItem(STORAGE_KEYS.clientId, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
