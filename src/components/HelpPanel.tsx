import { DEFAULT_EXCERPT_SOURCE, EXCERPT_SOURCE_URL } from '../data/prospects';
import { MAX_GUESSES } from '../game/config';
import { Panel } from './Panel';

interface Props {
  onClose: () => void;
}

const LADDER: Array<[string, string]> = [
  ['Start', 'One scouting-report quote'],
  ['Miss 1', 'Position and measurables: size, length and testing'],
  ['Miss 2', 'A second scouting-report quote'],
  ['Miss 3', 'Background: conference, draft class, hometown, college honors'],
  ['Miss 4', 'Draft: college, draft pick, the team that drafted him'],
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
          <p className="help__note">The last name alone works. Capitalization, punctuation and suffixes like Jr. don’t matter, and one typo still counts.</p>
          <p className="help__note">
            Scouting report quotes are from{' '}
            <a className="link" href={EXCERPT_SOURCE_URL} target="_blank" rel="noopener noreferrer">
              {DEFAULT_EXCERPT_SOURCE}
            </a>
            .
          </p>
          <p className="help__note">Who’s That Prospect? is a fan-made game and is not affiliated with or endorsed by the NFL.</p>
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
