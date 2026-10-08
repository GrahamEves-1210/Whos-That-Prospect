import { GAME_TITLE, MAX_GUESSES, SITE_URL } from './config';
import { isSkip } from './engine';
import { formatShortTime } from './time';
import type { GameState } from './types';

/**
 * Share text for a finished game. Never includes the answer.
 *
 *   Who's That Prospect? #42
 *   🟥🟥🟥🟩 4/6 · ⏱️ 1:42
 *   whosthatprospect.com
 */
export function generateShareText(
  state: Pick<GameState, 'mode' | 'puzzleNumber' | 'status' | 'guesses' | 'startedAt' | 'finishedAt'>,
): string {
  const label =
    state.mode === 'practice'
      ? 'Practice'
      : `#${state.puzzleNumber}`;

  const won = state.status === 'won';
  const used = state.guesses.length;
  const wrong = won ? Math.max(0, used - 1) : used;
  // 🟥 miss, ⬜ skip, 🟩 correct
  const squares = state.guesses.slice(0, wrong).map((g) => (isSkip(g) ? '⬜' : '🟥')).join('') + (won ? '🟩' : '');
  const score = won ? `${used}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const time = state.finishedAt != null ? ` · ⏱️ ${formatShortTime(state.finishedAt - state.startedAt)}` : '';

  return [`${GAME_TITLE} ${label}`, `${squares} ${score}${time}`.trim(), SITE_URL].join('\n');
}

/** 'cancelled' = the player closed the share sheet; not an error, so show nothing. */
export type ShareMethod = 'share' | 'clipboard' | 'cancelled' | 'none';

/** Try the Web Share API, then the clipboard. Resolves with the method used. */
export async function shareText(text: string): Promise<ShareMethod> {
  if (typeof navigator === 'undefined') return 'none';

  const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
  if (typeof nav.share === 'function' && isLikelyMobile()) {
    try {
      await nav.share({ text });
      return 'share';
    } catch (err) {
      // Player closed the share sheet: not a failure, and don't fall through to the clipboard
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'clipboard';
    }
  } catch {
    /* fall through */
  }

  if (legacyCopy(text)) return 'clipboard';
  return 'none';
}

function isLikelyMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
