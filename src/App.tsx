import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti } from './components/Confetti';
import { Drawer } from './components/Drawer';
import { FlashbackPanel } from './components/FlashbackPanel';
import { GameHeader, type MenuName } from './components/GameHeader';
import { GameStatusBar } from './components/GameStatusBar';
import { GuessHistory } from './components/GuessHistory';
import { GuessInput } from './components/GuessInput';
import { HelpPanel } from './components/HelpPanel';
import { MysteryPlayerCard } from './components/MysteryPlayerCard';
import { Notification, type NotificationMessage } from './components/Notification';
import { ProfilePanel } from './components/ProfilePanel';
import { RequestPanel } from './components/RequestPanel';
import { ResultPanel } from './components/ResultPanel';
import { Reveal } from './components/Reveal';
import { SplashScreen } from './components/SplashScreen';
import { StatsPanel } from './components/StatsPanel';
import { DEFAULT_EXCERPT_SOURCE, EXCERPT_SOURCE_URL } from './data/prospects';
import { BACKGROUND_STEP, MEASURABLES_STEP, getCluesForStep, getExcerptClues } from './game/clues';
import { MAX_GUESSES } from './game/config';
import { generateShareText, shareText } from './game/share';
import { getNextResetTime } from './game/time';
import { useAuth } from './hooks/useAuth';
import { useGame } from './hooks/useGame';
import { fetchUserStats, prefetchLeaderboard, saveUserStats, submitResult } from './lib/supabase';
import type { Stats } from './game/types';
import { normalizeStats } from './game/storage';

const NOTIFICATION_MS = 4200;
const MENU_CLOSE_MS = 420;

/** How each clue kind is named in the "new clue" toast. */
// Named by prospect-card section, so each miss reads as one clue: "New clue: measurables."
const CLUE_NAMES: Record<string, string> = {
  position: 'position',
  excerpt: 'another scouting quote',
  measurables: 'measurables',
  testing: 'measurables',
  conference: 'background and honors',
  draftYear: 'background and honors',
  hometown: 'background and honors',
  accolades: 'background and honors',
  college: 'draft info',
  draftSlot: 'draft info',
};

/** Prospect-specific clues take the name of the section they unlock with. */
function clueName(c: { kind: string; label: string; unlockAt: number }): string {
  if (c.kind !== 'custom') return CLUE_NAMES[c.kind] ?? c.label.toLowerCase();
  if (c.unlockAt <= MEASURABLES_STEP) return 'measurables';
  if (c.unlockAt === BACKGROUND_STEP) return 'background and honors';
  return 'draft info';
}

/** True when stats a reflect more play than stats b (more games, or the same games but a later finish). */
function moreComplete(a: Stats, b: Stats): boolean {
  if (a.played !== b.played) return a.played > b.played;
  return (a.lastCompletedPuzzle ?? 0) > (b.lastCompletedPuzzle ?? 0);
}

