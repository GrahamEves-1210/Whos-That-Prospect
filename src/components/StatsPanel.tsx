import { MAX_GUESSES } from '../game/config';
import { getDisplayStreak } from '../game/storage';
import type { GameState, Stats } from '../game/types';
import { Countdown } from './Countdown';
import { Leaderboard } from './Leaderboard';
import { Panel } from './Panel';

interface Props {
  stats: Stats;
  todayPuzzleNumber: number;
  state: GameState;
  nextReset: number;
  username: string | null;
  boardRefreshKey: number;
  onClose: () => void;
  onCountdownComplete: () => void;
}

/** Bento: distribution tile, four number tiles, countdown, leaderboard. Sharing lives on the result banner only. */
export function StatsPanel({ stats, todayPuzzleNumber, state, nextReset, username, boardRefreshKey, onCountdownComplete }: Props) {
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxBucket = Math.max(1, ...stats.guessDistribution);
  const finishedToday = state.mode === 'daily' && state.status !== 'playing';
  const highlight = finishedToday && state.status === 'won' ? state.guesses.length - 1 : -1;

  const numbers: Array<[string, number | string, string]> = [
    ['Played', stats.played, 'gold'],
    ['Win rate', `${winPct}%`, 'turf'],
    ['Current streak', getDisplayStreak(stats, todayPuzzleNumber), 'orange'],
    ['Max streak', stats.maxStreak, 'sky'],
  ];

  return (
    <section className="stats" aria-label="Statistics">
      <Panel className="tile tile--dist">
        <div className="tile__head">
          <span className="eyebrow">Guess distribution</span>
          <span className="tile__aside">
            {stats.wins} {stats.wins === 1 ? 'win' : 'wins'}
          </span>
        </div>
        <ol className="dist" aria-label="Wins by number of guesses">
          {Array.from({ length: MAX_GUESSES }, (_, i) => {
            const n = stats.guessDistribution[i] ?? 0;
            const pct = n === 0 ? 0 : Math.max(6, Math.round((n / maxBucket) * 100));
            return (
              <li className={`dist__row ${i === highlight ? 'dist__row--today' : ''}`} key={i}>
                <span className="dist__n">{i + 1}</span>
                <div className="dist__track">
                  <div className="dist__fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="dist__count">{n}</span>
              </li>
            );
          })}
        </ol>
        {stats.played === 0 && <p className="dist__empty">Finish today’s prospect and your first result lands here.</p>}
      </Panel>

      {numbers.map(([label, value, tone]) => (
        <Panel className="tile tile--num" data-tone={tone} key={label}>
          <span className="eyebrow">{label}</span>
          <span className="tile__value">{value}</span>
        </Panel>
      ))}

      {finishedToday && (
        <Panel className="tile tile--next" data-tone="manila">
          <span className="eyebrow">Next prospect in</span>
          <span className="tile__value">
            <Countdown target={nextReset} onComplete={onCountdownComplete} />
          </span>
        </Panel>
      )}

      <Leaderboard me={username} refreshKey={boardRefreshKey} />

    </section>
  );
}
