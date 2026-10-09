import { useCallback, useEffect, useRef, useState } from 'react';
import type { Prospect } from '../data/types';
import { getDailyProspect, getFilmRoomDays, getPracticeProspect } from '../game/daily';
import { applyGuess, applySkip, createGame, getCurrentGuessNumber, getWrongGuessCount, isFinished } from '../game/engine';
import { loadGameState, loadStats, recordResult, saveGameState, saveStats } from '../game/storage';
import { getPuzzleNumber } from '../game/time';
import type { GameMode, GameState, GuessOutcome, Stats } from '../game/types';

export interface GameEvent {
  /** Monotonic id so the UI can re-trigger animations for identical outcomes */
  id: number;
  outcome: GuessOutcome;
}

interface Session {
  prospect: Prospect;
  state: GameState;
}

/** `?puzzle=N` opens a specific daily puzzle in preview/flashback mode (not persisted, no stats). */
function getPreviewPuzzleFromUrl(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('puzzle');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function setPuzzleUrlParam(puzzleNumber: number | null): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (puzzleNumber == null) url.searchParams.delete('puzzle');
  else url.searchParams.set('puzzle', String(puzzleNumber));
  window.history.replaceState({}, '', url.toString());
}

function loadDailySession(puzzleNumber: number): Session {
  const prospect = getDailyProspect(puzzleNumber);
  const saved = loadGameState(puzzleNumber, prospect.id);
  return { prospect, state: saved ?? createGame(prospect, 'daily', puzzleNumber) };
}

function createPreviewSession(puzzleNumber: number): Session {
  const prospect = getDailyProspect(puzzleNumber);
  return { prospect, state: createGame(prospect, 'preview', puzzleNumber) };
}

export function useGame() {
  const [todayPuzzleNumber] = useState(() => getPuzzleNumber());

  const [session, setSession] = useState<Session>(() => {
    const preview = getPreviewPuzzleFromUrl();
    if (preview != null && getFilmRoomDays(todayPuzzleNumber).includes(preview)) return createPreviewSession(preview);
    if (preview != null) setPuzzleUrlParam(null);
    return loadDailySession(todayPuzzleNumber);
  });
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [stats, setStats] = useState<Stats>(() => loadStats());
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const [lastEvent, setLastEvent] = useState<GameEvent | null>(null);
  const eventCounter = useRef(0);

  const [newPuzzleAvailable, setNewPuzzleAvailable] = useState(false);

  // Persist the daily game on every change (no-op for practice/preview).
  useEffect(() => {
    saveGameState(session.state);
  }, [session.state]);

  // Detect the Eastern-midnight rollover while the tab stays open.
  useEffect(() => {
    const check = () => {
      if (getPuzzleNumber() !== todayPuzzleNumber) setNewPuzzleAvailable(true);
    };
    const timer = window.setInterval(check, 30_000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [todayPuzzleNumber]);

  const replaceSession = useCallback((next: Session) => {
    sessionRef.current = next;
    setSession(next);
    setLastEvent(null);
  }, []);

  const pushEvent = useCallback((outcome: GuessOutcome) => {
    eventCounter.current += 1;
    setLastEvent({ id: eventCounter.current, outcome });
  }, []);

  const commit = useCallback(
    (step: (s: GameState, p: Prospect) => { state: GameState; outcome: GuessOutcome }): GuessOutcome => {
      const current = sessionRef.current;
      const { state, outcome } = step(current.state, current.prospect);

      if (state !== current.state) {
        const next = { ...current, state };
        sessionRef.current = next;
        setSession(next);

        // Fold finished daily games into stats exactly once (on the transition).
        if (isFinished(state) && state.mode === 'daily') {
          const nextStats = recordResult(statsRef.current, {
            puzzleNumber: state.puzzleNumber,
            won: state.status === 'won',
            guessCount: state.guesses.length,
          });
          statsRef.current = nextStats;
          setStats(nextStats);
          saveStats(nextStats);
        }
      }

      pushEvent(outcome);
      return outcome;
    },
    [pushEvent],
  );

  const submitGuess = useCallback((raw: string): GuessOutcome => commit((s, p) => applyGuess(s, p, raw)), [commit]);
  /** Skip: spend a guess to unlock the next clue. */
  const skipGuess = useCallback((): GuessOutcome => commit((s) => applySkip(s)), [commit]);

  /** Restart the clock when the player actually starts (no guesses yet). */
  const markStarted = useCallback(() => {
    const current = sessionRef.current;
    if (current.state.guesses.length > 0 || current.state.status !== 'playing') return;
    const next: Session = { ...current, state: { ...current.state, startedAt: Date.now() } };
    sessionRef.current = next;
    setSession(next);
  }, []);

  const startPractice = useCallback(() => {
    const prospect = getPracticeProspect(sessionRef.current.prospect.id);
    setPuzzleUrlParam(null);
    replaceSession({ prospect, state: createGame(prospect, 'practice', 0) });
  }, [replaceSession]);

  /** Flashback: play a past puzzle number in preview mode. */
  const loadPreview = useCallback(
    (puzzleNumber: number) => {
      setPuzzleUrlParam(puzzleNumber);
      replaceSession(createPreviewSession(puzzleNumber));
    },
    [replaceSession],
  );

  const returnToDaily = useCallback(() => {
    setPuzzleUrlParam(null);
    replaceSession(loadDailySession(todayPuzzleNumber));
  }, [replaceSession, todayPuzzleNumber]);

  /** Replace stats wholesale (used when syncing a signed-in player's stats from another device). */
  const replaceStats = useCallback((next: Stats) => {
    statsRef.current = next;
    setStats(next);
    saveStats(next);
  }, []);

  const markNewPuzzleAvailable = useCallback(() => setNewPuzzleAvailable(true), []);

  const { state, prospect } = session;
  const mode: GameMode = state.mode;

  return {
    mode,
    todayPuzzleNumber,
    state,
    prospect,
    stats,
    wrongGuesses: getWrongGuessCount(state),
    currentGuessNumber: getCurrentGuessNumber(state),
    finished: isFinished(state),
    lastEvent,
    newPuzzleAvailable,
    submitGuess,
    skipGuess,
    markStarted,
    startPractice,
    loadPreview,
    returnToDaily,
    markNewPuzzleAvailable,
    replaceStats,
  };
}

export type UseGame = ReturnType<typeof useGame>;