export default function App() {
  const game = useGame();
  const auth = useAuth();
  const { state, prospect, wrongGuesses, finished, lastEvent } = game;
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  // Post a finished daily game to the leaderboard once signed in (duplicates are ignored server-side).
  const dailyResult =
    state.mode === 'daily' && finished && state.finishedAt != null
      ? { puzzle_number: state.puzzleNumber, won: state.status === 'won', guesses: state.guesses.length, time_ms: state.finishedAt - state.startedAt }
      : null;
  const dailyResultKey = dailyResult ? `${dailyResult.puzzle_number}:${dailyResult.won}:${dailyResult.guesses}` : null;
  useEffect(() => {
    if (!auth.userId || !dailyResult) return;
    submitResult(auth.userId, dailyResult)
      .then(() => setBoardRefreshKey((k) => k + 1))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.userId, dailyResultKey]);

  const [splash, setSplash] = useState<'open' | 'leaving' | 'gone'>('open');
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [confetti, setConfetti] = useState(0);
  // Show the result immediately for games loaded already-finished, after a beat for live finishes.
  const [revealReady, setRevealReady] = useState(() => finished);
  const notificationTimer = useRef<number | null>(null);

  const nextReset = useMemo(() => getNextResetTime(), []);
  const source = prospect.excerptSource ?? DEFAULT_EXCERPT_SOURCE;
  const excerptClues = useMemo(() => getExcerptClues(prospect), [prospect]);
  // Silhouette hint: hidden (blurred) until the player asks; resets with each new prospect.
  const [silhouetteShown, setSilhouetteShown] = useState(false);
  useEffect(() => setSilhouetteShown(false), [prospect.id, state.mode]);

  const newStep: number | 'all' | null = useMemo(() => {
    if (!lastEvent) return null;
    const o = lastEvent.outcome;
    if (o.kind === 'wrong') return o.gameOver ? 'all' : o.unlockedStep;
    if (o.kind === 'correct') return 'all';
    return null;
  }, [lastEvent]);

  const animateIndex =
    lastEvent && (lastEvent.outcome.kind === 'wrong' || lastEvent.outcome.kind === 'correct') ? lastEvent.outcome.guessNumber - 1 : -1;

  const notify = useCallback((msg: Omit<NotificationMessage, 'id'>) => {
    if (notificationTimer.current) window.clearTimeout(notificationTimer.current);
    setNotification({ id: Date.now(), ...msg });
    if (!msg.sticky) notificationTimer.current = window.setTimeout(() => setNotification(null), NOTIFICATION_MS);
  }, []);

  const dismissNotification = useCallback(() => {
    if (notificationTimer.current) window.clearTimeout(notificationTimer.current);
    setNotification(null);
  }, []);

  // Reset reveal state when the session changes (practice / flashback / back to today).
  useEffect(() => {
    setRevealReady(finished && lastEvent == null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospect.id, state.mode]);

  // React to each guess.
  useEffect(() => {
    if (!lastEvent) return;
    const o = lastEvent.outcome;
    let timer: number | undefined;

    if (o.kind === 'wrong' && !o.gameOver) {
      const unlocked = getCluesForStep(prospect, o.unlockedStep);
      const QUOTE = CLUE_NAMES.excerpt;
      // Card sections first, the scouting quote last: "New clues: draft info and another scouting quote."
      const labels = Array.from(new Set(unlocked.map(clueName))).sort((x, y) => Number(x === QUOTE) - Number(y === QUOTE));
      notify({
        text: labels.length === 1 ? `New clue: ${labels[0]}.` : `New clues: ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`,
        tone: 'neutral',
      });
    }

    if ((o.kind === 'wrong' && o.gameOver) || o.kind === 'correct') dismissNotification();

    if (o.kind === 'wrong' && o.gameOver) {
      timer = window.setTimeout(() => {
        setRevealReady(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1100);
    }

    if (o.kind === 'correct') {
      setConfetti(lastEvent.id);
      timer = window.setTimeout(() => {
        setRevealReady(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1200);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [lastEvent, prospect, notify, dismissNotification]);

  // Day rollover notice.
  useEffect(() => {
    if (!game.newPuzzleAvailable) return;
    notify({
      text: 'A new mystery prospect just dropped.',
      tone: 'success',
      sticky: true,
      action: { label: 'Open it', onClick: () => window.location.reload() },
    });
  }, [game.newPuzzleAvailable, notify]);

  const handlePlay = useCallback(() => {
    game.markStarted();
    setSplash('leaving');
    window.setTimeout(() => setSplash('gone'), 300);
  }, [game]);

  // Menus animate closed before unmounting, so they slide back up instead of vanishing.
  const [menuClosing, setMenuClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const finishCloseMenu = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setMenuClosing(false);
    setOpenMenu(null);
  }, []);
  const closeMenu = useCallback(() => {
    if (closeTimer.current) return;
    // Desktop: no animation, close instantly. Phones: let the sheet sink into the nav bar first.
    if (window.matchMedia('(min-width: 701px)').matches) {
      setOpenMenu(null);
      return;
    }
    setMenuClosing(true);
    // Normally finishCloseMenu runs when the sheet's sink animation ends; this is the fallback.
    closeTimer.current = window.setTimeout(finishCloseMenu, MENU_CLOSE_MS);
  }, [finishCloseMenu]);
  const toggleMenu = useCallback(
    (menu: MenuName) => {
      if (openMenu === menu && !menuClosing) return closeMenu();
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setMenuClosing(false);
      setOpenMenu(menu);
    },
    [openMenu, menuClosing, closeMenu],
  );

  // Cross-device stats: on sign-in, keep whichever copy (this device or the account) has more games,
  // then keep the account copy up to date while signed in.
  const [statsSynced, setStatsSynced] = useState<string | null>(null);
  useEffect(() => {
    const uid = auth.userId;
    if (!uid) {
      setStatsSynced(null);
      return;
    }
    let cancelled = false;
    fetchUserStats(uid)
      .then((remote) => {
        if (cancelled) return;
        const local = game.stats;
        const remoteWins = remote != null && moreComplete(remote, local);
        if (remoteWins) game.replaceStats(normalizeStats(remote));
        else void saveUserStats(uid, local);
        setStatsSynced(uid);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.userId]);
  useEffect(() => {
    if (auth.userId && statsSynced === auth.userId) void saveUserStats(auth.userId, game.stats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.stats]);

  // Load the leaderboard up front so the Stats sheet opens at its final height.
  useEffect(() => {
    prefetchLeaderboard();
  }, [boardRefreshKey]);

  const handleShare = useCallback(async () => {
    const method = await shareText(generateShareText(state));
    if (method === 'clipboard') notify({ text: 'Result copied to your clipboard.', tone: 'success' });
    else if (method === 'none') notify({ text: 'Sharing is not available on this device.', tone: 'error' });
  }, [state, notify]);

  const handleOpenFilmRoom = useCallback(() => {
    setOpenMenu('flashback');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Clicking or tapping anywhere outside an open menu (and outside the nav bar) closes it.
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || t.closest('.drawer, .toolbar, .footer__request')) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [openMenu, closeMenu]);

  // While the splash is up, the page behind it must not scroll.
  useEffect(() => {
    if (splash === 'gone') return;
    const html = document.documentElement;
    const prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev[0];
      document.body.style.overflow = prev[1];
    };
  }, [splash]);

  const handleFlashback = useCallback(
    (n: number) => {
      setOpenMenu(null);
      setConfetti(0);
      game.loadPreview(n);
      window.scrollTo({ top: 0 });
      notify({ text: `Film room: prospect No. ${n}. Not counted in your stats.`, tone: 'neutral' });
    },
    [game, notify],
  );

  // Tapping the logo goes back to the start screen (and today's prospect).
  const handleLogo = useCallback(() => {
    setOpenMenu(null);
    setConfetti(0);
    // Always reload today's game: leaves Film room, and picks up a new day if midnight has passed
    game.returnToDaily();
    setSplash('open');
    window.scrollTo({ top: 0 });
  }, [game]);

  const handleReturnToDaily = useCallback(() => {
    setOpenMenu(null);
    setConfetti(0);
    game.returnToDaily();
    window.scrollTo({ top: 0 });
  }, [game]);

  const showResult = finished && revealReady;

  // The guess bar and its picks sit between the photo block and the clue card.
  const guessBar = (
    <div className="guess-area">
      <GuessInput onSubmit={game.submitGuess} onSkip={game.skipGuess} disabled={finished} lastEvent={lastEvent} />
      <GuessHistory guesses={state.guesses} status={state.status} maxGuesses={MAX_GUESSES} animateIndex={animateIndex} />
    </div>
  );

  return (
    <div className={`app app--${state.status}`}>
      <a className="skip-link" href="#main">
        Skip to the game
      </a>
      {splash !== 'gone' && (
        <SplashScreen prospect={prospect} puzzleNumber={game.todayPuzzleNumber} leaving={splash === 'leaving'} onPlay={handlePlay} />
      )}

      <div className="contain">
        <GameHeader
          openMenu={openMenu}
          menuClosing={menuClosing}
          onToggle={toggleMenu}
          onHome={handleLogo}
          nextReset={nextReset}
          onCountdownComplete={game.markNewPuzzleAvailable}
        />

        {openMenu && <button type="button" className="drawer-scrim" aria-label="Close menu" onClick={closeMenu} />}
        {openMenu && (
          <Drawer closing={menuClosing} onClosed={finishCloseMenu}>
            {openMenu === 'help' && <HelpPanel onClose={closeMenu} />}
            {openMenu === 'profile' && <ProfilePanel auth={auth} onClose={closeMenu} />}
            {openMenu === 'request' && <RequestPanel userId={auth.userId} onClose={closeMenu} />}
            {openMenu === 'stats' && (
              <StatsPanel
                stats={game.stats}
                todayPuzzleNumber={game.todayPuzzleNumber}
                state={state}
                nextReset={nextReset}
                username={auth.profile?.username ?? null}
                boardRefreshKey={boardRefreshKey}
                onClose={closeMenu}
                onCountdownComplete={game.markNewPuzzleAvailable}
              />
            )}
            {openMenu === 'flashback' && (
              <FlashbackPanel
                todayPuzzleNumber={game.todayPuzzleNumber}
                mode={game.mode}
                currentPuzzleNumber={state.puzzleNumber}
                onPlay={handleFlashback}
                onReturnToDaily={handleReturnToDaily}
                onClose={closeMenu}
              />
            )}
          </Drawer>
        )}

        <main className="layout" id="main" tabIndex={-1}>
          {showResult && (
            <div className="result-slot">
              <Reveal>
                <ResultPanel
                  state={state}
                  prospect={prospect}
                  onShare={handleShare}
                  onOpenFilmRoom={handleOpenFilmRoom}
                  onReturnToDaily={handleReturnToDaily}
                  username={auth.profile?.username ?? null}
                />
              </Reveal>
            </div>
          )}

          {/* One column on every screen: status, photo + name, guess bar + picks, then the clue card. */}
          <div className="status-slot">
            <Reveal>
              <GameStatusBar state={state} currentGuessNumber={game.currentGuessNumber} maxGuesses={MAX_GUESSES} animateIndex={animateIndex} onReturnToDaily={handleReturnToDaily} />
            </Reveal>
          </div>

          <aside className="file" aria-label="Mystery prospect">
            <Reveal delay={140} className="file__inner">
              <MysteryPlayerCard
                prospect={prospect}
                state={state}
                excerpts={excerptClues}
                wrongGuesses={wrongGuesses}
                newStep={newStep}
                silhouetteShown={silhouetteShown}
                onToggleSilhouette={() => setSilhouetteShown(true)}
                beforeReport={guessBar}
              />
            </Reveal>
          </aside>

        </main>

        <footer className="footer">
            <button
              type="button"
              className="link footer__request"
              onClick={() => {
                setOpenMenu('request');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Request a prospect
            </button>
            <p className="footer__credit">
              All scouting report excerpts are sourced from{' '}
              <a href={EXCERPT_SOURCE_URL} target="_blank" rel="noopener noreferrer">
                {source}
              </a>
              .
            </p>
            <span className="footer__note">New prospect every day at midnight Eastern</span>
        </footer>
      </div>

      <Notification notification={notification} onClose={dismissNotification} />
      <Confetti fire={confetti} />
    </div>
  );
}
