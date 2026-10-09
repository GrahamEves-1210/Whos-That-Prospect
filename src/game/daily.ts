import { PINNED_PUZZLES, PROSPECTS } from '../data/prospects';
import type { Prospect } from '../data/types';
import { ROTATION_SEED } from './config';
import { seededPermutation } from './random';
import { getPuzzleNumber } from './time';

const permutationCache = new Map<string, number[]>();

function getRotation(poolSize: number, seed: number): number[] {
  const key = `${poolSize}:${seed}`;
  let order = permutationCache.get(key);
  if (!order) {
    order = seededPermutation(poolSize, seed);
    permutationCache.set(key, order);
  }
  return order;
}

/** The prospects the daily rotation cycles through: the pool minus anyone pinned to a fixed day. */
export function getRotationPool(pool: readonly Prospect[] = PROSPECTS): readonly Prospect[] {
  if (pool !== PROSPECTS) return pool;
  const pinned = new Set(Object.values(PINNED_PUZZLES));
  const unpinned = pool.filter((p) => !pinned.has(p.id));
  // Every prospect pinned: other days rotate through the whole pool
  return unpinned.length > 0 ? unpinned : pool;
}

/**
 * The mystery prospect for a given puzzle number.
 *
 * Uses a seeded permutation of the pool so every prospect appears exactly once
 * per cycle (no repeats until the whole pool has been used), and the same
 * puzzle number always maps to the same prospect for every player.
 *
 * NOTE: adding prospects to the pool changes the rotation. That's fine for v1;
 * if the pool grows after launch and you want past days to stay stable, store a
 * published schedule instead.
 */
export function getDailyProspect(
  puzzleNumber: number = getPuzzleNumber(),
  pool: readonly Prospect[] = PROSPECTS,
  seed: number = ROTATION_SEED,
): Prospect {
  if (pool.length === 0) throw new Error('Prospect pool is empty');
  // Pinned days first (only when using the real pool)
  if (pool === PROSPECTS) {
    const pinnedId = PINNED_PUZZLES[puzzleNumber];
    const pinned = pinnedId ? pool.find((p) => p.id === pinnedId) : undefined;
    if (pinned) return pinned;
  }
  const rotation = getRotationPool(pool);
  const order = getRotation(rotation.length, seed);
  const idx = ((puzzleNumber - 1) % rotation.length + rotation.length) % rotation.length;
  return rotation[order[idx]];
}

/** A random prospect for practice mode, avoiding `excludeId` when possible. */
export function getPracticeProspect(
  excludeId?: string,
  pool: readonly Prospect[] = PROSPECTS,
  rand: () => number = Math.random,
): Prospect {
  const candidates = pool.length > 1 ? pool.filter((p) => p.id !== excludeId) : pool;
  return candidates[Math.floor(rand() * candidates.length)];
}

export function getProspectById(id: string, pool: readonly Prospect[] = PROSPECTS): Prospect | undefined {
  return pool.find((p) => p.id === id);
}

/**
 * Past puzzle numbers Film room offers, newest first: walks back from yesterday and stops at the
 * first day whose prospect repeats one already covered (today included), so every listed day is a
 * different prospect. The list can never be longer than the pool.
 */
export function getFilmRoomDays(todayPuzzleNumber: number, pool: readonly Prospect[] = PROSPECTS): number[] {
  // Today's prospect and anyone pinned to a future day never appear, so Film room can't spoil upcoming days
  const seen = new Set<string>([getDailyProspect(todayPuzzleNumber, pool).id]);
  if (pool === PROSPECTS) {
    for (const [day, id] of Object.entries(PINNED_PUZZLES)) if (Number(day) > todayPuzzleNumber) seen.add(id);
  }
  const days: number[] = [];
  for (let n = todayPuzzleNumber - 1; n >= 1; n--) {
    const id = getDailyProspect(n, pool).id;
    if (seen.has(id)) break;
    seen.add(id);
    days.push(n);
  }
  return days;
}
