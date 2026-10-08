import { formatPuzzleNumberDate } from '../game/time';
import type { GameState } from '../game/types';
import { Timer } from './Timer';

interface Props {
  state: GameState;
  currentGuessNumber: number;
  maxGuesses: number;
  /** Index of the tick that just filled (for the pop animation), or -1 */
  animateIndex: number;
  /** Film room / practice: leave and go back to today's prospect */
  onReturnToDaily: () => void;
}

/** Board header: title, "on the clock" timer, guess ticks and "Guess 2 of 6". */
export function GameStatusBar({ state, currentGuessNumber, maxGuesses, animateIndex, onReturnToDaily }: Props) {
  const finished = state.status !== 'playing';
  const guessText =
    state.status === 'won'
      ? `Solved in ${state.guesses.length} of ${maxGuesses}`
      : state.status === 'lost'
        ? `Out of guesses`
        : `Guess ${Math.min(currentGuessNumber, maxGuesses)} of ${maxGuesses}`;

  return (
    <div className="status">
      <div className="status__title">
        <h2 className="sr-only">Mystery prospect</h2>
        {state.puzzleNumber > 0 && (
          <span className="status__date">
            {state.mode === 'preview' && <span className="status__mode">Film room</span>}
            {formatPuzzleNumberDate(state.puzzleNumber)}
          </span>
        )}
        {state.mode !== 'daily' && (
          <button type="button" className="link status__back" onClick={onReturnToDaily}>
            Back to today
          </button>
        )}
      </div>
      <div className="status__right">
        <div className="status__clock">
          <span className="eyebrow">{finished ? 'Final time' : 'On the clock'}</span>
          <Timer startedAt={state.startedAt} finishedAt={state.finishedAt} />
        </div>
        <div className="status__guess">
          <span className="status__guess-text" aria-live="polite">
            {guessText}
          </span>
          <ol className="ticks" aria-label="Guesses used">
            {Array.from({ length: maxGuesses }, (_, i) => {
              const guess = state.guesses[i];
              const correct = state.status === 'won' && i === state.guesses.length - 1;
              const cls = [
                'tick',
                guess ? (correct ? 'tick--correct' : 'tick--wrong') : i === state.guesses.length && !finished ? 'tick--current' : '',
                i === animateIndex ? 'tick--new' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return <li key={i} className={cls} aria-label={guess ? (correct ? 'correct' : 'wrong') : 'unused'} />;
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
