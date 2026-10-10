import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { GuessOutcome } from '../game/types';
import type { GameEvent } from '../hooks/useGame';
import { ArrowIcon } from './icons';
import { Button } from './Panel';

interface Props {
  onSubmit: (raw: string) => GuessOutcome;
  /** Spend a guess without naming anyone, to unlock the next clue */
  onSkip: () => void;
  disabled: boolean;
  lastEvent: GameEvent | null;
}

/** Label above, input + submit, helper text and inline error below. */
export function GuessInput({ onSubmit, onSkip, disabled, lastEvent }: Props) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!lastEvent) return;
    const k = lastEvent.outcome.kind;
    if (k === 'duplicate') setError('You already guessed that prospect.');
    else if (k === 'empty') setError('Type a prospect’s name first.');
    else setError(null);
    const skipped = lastEvent.outcome.kind === 'wrong' && lastEvent.outcome.skipped;
    if ((k === 'wrong' && !skipped) || k === 'duplicate' || k === 'empty') setShake(lastEvent.id);
  }, [lastEvent]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const outcome = onSubmit(value);
    if (outcome.kind === 'wrong' || outcome.kind === 'correct') setValue('');
    inputRef.current?.focus();
  };

  const hasText = value.trim().length > 0;
  const classes = ['guessform', shake ? 'guessform--shake' : '', error ? 'guessform--error' : ''].filter(Boolean).join(' ');

  return (
    <form className={classes} onSubmit={handleSubmit} autoComplete="off" key={shake} noValidate>
      <label htmlFor="guess-input" className="sr-only">
        Who’s the prospect?
      </label>
      <div className="guessform__row">
        <input
          ref={inputRef}
          id="guess-input"
          className="guessform__input"
          type="text"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={disabled ? 'Game over' : 'Type the prospect’s name'}
          value={value}
          disabled={disabled}
          maxLength={60}
          aria-invalid={error ? true : undefined}
          aria-describedby="guess-help guess-error"
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
        />
        <div className="guessform__actions">
        <Button
          type="submit"
          variant="primary"
          className="guessform__submit"
          icon={<ArrowIcon />}
          label="Guess"
          disabled={disabled || !hasText}
          aria-label="Submit guess"
        />
        {!disabled && (
          <button type="button" className="guessform__skip" onClick={onSkip} aria-label="Skip this guess for a new clue">
            Skip
          </button>
        )}
        </div>
      </div>
      <div className="guessform__foot">
        <span id="guess-help" className="guessform__help">
          Punctuation and one typo are forgiven.
        </span>
      </div>
      <p id="guess-error" className="form-error" role="alert" aria-live="assertive">
        {error}
      </p>
    </form>
  );
}
