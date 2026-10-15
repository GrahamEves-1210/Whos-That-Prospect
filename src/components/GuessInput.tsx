import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { PROSPECTS } from '../data/prospects';
import { loadNameIndex, searchNames, type NameEntry } from '../game/names';
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

  // Name suggestions: every drafted player since 2000, loaded the first time the box is used
  const [index, setIndex] = useState<NameEntry[] | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const loadIndex = () => {
    if (!index) loadNameIndex(PROSPECTS).then(setIndex);
  };
  const suggestions = useMemo(() => (index ? searchNames(index, value) : []), [index, value]);
  const showList = open && !disabled && suggestions.length > 0;
  useEffect(() => setActive(-1), [value]);

  // Picking a name guesses it straight away
  const pick = (entry: NameEntry) => {
    if (error) setError(null);
    submitGuess(entry.name);
  };

  // Keep the list fully visible: size it to the room below the box (above the phone nav bar and the
  // on-screen keyboard), or open it upward when there's more room above.
  const fieldRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{ up: boolean; max: number }>({ up: false, max: 360 });
  useLayoutEffect(() => {
    if (!showList) return;
    const place = () => {
      const field = fieldRef.current;
      if (!field) return;
      const r = field.getBoundingClientRect();
      const vv = window.visualViewport;
      let bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      const bar = document.querySelector<HTMLElement>('.toolbar');
      if (bar && getComputedStyle(bar).position === 'fixed') bottom = Math.min(bottom, bar.getBoundingClientRect().top);
      // ...and above a toast showing at the bottom of the screen (e.g. after a miss)
      const notice = document.querySelector<HTMLElement>('.notice--visible');
      if (notice) {
        const n = notice.getBoundingClientRect();
        if (n.top > r.bottom) bottom = Math.min(bottom, n.top);
      }
      const top = vv ? vv.offsetTop : 0;
      const below = bottom - r.bottom - 14;
      const above = r.top - top - 14;
      const up = below < 180 && above > below;
      setPlacement({ up, max: Math.max(96, Math.min(360, up ? above : below)) });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [showList, suggestions.length]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!lastEvent) return;
    const k = lastEvent.outcome.kind;
    if (k === 'duplicate') setError('You already guessed that prospect.');
    else if (k === 'empty') setError('Type a prospect’s name first.');
    else setError(null);
    const skipped = lastEvent.outcome.kind === 'wrong' && lastEvent.outcome.skipped;
    if ((k === 'wrong' && !skipped) || k === 'duplicate' || k === 'empty') setShake(lastEvent.id);
  }, [lastEvent]);

  function submitGuess(raw: string) {
    if (disabled) return;
    const outcome = onSubmit(raw);
    setValue(outcome.kind === 'wrong' || outcome.kind === 'correct' ? '' : raw);
    setOpen(false);
    inputRef.current?.focus();
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitGuess(value);
  };

  const hasText = value.trim().length > 0;
  const classes = ['guessform', shake ? 'guessform--shake' : '', error ? 'guessform--error' : ''].filter(Boolean).join(' ');

  return (
    <form className={classes} onSubmit={handleSubmit} autoComplete="off" key={shake} noValidate>
      <label htmlFor="guess-input" className="sr-only">
        Who’s the prospect?
      </label>
      <div className="guessform__row">
        <div className="guessform__field" ref={fieldRef}>
          <input
            ref={inputRef}
            id="guess-input"
            className="guessform__input"
            type="text"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={disabled ? 'Game over' : 'Last name or full name'}
            value={value}
            disabled={disabled}
            maxLength={60}
            aria-invalid={error ? true : undefined}
            aria-describedby="guess-help guess-error"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls="guess-suggestions"
            aria-activedescendant={showList && active >= 0 ? `guess-option-${active}` : undefined}
            onFocus={loadIndex}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              loadIndex();
              if (error) setError(null);
            }}
          />
          {showList && (
            <ul
              id="guess-suggestions"
              className={`suggest ${placement.up ? 'suggest--up' : ''}`}
              style={{ maxHeight: placement.max } as CSSProperties}
              role="listbox"
              aria-label="Matching players"
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.name}-${s.year}`}
                  id={`guess-option-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`suggest__item ${i === active ? 'is-active' : ''}`}
                  // mousedown, not click: picks before the input loses focus and closes the list
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(s);
                  }}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="suggest__name">{s.name}</span>
                  <span className="suggest__year">{s.udfa ? `UDFA ${s.year}` : s.year}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
          Last name works. One typo is forgiven.
        </span>
      </div>
      <p id="guess-error" className="form-error" role="alert" aria-live="assertive">
        {error}
      </p>
    </form>
  );
}
