import type { Prospect } from '../data/types';
import { TYPO_MIN_LENGTH, TYPO_TOLERANCE } from './config';

const SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv']);

/**
 * Normalize a name for comparison:
 *  - strip accents (Valdés → valdes)
 *  - lower-case
 *  - drop apostrophes and periods (D'Marco → dmarco, St. → st, J.J. → jj)
 *  - treat hyphens and other punctuation as spaces (Okafor-Lane → okafor lane)
 *  - drop generational suffixes (Jr, Sr, II, III, IV)
 *  - collapse whitespace
 */
export function normalizeGuess(input: string): string {
  const stripped = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const tokens = stripped.split(/\s+/).filter((t) => t.length > 0 && !SUFFIXES.has(t));
  return tokens.join(' ');
}

/** Optimal string alignment distance with early exit once `max` is exceeded. */
export function editDistance(a: string, b: string, max: number = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;

  for (let i = 1; i < rows; i++) {
    let rowMin = Infinity;
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, d[i - 2][j - 2] + 1); // transposition
      }
      d[i][j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

/** All accepted normalized answers for a prospect (name + aliases). */
export function getAcceptedAnswers(prospect: Prospect): string[] {
  const answers = [prospect.name, ...(prospect.aliases ?? [])].map(normalizeGuess).filter(Boolean);
  return Array.from(new Set(answers));
}

/**
 * Does `guess` identify the mystery prospect?
 * Exact match after normalization, or a near-miss (one typo) on longer names.
 */
export function checkGuess(guess: string, prospect: Prospect): boolean {
  const g = normalizeGuess(guess);
  if (!g) return false;
  for (const answer of getAcceptedAnswers(prospect)) {
    if (g === answer) return true;
    if (
      TYPO_TOLERANCE > 0 &&
      answer.length >= TYPO_MIN_LENGTH &&
      g.length >= TYPO_MIN_LENGTH &&
      editDistance(g, answer, TYPO_TOLERANCE) <= TYPO_TOLERANCE
    ) {
      return true;
    }
  }
  return false;
}

/** Has this (normalized) guess already been tried? */
export function isDuplicateGuess(guess: string, previous: readonly string[]): boolean {
  const g = normalizeGuess(guess);
  return previous.some((p) => normalizeGuess(p) === g);
}
