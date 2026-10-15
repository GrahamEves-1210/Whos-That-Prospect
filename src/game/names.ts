import type { Prospect } from '../data/types';
import { normalizeGuess } from './guess';

/** A suggestion for the guess box: a drafted player's name and draft year. */
export interface NameEntry {
  name: string;
  year: number;
  /** Went undrafted (year = their draft class) */
  udfa: boolean;
  /** Normalized full name, and its words, for matching */
  key: string;
  words: string[];
}

/** Characters typed before suggestions show */
export const MIN_QUERY = 3;
const MAX_RESULTS = 8;

function toEntry(name: string, year: number, udfa = false): NameEntry {
  const key = normalizeGuess(name);
  return { name, year, udfa, key, words: key.split(' ') };
}

/**
 * The suggestion list: every drafted player in public/draft-names.json plus the game's own prospects
 * (so a scheduled answer is always there, spelled the game's way, even if undrafted or outside the list).
 */
export type NameRow = readonly [string, number] | readonly [string, number, number];

export function buildNameIndex(drafted: ReadonlyArray<NameRow>, prospects: readonly Prospect[]): NameEntry[] {
  const byKey = new Map<string, NameEntry>();
  for (const [name, year, udfa] of drafted) {
    const e = toEntry(name, year, udfa === 1);
    if (e.key) byKey.set(`${e.key}|${year}`, e);
  }
  // Safeguard: every one of the game's prospects (any day's answer) is always in the list, under its exact
  // answer name. It also replaces a same-name entry from the feed, so the spelling matches the game.
  for (const p of prospects) {
    const e = toEntry(p.name, p.draftYear, p.draftRound == null);
    byKey.set(`${e.key}|${e.year}`, e);
  }
  return [...byKey.values()];
}

/** Up to 8 names matching what's typed: full-name prefix first, then a first- or last-name prefix. */
export function searchNames(index: readonly NameEntry[], query: string): NameEntry[] {
  const q = normalizeGuess(query);
  if (q.replace(/\s/g, '').length < MIN_QUERY) return [];
  const qWords = q.split(' ');
  const scored: Array<{ e: NameEntry; rank: number }> = [];
  for (const e of index) {
    let rank: number;
    if (e.key.startsWith(q)) rank = 0;
    else if (qWords.length === 1 && e.words.some((w) => w.startsWith(q))) rank = 1;
    else if (qWords.length > 1 && qWords.every((qw) => e.words.some((w) => w.startsWith(qw)))) rank = 2;
    else continue;
    scored.push({ e, rank });
  }
  scored.sort((a, b) => a.rank - b.rank || a.e.name.localeCompare(b.e.name) || b.e.year - a.e.year);
  return scored.slice(0, MAX_RESULTS).map((s) => s.e);
}

let loading: Promise<NameEntry[]> | null = null;

/** Fetch the draft list once (on first use), merged with the game's prospects. Empty list if it fails. */
export function loadNameIndex(prospects: readonly Prospect[]): Promise<NameEntry[]> {
  loading ??= fetch('/draft-names.json')
    .then((r) => (r.ok ? (r.json() as Promise<NameRow[]>) : []))
    // If the list can't load, suggestions still include every prospect
    .catch(() => [] as NameRow[])
    .then((drafted) => buildNameIndex(drafted, prospects));
  return loading;
}
