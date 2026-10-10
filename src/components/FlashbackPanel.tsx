import type { GameMode } from '../game/types';
import { getFilmRoomDays } from '../game/daily';
import { PINNED_PUZZLES } from '../data/prospects';
import { formatPuzzleNumberDate } from '../game/time';
import { Panel } from './Panel';

interface Props {
  todayPuzzleNumber: number;
  mode: GameMode;
  currentPuzzleNumber: number;
  onPlay: (puzzleNumber: number) => void;
  onReturnToDaily: () => void;
  onClose: () => void;
}

/** Film room: every day from No. 1 to today, oldest first. Today (peach) goes back to the daily game. */
export function FlashbackPanel({ todayPuzzleNumber, mode, currentPuzzleNumber, onPlay, onReturnToDaily }: Props) {
  // Oldest first, and only as far back as there are different prospects
  const past = getFilmRoomDays(todayPuzzleNumber).reverse();
  // Local dev only (npm run dev): upcoming pinned days too, for testing. Never in the live build.
  const upcoming = import.meta.env.DEV
    ? Object.keys(PINNED_PUZZLES).map(Number).filter((n) => n > todayPuzzleNumber).sort((a, b) => a - b)
    : [];

  return (
    <Panel className="sheet" aria-label="Film room">
      <h3 className="sheet__title">Film room</h3>
      <p className="flashback__lead">Pick a past day to replay its prospect. Film room games don’t count toward your stats.</p>

      <ol className="days" aria-label="Prospects by day">
        {past.map((n) => (
          <li key={n}>
            <button type="button" className="day" aria-current={(mode === 'preview' && n === currentPuzzleNumber) || undefined} onClick={() => onPlay(n)}>
              <span className="day__n">{formatPuzzleNumberDate(n)}</span>
              <span className="day__date">No. {n}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="day day--today" aria-current={mode === 'daily' || undefined} onClick={onReturnToDaily}>
            <span className="day__n">{formatPuzzleNumberDate(todayPuzzleNumber)}</span>
            <span className="day__date">Today · No. {todayPuzzleNumber}</span>
          </button>
        </li>
        {upcoming.map((n) => (
          <li key={n}>
            <button type="button" className="day" aria-current={(mode === 'preview' && n === currentPuzzleNumber) || undefined} onClick={() => onPlay(n)}>
              <span className="day__n">{formatPuzzleNumberDate(n)}</span>
              <span className="day__date">Upcoming (dev) · No. {n}</span>
            </button>
          </li>
        ))}
      </ol>

    </Panel>
  );
}
