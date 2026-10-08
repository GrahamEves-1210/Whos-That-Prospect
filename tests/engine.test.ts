import { describe, expect, it } from 'vitest';
import { MAX_GUESSES } from '../src/game/config';
import { applyGuess, applySkip, createGame, getCurrentGuessNumber, getWrongGuessCount, SKIP_GUESS } from '../src/game/engine';
import { generateShareText } from '../src/game/share';
import {
  createEmptyStats,
  createMemoryStorage,
  getDisplayStreak,
  loadGameState,
  loadStats,
  recordResult,
  saveGameState,
  saveStats,
} from '../src/game/storage';
import type { GameState } from '../src/game/types';
import { FIXTURES } from './fixtures';

const prospect = FIXTURES[0];
const other = FIXTURES[1];

function playWrong(state: GameState, n: number): GameState {
  let s = state;
  for (let i = 0; i < n; i++) {
    s = applyGuess(s, prospect, `Wrong Guess ${i}`).state;
  }
  return s;
}

describe('engine', () => {
  it('starts empty', () => {
    const g = createGame(prospect, 'daily', 7);
    expect(g.guesses).toEqual([]);
    expect(g.status).toBe('playing');
    expect(getCurrentGuessNumber(g)).toBe(1);
    expect(getWrongGuessCount(g)).toBe(0);
  });

  it('correct guess wins immediately', () => {
    const g = createGame(prospect, 'daily', 7);
    const { state, outcome } = applyGuess(g, prospect, prospect.name.toUpperCase());
    expect(outcome).toEqual({ kind: 'correct', guessNumber: 1 });
    expect(state.status).toBe('won');
    expect(state.finishedAt).not.toBeNull();
    expect(getWrongGuessCount(state)).toBe(0);
    expect(state.guesses).toEqual([prospect.name]);
  });

  it('stores a correct guess with the real spelling when typed with a typo', () => {
    const typo = prospect.name.slice(0, -1) + (prospect.name.endsWith('x') ? 'y' : 'x');
    const { state, outcome } = applyGuess(createGame(prospect, 'daily', 7), prospect, typo.toLowerCase());
    expect(outcome.kind).toBe('correct');
    expect(state.guesses).toEqual([prospect.name]);
  });

  it('wrong guess unlocks the next step', () => {
    const g = createGame(prospect, 'daily', 7);
    const { state, outcome } = applyGuess(g, prospect, other.name);
    expect(outcome).toEqual({ kind: 'wrong', guessNumber: 1, unlockedStep: 1, gameOver: false });
    expect(state.status).toBe('playing');
    expect(getWrongGuessCount(state)).toBe(1);
    expect(getCurrentGuessNumber(state)).toBe(2);
  });

  it('six wrong guesses lose the game', () => {
    const s = playWrong(createGame(prospect, 'daily', 7), MAX_GUESSES);
    expect(s.status).toBe('lost');
    expect(s.guesses).toHaveLength(MAX_GUESSES);
    expect(getWrongGuessCount(s)).toBe(MAX_GUESSES);
    expect(applyGuess(s, prospect, prospect.name).outcome).toEqual({ kind: 'finished' });
  });

  it('winning on the last guess still counts as a win', () => {
    const s = playWrong(createGame(prospect, 'daily', 7), MAX_GUESSES - 1);
    const { state, outcome } = applyGuess(s, prospect, prospect.name);
    expect(outcome).toEqual({ kind: 'correct', guessNumber: MAX_GUESSES });
    expect(state.status).toBe('won');
  });

  it('ignores empty and duplicate guesses without consuming a turn', () => {
    const g = createGame(prospect, 'daily', 7);
    expect(applyGuess(g, prospect, '   ').outcome).toEqual({ kind: 'empty' });
    const after = applyGuess(g, prospect, other.name).state;
    const dup = applyGuess(after, prospect, other.name.toLowerCase());
    expect(dup.outcome).toEqual({ kind: 'duplicate' });
    expect(dup.state).toBe(after);
  });

  it('practice games have puzzle number 0', () => {
    expect(createGame(prospect, 'practice', 99).puzzleNumber).toBe(0);
  });
});

