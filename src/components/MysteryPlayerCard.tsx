import type { ReactNode } from 'react';
import { POSITION_NAMES, type Prospect } from '../data/types';
import { POSITION_STEP } from '../game/clues';
import type { Clue, GameState } from '../game/types';
import { Headshot } from './Headshot';
import { EyeIcon } from './icons';
import { Panel } from './Panel';
import { ClueBoard } from './ClueBoard';
import { ScoutingReportCard } from './ScoutingReportCard';

interface Props {
  prospect: Prospect;
  state: GameState;
  excerpts: Clue[];
  wrongGuesses: number;
  newStep: number | 'all' | null;
  silhouetteShown: boolean;
  /** One-way: sharpens the blurred shape and removes the button */
  onToggleSilhouette: () => void;
  /** Rendered between the photo block and the clue card (the guess bar and picks) */
  beforeReport?: ReactNode;
}

/** Photo + identity block, then the scouting report. Everything unlocks when the game ends. */
export function MysteryPlayerCard({
  prospect,
  state,
  excerpts,
  wrongGuesses,
  newStep,
  silhouetteShown,
  onToggleSilhouette,
  beforeReport,
}: Props) {
  const finished = state.status !== 'playing';
  // Position is blanked out until the first miss, when it unlocks alongside the second excerpt.
  const positionShown = finished || wrongGuesses >= POSITION_STEP;
  const positionNew = positionShown && (newStep === 'all' || newStep === POSITION_STEP);

  return (
    <>
      <div className="file__top">
        <Panel className={`file-card ${finished ? `file-card--${state.status}` : ''}`}>
          <Headshot prospect={prospect} revealed={finished} silhouette={silhouetteShown} />
          {!finished && !silhouetteShown && (
            <button type="button" className="file-card__reveal" onClick={onToggleSilhouette}>
              <EyeIcon />
              Show silhouette
            </button>
          )}
        </Panel>

        <div className="identity">
          <h3 className={`identity__name ${finished ? '' : 'identity__name--hidden'}`} aria-label={finished ? prospect.name : 'Mystery prospect'}>
            {finished ? prospect.name : '? ? ?'}
          </h3>
          <div className="identity__meta">
            <div className="kv">
              <span className="eyebrow">Position</span>
              {positionShown ? (
                <span className={`kv__pos ${positionNew ? 'kv__pos--new' : ''}`}>
                  <span className="chip">{prospect.position}</span>
                  {POSITION_NAMES[prospect.position]}
                </span>
              ) : (
                <span className="redaction kv__redaction" style={{ ['--w' as string]: '9rem' }} aria-label="Position: locked" />
              )}
            </div>
          </div>
        </div>
      </div>

      {beforeReport}

      <ScoutingReportCard excerpts={excerpts} wrongGuesses={wrongGuesses} revealAll={finished} newStep={newStep}>
        <ClueBoard prospect={prospect} wrongGuesses={wrongGuesses} revealAll={finished} newStep={newStep} />
      </ScoutingReportCard>
    </>
  );
}
