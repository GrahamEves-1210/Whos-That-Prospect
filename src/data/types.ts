/**
 * Prospect data model.
 *
 * This file (and prospects.ts next to it) is intentionally standalone so that
 * real prospect data and licensed NFL Draft Bible excerpts can be dropped in
 * later without touching the game logic or UI.
 */

export type Position =
  | 'QB'
  | 'RB'
  | 'WR'
  | 'TE'
  | 'OT'
  | 'OG'
  | 'C'
  | 'EDGE'
  | 'DL'
  | 'LB'
  | 'CB'
  | 'S'
  | 'K'
  | 'P'
  | 'LS';

export const POSITION_NAMES: Record<Position, string> = {
  QB: 'Quarterback',
  RB: 'Running Back',
  WR: 'Wide Receiver',
  TE: 'Tight End',
  OT: 'Offensive Tackle',
  OG: 'Offensive Guard',
  C: 'Center',
  EDGE: 'Edge Rusher',
  DL: 'Defensive Line',
  LB: 'Linebacker',
  CB: 'Cornerback',
  S: 'Safety',
  K: 'Kicker',
  P: 'Punter',
  LS: 'Long Snapper',
};

export type PositionSide = 'offense' | 'defense' | 'specialists';

export const POSITION_SIDE: Record<Position, PositionSide> = {
  QB: 'offense',
  RB: 'offense',
  WR: 'offense',
  TE: 'offense',
  OT: 'offense',
  OG: 'offense',
  C: 'offense',
  EDGE: 'defense',
  DL: 'defense',
  LB: 'defense',
  CB: 'defense',
  S: 'defense',
  K: 'specialists',
  P: 'specialists',
  LS: 'specialists',
};

/**
 * A prospect-specific clue card. Lets each prospect carry slightly different
 * clue fields (e.g. "Background: converted soccer goalkeeper").
 */
export interface CustomClue {
  /** Short label shown on the clue card, e.g. "Background" */
  label: string;
  /** Text revealed on the card */
  value: string;
  /**
   * Number of wrong guesses required to unlock (0–5).
   * Omit to place the clue in the final reveal step.
   */
  unlockAt?: number;
}

export interface Prospect {
  /** Stable unique id — used for persistence, so never change it once published */
  id: string;
  /** Display name — the answer */
  name: string;
  /** Alternate spellings / nicknames that should also count as correct */
  aliases?: string[];
  position: Position;
  college: string;
  conference: string;
  /** NFL-style height string in feet-inches, e.g. "6-3" */
  height: string;
  /** Weight in pounds */
  weight: number;
  draftYear: number;
  /** Draft round; null = undrafted */
  draftRound: number | null;
  /** Overall pick; null = undrafted */
  draftPick: number | null;
  /** 40-yard dash, seconds */
  fortyTime?: number;
  /** Vertical jump, inches */
  vertical?: number;
  /** Broad jump, inches (e.g. 121 → 10'1") */
  broadJump?: number;
  /** Other testing / measurements: bench reps, 3-cone, shuttle, hand size, arm length… */
  otherTesting?: Record<string, string | number>;
  /**
   * Scouting-report excerpts. Excerpt 1 is shown at the start, excerpt 2
   * unlocks after the first wrong guess, remaining excerpts unlock in the
   * final step and on the result card.
   */
  scoutingExcerpts: string[];
  /** Optional extra clue cards specific to this prospect */
  clues?: CustomClue[];
  accolades?: string[];
  hometown?: string;
  /**
   * Transparent-background headshot (PNG). Shown as a solid black silhouette
   * while the game is live and in full color once it ends. The transparency
   * is what makes the silhouette work, so prefer cut-out PNGs.
   */
  headshotUrl?: string;
  /** Source credit for the scouting excerpts (defaults to The NFL Draft Bible) */
  excerptSource?: string;
}