describe('storage', () => {
  it('round-trips a daily game and rejects a different day', () => {
    const storage = createMemoryStorage();
    const g = playWrong(createGame(prospect, 'daily', 7), 2);
    saveGameState(g, storage);
    expect(loadGameState(7, prospect.id, storage)).toEqual(g);
    expect(loadGameState(8, prospect.id, storage)).toBeNull();
    expect(loadGameState(7, other.id, storage)).toBeNull();
  });

  it('never persists practice games', () => {
    const storage = createMemoryStorage();
    saveGameState(createGame(prospect, 'practice', 0), storage);
    expect(loadGameState(0, prospect.id, storage)).toBeNull();
  });

  it('survives corrupt data', () => {
    const storage = createMemoryStorage();
    storage.setItem('wtp:daily-game:v1', '{not json');
    storage.setItem('wtp:stats:v1', '"nope"');
    expect(loadGameState(7, prospect.id, storage)).toBeNull();
    expect(loadStats(storage)).toEqual(createEmptyStats());
  });

  it('records wins, losses, distribution and streaks', () => {
    let stats = createEmptyStats();
    stats = recordResult(stats, { puzzleNumber: 1, won: true, guessCount: 3 });
    stats = recordResult(stats, { puzzleNumber: 2, won: true, guessCount: 1 });
    expect(stats).toMatchObject({ played: 2, wins: 2, currentStreak: 2, maxStreak: 2 });
    expect(stats.guessDistribution).toEqual([1, 0, 1, 0, 0, 0]);

    // skipped day 3 → streak restarts at 1 on day 4
    stats = recordResult(stats, { puzzleNumber: 4, won: true, guessCount: 6 });
    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(2);

    stats = recordResult(stats, { puzzleNumber: 5, won: false, guessCount: 6 });
    expect(stats).toMatchObject({ played: 4, wins: 3, currentStreak: 0, maxStreak: 2 });
    expect(stats.guessDistribution).toEqual([1, 0, 1, 0, 0, 1]);

    const storage = createMemoryStorage();
    saveStats(stats, storage);
    expect(loadStats(storage)).toEqual(stats);
  });

  it('display streak drops to zero after a missed day', () => {
    let stats = createEmptyStats();
    stats = recordResult(stats, { puzzleNumber: 10, won: true, guessCount: 2 });
    expect(getDisplayStreak(stats, 10)).toBe(1);
    expect(getDisplayStreak(stats, 11)).toBe(1);
    expect(getDisplayStreak(stats, 12)).toBe(0);
  });
});

describe('skip', () => {
  it('uses a guess, unlocks the next clue and is allowed more than once', () => {
    let s = createGame(prospect, 'daily', 7);
    const r = applySkip(s);
    expect(r.outcome).toMatchObject({ kind: 'wrong', guessNumber: 1, unlockedStep: 1, skipped: true });
    s = applySkip(r.state).state;
    expect(s.guesses).toEqual([SKIP_GUESS, SKIP_GUESS]);
    expect(getWrongGuessCount(s)).toBe(2);
    expect(applyGuess(s, prospect, prospect.name).outcome).toEqual({ kind: 'correct', guessNumber: 3 });
  });

  it('ends the game when it uses the last guess', () => {
    let s = createGame(prospect, 'daily', 7);
    for (let i = 0; i < MAX_GUESSES; i++) s = applySkip(s).state;
    expect(s.status).toBe('lost');
    expect(applySkip(s).outcome.kind).toBe('finished');
  });

  it('shows skips as white squares in the share text', () => {
    const s0 = applySkip(createGame(prospect, 'daily', 42)).state;
    const s = applyGuess(s0, prospect, prospect.name).state;
    expect(generateShareText({ ...s, startedAt: 0, finishedAt: 5_000 })).toBe(`Who's That Prospect? #42\n⬜🟩 2/6 · ⏱️ 0:05\nwhosthatprospect.com`);
  });
});

describe('share text', () => {
  it('formats a win without the answer', () => {
    const s = applyGuess(playWrong(createGame(prospect, 'daily', 42), 3), prospect, prospect.name).state;
    const text = generateShareText({ ...s, startedAt: 0, finishedAt: 102_000 });
    expect(text).toBe(`Who's That Prospect? #42\n🟥🟥🟥🟩 4/6 · ⏱️ 1:42\nwhosthatprospect.com`);
    expect(text).not.toContain(prospect.name);
  });

  it('formats a loss', () => {
    const s = playWrong(createGame(prospect, 'daily', 42), MAX_GUESSES);
    expect(generateShareText({ ...s, startedAt: 0, finishedAt: 3_725_000 })).toBe(
      `Who's That Prospect? #42\n🟥🟥🟥🟥🟥🟥 X/6 · ⏱️ 1:02:05\nwhosthatprospect.com`,
    );
  });

  it('labels practice games', () => {
    const s = applyGuess(createGame(prospect, 'practice', 0), prospect, prospect.name).state;
    expect(generateShareText({ ...s, startedAt: 0, finishedAt: 9_000 })).toBe(`Who's That Prospect? Practice\n🟩 1/6 · ⏱️ 0:09\nwhosthatprospect.com`);
  });
});
