import type { Prospect } from '../data/types';
import { MAX_GUESSES } from './config';
import { checkGuess, isDuplicateGuess } from './guess';
import type { GameMode, GameState, GuessOutcome } from './types';

/** Stored in place of a name when the player skips a guess. */
export const SKIP_GUESS = '__skip__';
export const isSkip = (guess: string): boolean => guess === SKIP_GUESS;

/** Start a fresh game for a prospect. */
export function createGame(
  prospect: Prospect,
  mode: GameMode,
  puzzleNumber: number,
  now: number = Date.now(),
): GameState {
  return {
    mode,
    puzzleNumber: mode === 'practice' ? 0 : puzzleNumber,
    prospectId: prospect.id,
    guesses: [],
    status: 'playing',
    startedAt: now,
    finishedAt: null,
  };
}

/** Number of wrong guesses so far — drives which clues are unlocked. */
export function getWrongGuessCount(state: Pick<GameState, 'guesses' | 'status'>): number {
  return state.status === 'won' ? Math.max(0, state.guesses.length - 1) : state.guesses.length;
}

/** 1-based number of the guess the player is about to make. */
export function getCurrentGuessNumber(state: Pick<GameState, 'guesses' | 'status'>): number {
  return Math.min(state.guesses.length + 1, MAX_GUESSES);
}

export function isFinished(state: Pick<GameState, 'status'>): boolean {
  return state.status !== 'playing';
}

/**
 * Pure state transition for a submitted guess.
 * Returns the new state (same reference if nothing changed) and what happened.
 */
export function applyGuess(
  state: GameState,
  prospect: Prospect,
  rawGuess: string,
  now: number = Date.now(),
): { state: GameState; outcome: GuessOutcome } {
  if (isFinished(state)) return { state, outcome: { kind: 'finished' } };

  const guess = rawGuess.trim().replace(/\s+/g, ' ');
  if (!guess) return { state, outcome: { kind: 'empty' } };
  if (isDuplicateGuess(guess, state.guesses)) return { state, outcome: { kind: 'duplicate' } };

  if (checkGuess(guess, prospect)) {
    const guessNumber = state.guesses.length + 1;
    // Record the correct guess with the prospect's real spelling, even if it was typed with a typo.
    const corrected = [...state.guesses, prospect.name];
    return {
      state: { ...state, guesses: corrected, status: 'won', finishedAt: now },
      outcome: { kind: 'correct', guessNumber },
    };
  }

  return recordMiss(state, guess, now);
}

/** Skip: use up a guess without naming anyone. It counts as a miss and unlocks the next clue. */
export function applySkip(state: GameState, now: number = Date.now()): { state: GameState; outcome: GuessOutcome } {
  if (isFinished(state)) return { state, outcome: { kind: 'finished' } };
  const res = recordMiss(state, SKIP_GUESS, now);
  return res.outcome.kind === 'wrong' ? { ...res, outcome: { ...res.outcome, skipped: true } } : res;
}

function recordMiss(state: GameState, guess: string, now: number): { state: GameState; outcome: GuessOutcome } {
  const guesses = [...state.guesses, guess];
  const guessNumber = guesses.length;
  const gameOver = guessNumber >= MAX_GUESSES;
  return {
    state: {
      ...state,
      guesses,
      status: gameOver ? 'lost' : 'playing',
      finishedAt: gameOver ? now : null,
    },
    outcome: { kind: 'wrong', guessNumber, unlockedStep: guessNumber, gameOver },
  };
}
