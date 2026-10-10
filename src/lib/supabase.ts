import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Stats } from '../game/types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Null when the env vars are missing; the game still works, accounts just switch off. */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export interface ResultRow {
  puzzle_number: number;
  won: boolean;
  guesses: number;
  time_ms: number;
}

/** Record a finished daily game. Duplicates (same user + puzzle) are ignored. */
export async function submitResult(userId: string, row: ResultRow): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('results')
    .upsert({ user_id: userId, ...row }, { onConflict: 'user_id,puzzle_number', ignoreDuplicates: true });
  if (error) throw error;
}

export interface LeaderboardEntry {
  username: string;
  correct_guesses: number;
  current_streak: number;
}

/** One all-time board: most correct guesses, then longest current streak. */
export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('leaderboard')
    .select('username, correct_guesses, current_streak')
    .order('correct_guesses', { ascending: false })
    .order('current_streak', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as LeaderboardEntry[];
}

/** Save a "request a prospect" suggestion. Returns an error message, or null. */
export async function submitProspectRequest(prospect: string, note: string, userId: string | null): Promise<string | null> {
  if (!supabase) return 'Requests are not switched on yet.';
  const { error } = await supabase.from('prospect_requests').insert({ prospect, note: note || null, user_id: userId });
  return error ? 'Couldn’t send your request. Try again in a moment.' : null;
}

/** Last leaderboard fetched, so the Stats sheet can open at its final height with no loading swap. */
let leaderboardCache: LeaderboardEntry[] | null = null;

export function getCachedLeaderboard(): LeaderboardEntry[] | null {
  return leaderboardCache;
}

export async function prefetchLeaderboard(): Promise<void> {
  try {
    leaderboardCache = await fetchLeaderboard();
  } catch {
    /* the sheet will retry and show its error state */
  }
}

/** The signed-in player's stats saved in their account, or null if none yet. */
export async function fetchUserStats(userId: string): Promise<Stats | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('user_stats').select('stats').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data?.stats as Stats | undefined) ?? null;
}

export async function saveUserStats(userId: string, stats: Stats): Promise<void> {
  if (!supabase) return;
  await supabase.from('user_stats').upsert({ user_id: userId, stats, updated_at: new Date().toISOString() });
}
