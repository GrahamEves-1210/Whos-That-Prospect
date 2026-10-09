import { DEFAULT_EXCERPT_SOURCE, EXCERPT_SOURCE_URL } from '../data/prospects';
import type { Prospect } from '../data/types';
import { formatPuzzleNumberDate } from '../game/time';
import { Headshot } from './Headshot';
import { ArrowIcon } from './icons';
import { Logo } from './Logo';
import { Panel } from './Panel';

interface Props {
  prospect: Prospect;
  puzzleNumber: number;
  leaving: boolean;
  onPlay: () => void;
}

/** Editorial split: logo and copy on the left, today's hidden prospect on the right. */
export function SplashScreen({ prospect, puzzleNumber, leaving, onPlay }: Props) {
  return (
    <article className={`splash ${leaving ? 'splash--leaving' : ''}`} aria-label="Welcome">
      <div className="splash__copy">
        <h1 style={{ ['--i' as string]: 0 }}>
          <Logo className="splash__logo" />
        </h1>
        <p className="splash__lead" style={{ ['--i' as string]: 1 }}>
          Read the real pre-draft scouting report and guess the prospect. Every miss unlocks another clue. Try {formatPuzzleNumberDate(puzzleNumber)}’s report.
        </p>
        <div className="splash__actions" style={{ ['--i' as string]: 2 }}>
          <button type="button" className="splash__cta" onClick={onPlay}>
            Play today’s prospect
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div className="splash__visual" aria-hidden>
        <div className="splash__float">
          <Panel className="splash__file">
            <span className="file-tab">Mystery prospect</span>
            <Headshot prospect={prospect} revealed={false} />
          </Panel>
        </div>
      </div>

      <p className="splash__credit">
        <span className="credit-long">All scouting report excerpts are sourced from</span>
        <span className="credit-short">Scouting quotes from</span>{' '}
        <a href={EXCERPT_SOURCE_URL} target="_blank" rel="noopener noreferrer">
          {DEFAULT_EXCERPT_SOURCE}
        </a>
        .
      </p>
    </article>
  );
}
