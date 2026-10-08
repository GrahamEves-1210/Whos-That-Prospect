import type { Prospect } from '../data/types';
import { MAX_GUESSES } from '../game/config';
import { formatCountdown } from '../game/time';
import type { GameState } from '../game/types';
import { Countdown } from './Countdown';
import { BackIcon, FilmRoomIcon, ShareIcon } from './icons';
import { Button, Panel } from './Panel';

interface Props {
  state: GameState;
  prospect: Prospect;
  nextReset: number;
  onShare: () => void;
  onOpenFilmRoom: () => void;
  onReturnToDaily: () => void;
  onCountdownComplete: () => void;
}

/** Game-over banner: stamp, headline, meta, share / play again. Spans both columns. */
export function ResultPanel({ state, prospect, nextReset, onShare, onOpenFilmRoom, onReturnToDaily, onCountdownComplete }: Props) {
  const won = state.status === 'won';
  const elapsed = state.finishedAt != null ? state.finishedAt - state.startedAt : 0;

  return (
    <Panel className={`result result--${state.status}`} aria-label="Result">
      <div className={`stamp ${won ? 'stamp--won' : 'stamp--lost'}`} aria-hidden>
        {won ? `${state.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`}
        <small>{won ? 'Drafted' : 'Missed'}</small>
      </div>

      <div className="result__body">
        <h2 className="result__headline">{won ? 'You got it.' : 'The prospect was…'}</h2>
        <p className="result__sub">
          <strong>{prospect.name}</strong>
          {won
            ? ` in ${state.guesses.length} ${state.guesses.length === 1 ? 'guess' : 'guesses'}. Their full profile is unlocked below.`
            : `. Their full profile is unlocked below. New prospect tomorrow.`}
        </p>
        <div className="result__meta">
          <span className="eyebrow">
            Time <strong>{formatCountdown(elapsed)}</strong>
          </span>
          {state.mode === 'daily' ? (
            <span className="eyebrow">
              Next prospect in{' '}
              <strong>
                <Countdown target={nextReset} onComplete={onCountdownComplete} />
              </strong>
            </span>
          ) : (
            <span className="eyebrow">{state.mode === 'practice' ? 'Practice, not counted' : `Film room No. ${state.puzzleNumber}, not counted`}</span>
          )}
        </div>
      </div>

      <div className="result__actions">
        <Button variant="primary" icon={<ShareIcon />} label="Share result" onClick={onShare} />
        <Button icon={<FilmRoomIcon />} label="Film room" onClick={onOpenFilmRoom} />
        {state.mode !== 'daily' && <Button variant="ghost" icon={<BackIcon />} label="Back to today" onClick={onReturnToDaily} />}
      </div>
    </Panel>
  );
}
