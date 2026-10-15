export type GameStatus = 'playing' | 'won' | 'lost';

/**
 * daily    — today's shared puzzle; persisted, counts toward stats
 * practice — random prospect via "Play Again"; not persisted, no stats
 * preview  — a specific puzzle number opened via ?puzzle=N; not persisted, no stats
 */
export type GameMode = 'daily' | 'practice' | 'preview';

export interface GameState {
  mode: GameMode;
  /** Daily/preview puzzle number; 0 for practice games */
  puzzleNumber: number;
  prospectId: string;
  /** Raw guesses as typed (trimmed), in order */
  guesses: string[];
  status: GameStatus;
  startedAt: number;
  finishedAt: number | null;
}

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** Index 0 = solved on guess 1 … index 5 = solved on guess 6 */
  guessDistribution: number[];
  /** Last daily puzzle number that was finished (win or loss) */
  lastCompletedPuzzle: number | null;
}

export type ClueKind =
  | 'position'
  | 'excerpt'
  | 'measurables'
  | 'testing'
  | 'conference'
  | 'draftYear'
  | 'college'
  | 'draftSlot'
  | 'accolades'
  | 'hometown'
  | 'custom';

export interface Clue {
  id: string;
  kind: ClueKind;
  /** Card label, e.g. "Measurables" */
  label: string;
  /** Primary display value */
  value: string;
  /** Optional secondary line(s) */
  details?: string[];
  /** Scouting quotes: who said it, shown under the quote */
  credit?: string;
  /** Number of wrong guesses needed to unlock this clue (0 = visible at start) */
  unlockAt: number;
}

export type GuessOutcome =
  | { kind: 'correct'; guessNumber: number }
  | { kind: 'wrong'; guessNumber: number; unlockedStep: number; gameOver: boolean; skipped?: boolean }
  | { kind: 'duplicate' }
  | { kind: 'empty' }
  | { kind: 'finished' };
