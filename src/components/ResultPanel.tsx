import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { loadTeamFont, TEAM_COLORS, TEAM_FONTS } from '../data/teams';
import type { Prospect } from '../data/types';
import { MAX_GUESSES } from '../game/config';
import { pickSlip } from '../game/slip';
import { formatCountdown } from '../game/time';
import type { GameState } from '../game/types';
import { DraftLogo } from './DraftLogo';
import { BackIcon, FilmRoomIcon, ShareIcon } from './icons';
import { Button, Panel } from './Panel';

interface Props {
  state: GameState;
  prospect: Prospect;
  onShare: () => void;
  onOpenFilmRoom: () => void;
  onReturnToDaily: () => void;
  /** Signed-in player's username, written on the card's "Choice from" line */
  username: string | null;
}

function Line({ label, children, under, aside, small }: { label: string; children?: ReactNode; under?: string[]; aside?: string; small?: boolean }) {
  return (
    <div className="slip__row">
      <span className="slip__label">{label}</span>
      <span className="slip__line">
        <span className={['slip__pen', under ? 'slip__pen--split' : '', small ? 'slip__pen--small' : ''].filter(Boolean).join(' ')}>{children}</span>
        {under && (
          <span className="slip__under" aria-hidden>
            {under.map((u) => (
              <span key={u}>{u}</span>
            ))}
          </span>
        )}
      </span>
      {aside && <span className="slip__aside">{aside}</span>}
    </div>
  );
}

/** Game over. A win shows the answer as a filled-out draft-day pick card, with score, time and actions beside it. */
export function ResultPanel({ state, prospect, onShare, onOpenFilmRoom, onReturnToDaily, username }: Props) {
  const won = state.status === 'won';
  const elapsed = state.finishedAt != null ? state.finishedAt - state.startedAt : 0;
  const slip = pickSlip(prospect);
  const colors = TEAM_COLORS[slip.nickname];
  const teamStyle = colors ? ({ '--team': colors.primary, '--team-2': colors.secondary } as CSSProperties) : undefined;
  const font = TEAM_FONTS[slip.nickname];
  useEffect(() => {
    if (won && font) loadTeamFont(font);
  }, [won, font]);
  const wordmarkStyle: CSSProperties | undefined = font
    ? {
        fontFamily: `'${font.family}', 'Alfa Slab One', Georgia, serif`,
        fontWeight: font.weight,
        textTransform: font.lowercase ? 'lowercase' : 'uppercase',
        transform: font.italic ? 'skewX(-10deg)' : undefined,
      }
    : undefined;
  const stamp = (
    <div className={`stamp ${won ? 'stamp--won' : 'stamp--lost'}`} aria-hidden>
      {won ? `${state.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`}
      <small>{won ? 'Guesses' : 'Missed'}</small>
    </div>
  );

  return (
    <Panel className={`result result--${state.status}`} aria-label="Result">
      {won ? (
        <article className="slip" style={teamStyle} aria-label={`Pick card: ${prospect.name}`}>
          <DraftLogo year={slip.year} className="slip__logo" />
          <div className="slip__rows">
            <Line label="Round#" aside={slip.city || slip.nickname}>
              {slip.round}
            </Line>
            <Line label="Choice From:">{username ?? undefined}</Line>
            {/* long names write smaller so both fit on the line */}
            <Line label="Name:" under={['(last)', '(first)']} small={slip.last.length + slip.first.length > 15}>
              <span>{slip.last}</span>
              <span>{slip.first}</span>
            </Line>
            <Line label="Position:">{slip.position}</Line>
            <Line label="School:">{slip.school}</Line>
            <Line label="Overall:">{slip.overall}</Line>
          </div>
          {slip.nickname && (
            <p className="slip__team" style={wordmarkStyle}>
              {slip.nickname}
            </p>
          )}
        </article>
      ) : (
        stamp
      )}

      <div className="result__body">
        <div className="result__head">
          {won && stamp}
          <h2 className="result__headline">{won ? 'You got it.' : 'The prospect was…'}</h2>
        </div>
        <p className="result__sub">
          <strong>{prospect.name}</strong>
          {won
            ? ` in ${state.guesses.length} ${state.guesses.length === 1 ? 'guess' : 'guesses'}. Their full profile is shown below.`
            : `. Their full profile is shown below. New prospect tomorrow.`}
        </p>
        <div className="result__meta">
          <span className="eyebrow">
            Time <strong>{formatCountdown(elapsed)}</strong>
          </span>
          {state.mode !== 'daily' && (
            <span className="eyebrow">{state.mode === 'practice' ? 'Practice, not counted' : `Film room No. ${state.puzzleNumber}, not counted`}</span>
          )}
        </div>
        <div className="result__actions">
          <Button variant="primary" icon={<ShareIcon />} label="Share result" onClick={onShare} />
          <Button icon={<FilmRoomIcon />} label="Film room" onClick={onOpenFilmRoom} />
          {state.mode !== 'daily' && <Button variant="ghost" icon={<BackIcon />} label="Back to today" onClick={onReturnToDaily} />}
        </div>
      </div>
    </Panel>
  );
}
