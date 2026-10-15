import type { ReactNode } from 'react';
import type { Prospect } from '../data/types';
import { splitQuoteOnName } from '../game/redact';
import type { Clue } from '../game/types';
import { Panel } from './Panel';

interface Props {
  /** Excerpt clues, in unlock order */
  excerpts: Clue[];
  /** Whose name to black out in the quotes */
  prospect: Pick<Prospect, 'name' | 'aliases'>;
  wrongGuesses: number;
  revealAll: boolean;
  newStep: number | 'all' | null;
  /** The prospect card rows, shown as the second half of this card */
  children?: ReactNode;
}

function isNewClue(clue: Clue, wrongGuesses: number, newStep: number | 'all' | null): boolean {
  if (newStep == null) return false;
  return newStep === 'all' ? clue.unlockAt > wrongGuesses : clue.unlockAt === newStep;
}

/** A quote with every mention of the player blacked out. The name itself isn't in the page until revealed. */
function Quote({ text, prospect, reveal }: { text: string; prospect: Pick<Prospect, 'name' | 'aliases'>; reveal: boolean }) {
  if (reveal) return <>{text}</>;
  return (
    <>
      {splitQuoteOnName(text, prospect).map((s, i) =>
        s.isName ? (
          <span key={i} className="name-bar" style={{ ['--len' as string]: s.text.length }} role="img" aria-label="name hidden" />
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

/** One card for every clue: scouting report quotes on top, the prospect card rows below. */
export function ScoutingReportCard({ excerpts, prospect, wrongGuesses, revealAll, newStep, children }: Props) {
  const visible = excerpts.filter((c) => revealAll || c.unlockAt <= wrongGuesses);
  const nextLocked = excerpts.find((c) => !revealAll && c.unlockAt > wrongGuesses);

  return (
    <Panel className="report" aria-label="Real pre-draft scouting quotes">
      <div className="sect-head">
        <h3 className="sect-head__title">Real pre-draft scouting quotes</h3>
      </div>

      <ol className="excerpts">
        {visible.map((clue, i) => (
          <li key={clue.id} className={`excerpt ${isNewClue(clue, wrongGuesses, newStep) ? 'excerpt--new' : ''}`}>
            <span className="excerpt__n" aria-hidden>
              {String(i + 1).padStart(2, '0')}
            </span>
            <blockquote className="excerpt__quote">
              <p>
                “
                {clue.question && (
                  <strong className="excerpt__question">
                    <Quote text={clue.question} prospect={prospect} reveal={revealAll} />{' '}
                  </strong>
                )}
                <Quote text={clue.value} prospect={prospect} reveal={revealAll} />”
              </p>
              {clue.credit && (
                <p className="excerpt__credit">
                  - <Quote text={clue.credit} prospect={prospect} reveal={revealAll} />
                </p>
              )}
            </blockquote>
          </li>
        ))}
        {nextLocked && (
          <li className="excerpt excerpt--locked" aria-label="Locked excerpt">
            <span className="excerpt__n" aria-hidden>
              {String(visible.length + 1).padStart(2, '0')}
            </span>
            <div className="excerpt__redacted">
              <span className="redaction" style={{ ['--w' as string]: '100%' }} />
              <span className="redaction" style={{ ['--w' as string]: '88%' }} />
              <span className="redaction" style={{ ['--w' as string]: '54%' }} />
              <span className="eyebrow excerpt__caption">
                {nextLocked.unlockAt === wrongGuesses + 1 ? 'Unlocks on your next miss' : `Unlocks after guess ${nextLocked.unlockAt}`}
              </span>
            </div>
          </li>
        )}
      </ol>

      {children}
    </Panel>
  );
}
