import type { GameStatus } from '../game/types';
import { isSkip } from '../game/engine';
import { CheckIcon, CloseIcon } from './icons';

interface Props {
  guesses: string[];
  status: GameStatus;
  maxGuesses: number;
  /** Row index (0-based) that should animate in, or -1 */
  animateIndex: number;
}

/** Pick chips appear one by one as you guess; nothing shows before the first guess. */
export function GuessHistory({ guesses, status, maxGuesses, animateIndex }: Props) {
  if (guesses.length === 0) return null;
  return (
    <section className="history" aria-label={`Your picks, ${guesses.length} of ${maxGuesses} used`}>
      <ol className="picks">
        {guesses.map((_, i) => {
          const guess = guesses[i];
          const filled = guess != null;
          const correct = filled && status === 'won' && i === guesses.length - 1;
          const skipped = filled && isSkip(guess);
          const classes = [
            'slot',
            filled ? (correct ? 'slot--correct' : skipped ? 'slot--skip' : 'slot--wrong') : 'slot--empty',
            filled && i === animateIndex ? 'slot--new' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={i} className={classes} aria-label={filled ? `Pick ${i + 1}: ${skipped ? 'skipped' : `${guess}, ${correct ? 'correct' : 'wrong'}`}` : `Pick ${i + 1}: unused`}>
              <span className="slot__index" aria-hidden>
                {i + 1}
              </span>
              {filled && <span className="slot__name">{skipped ? 'Skipped' : guess}</span>}
              {filled && !skipped && (
                <span className="slot__mark" aria-hidden>
                  {correct ? <CheckIcon /> : <CloseIcon />}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
