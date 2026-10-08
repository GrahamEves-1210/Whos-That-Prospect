import { DEFAULT_EXCERPT_SOURCE, EXCERPT_SOURCE_URL } from '../data/prospects';
import { MAX_GUESSES } from '../game/config';
import { Panel } from './Panel';

interface Props {
  onClose: () => void;
}

const LADDER: Array<[string, string]> = [
  ['Start', 'One scouting-report quote'],
  ['Miss 1', 'Position and a second quote'],
  ['Miss 2', 'Height and weight'],
  ['Miss 3', 'Combine testing'],
  ['Miss 4', 'Conference, draft class, hometown'],
  ['Miss 5', 'College, draft pick, honors'],
];

/** How to play, what each miss unlocks, and the source credit (this used to be a separate About panel). */
export function HelpPanel(_props: Props) {
  return (
    <Panel className="sheet" aria-label="How to play">
      <div className="help">
        <div>
          <h3 className="sheet__title">How to play</h3>
          <p>
            Read the day’s real pre-draft scouting report and name the prospect in <strong>{MAX_GUESSES} guesses</strong>.
            Every miss unlocks another clue. A new prospect drops at <strong>midnight Eastern</strong>.
          </p>
          <p className="help__note">Capitalization, punctuation and suffixes like Jr. don’t matter, and one typo still counts.</p>
          <p className="help__note">
            Scouting report quotes are from{' '}
            <a className="link" href={EXCERPT_SOURCE_URL} target="_blank" rel="noopener noreferrer">
              {DEFAULT_EXCERPT_SOURCE}
            </a>
            .
          </p>
        </div>
        <div>
          <h4 className="help__subtitle">What each miss unlocks</h4>
          <ol className="ladder">
            {LADDER.map(([step, text]) => (
              <li key={step}>
                <span className="ladder__step">{step}</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Panel>
  );
}
