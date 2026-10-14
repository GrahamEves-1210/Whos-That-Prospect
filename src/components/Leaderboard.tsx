import { useEffect, useState } from 'react';
import { fetchLeaderboard, getCachedLeaderboard, supabase, type LeaderboardEntry } from '../lib/supabase';
import { Panel } from './Panel';

interface Props {
  /** Signed-in username, highlighted in the list */
  me: string | null;
  /** Bumps when the player's own result was just submitted, to refetch */
  refreshKey: number;
}

/** Leaderboard tile for the stats bento: correct guesses and current streak. */
export function Leaderboard({ me, refreshKey }: Props) {
  // Start from the prefetched list so the sheet doesn't change height while it animates open
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(() => getCachedLeaderboard());
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    setError(false);
    fetchLeaderboard()
      .then((d) => !cancelled && setRows(d))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <Panel className="tile tile--board" aria-label="Leaderboard">
      <div className="tile__head">
        <span className="eyebrow">Leaderboard</span>
        {rows && rows.length > 0 && <span className="tile__aside">Top {rows.length}</span>}
      </div>

      {!supabase ? (
        <p className="board__empty">The leaderboard switches on once accounts are set up.</p>
      ) : error ? (
        <p className="board__empty">Couldn’t load the leaderboard. Try again in a moment.</p>
      ) : rows == null ? (
        <ol className="board-list" aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="board-row board-row--skeleton">
              <span className="redaction" style={{ ['--w' as string]: `${70 - i * 12}%` }} />
            </li>
          ))}
        </ol>
      ) : rows.length === 0 ? (
        <p className="board__empty">No results yet. Sign in from Profile and finish today’s prospect to get on the board.</p>
      ) : (
        <table className="board-table">
          <thead>
            <tr>
              <th scope="col" className="board-table__rank">
                <span className="sr-only">Rank</span>
              </th>
              <th scope="col">Player</th>
              <th scope="col" className="board-table__num">
                <span className="th-long">Correct guesses</span>
                <span className="th-short" aria-hidden>
                  Correct
                </span>
              </th>
              <th scope="col" className="board-table__num">
                <span className="th-long">Current streak</span>
                <span className="th-short" aria-hidden>
                  Streak
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.username} className={r.username === me ? 'is-me' : ''}>
                <td className="board-table__rank">
                  <span className={`rank rank--${i + 1}`}>{i + 1}</span>
                </td>
                <td className="board-table__name">
                  <span className="board-table__user">{r.username}</span>
                  {r.username === me && <span className="you">You</span>}
                </td>
                <td className="board-table__num">{r.correct_guesses}</td>
                <td className="board-table__num">{r.current_streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}
