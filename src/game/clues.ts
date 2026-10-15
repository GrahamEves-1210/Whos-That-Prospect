import { POSITION_NAMES, excerptText, type Prospect } from '../data/types';
import { MAX_GUESSES } from './config';
import type { Clue } from './types';

/** The final clue step (everything is revealed after this many misses). */
export const FINAL_STEP = MAX_GUESSES - 1; // 4

// ---------- formatting helpers ----------

export function formatHeight(height: string): string {
  const [ft, inches] = height.split(/[-'’ ]/).map((s) => s.trim());
  if (!ft) return height;
  return `${ft}'${inches ?? '0'}"`;
}

export function formatWeight(weight: number): string {
  return `${weight} lbs`;
}

export function formatForty(seconds: number): string {
  return `${seconds.toFixed(2)}s`;
}

export function formatVertical(inches: number): string {
  return `${inches}"`;
}

export function formatBroadJump(inches: number): string {
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
}

export function formatDraftSlot(prospect: Prospect): string {
  if (prospect.draftRound == null || prospect.draftPick == null) return 'Undrafted';
  return `Round ${prospect.draftRound}, Pick ${prospect.draftPick}`;
}

export function formatDraftSlotShort(prospect: Prospect): string {
  if (prospect.draftRound == null || prospect.draftPick == null) return 'UDFA';
  return `Rd ${prospect.draftRound} · Pk ${prospect.draftPick}`;
}

export function getTestingLines(prospect: Prospect): string[] {
  const lines: string[] = [];
  if (prospect.fortyTime != null) lines.push(`40-yard dash: ${formatForty(prospect.fortyTime)}`);
  if (prospect.vertical != null) lines.push(`Vertical: ${formatVertical(prospect.vertical)}`);
  if (prospect.broadJump != null) lines.push(`Broad jump: ${formatBroadJump(prospect.broadJump)}`);
  for (const [label, value] of Object.entries(prospect.otherTesting ?? {})) {
    lines.push(`${label}: ${value}`);
  }
  return lines;
}

export function hasTestingData(prospect: Prospect): boolean {
  return getTestingLines(prospect).length > 0;
}

// ---------- clue ladder ----------

/**
 * Build the full clue ladder for a prospect.
 *
 * Default schedule (unlockAt = number of wrong guesses; 5 guesses, so steps 0-4):
 *   0  Scouting excerpt #1
 *   1  Position + measurables: height, weight, length and combine testing
 *   2  Scouting excerpt #2
 *   3  Background: conference, draft class, hometown, college honors
 *   4  Draft: college, draft round/pick, drafted by, remaining excerpts and extras
 *
 * Prospect-specific `clues` with an explicit `unlockAt` slot in where asked;
 * the rest land in the final step. If any middle step would otherwise reveal
 * nothing (e.g. a kicker with no testing), the earliest "extra" clue is
 * promoted into it so every miss always unlocks something.
 */
/** Wrong guesses needed before the position is shown (it unlocks with the measurables). */
export const POSITION_STEP = 1;
/** Measurables and combine testing unlock together, with the position. */
export const MEASURABLES_STEP = 1;
/** The second scouting excerpt. */
export const QUOTE2_STEP = 2;
/** Conference, draft class, hometown and college honors. */
export const BACKGROUND_STEP = 3;

export function buildClues(prospect: Prospect): Clue[] {
  const clues: Clue[] = [];

  clues.push({
    id: 'position',
    kind: 'position',
    label: 'Position',
    value: prospect.position,
    details: [POSITION_NAMES[prospect.position]],
    unlockAt: POSITION_STEP,
  });

  prospect.scoutingExcerpts.forEach((excerpt, i) => {
    clues.push({
      id: `excerpt-${i}`,
      kind: 'excerpt',
      label: `Scouting Report ${i + 1}`,
      value: excerptText(excerpt),
      credit: typeof excerpt === 'string' ? undefined : excerpt.credit,
      unlockAt: i === 0 ? 0 : i === 1 ? QUOTE2_STEP : FINAL_STEP,
    });
  });

  clues.push({
    id: 'measurables',
    kind: 'measurables',
    label: 'Measurables',
    value: `${formatHeight(prospect.height)} · ${formatWeight(prospect.weight)}`,
    details: [`Height ${formatHeight(prospect.height)}`, `Weight ${formatWeight(prospect.weight)}`],
    unlockAt: MEASURABLES_STEP,
  });

  if (hasTestingData(prospect)) {
    const lines = getTestingLines(prospect);
    const headline =
      prospect.fortyTime != null
        ? `${formatForty(prospect.fortyTime)} forty`
        : lines[0];
    clues.push({
      id: 'testing',
      kind: 'testing',
      label: 'Testing',
      value: headline,
      details: lines,
      unlockAt: MEASURABLES_STEP,
    });
  }

  clues.push({
    id: 'conference',
    kind: 'conference',
    label: 'Conference',
    value: prospect.conference,
    unlockAt: BACKGROUND_STEP,
  });

  clues.push({
    id: 'draftYear',
    kind: 'draftYear',
    label: 'Draft Year',
    value: String(prospect.draftYear),
    unlockAt: BACKGROUND_STEP,
  });

  clues.push({
    id: 'college',
    kind: 'college',
    label: 'College',
    value: prospect.college,
    unlockAt: FINAL_STEP,
  });

  clues.push({
    id: 'draftSlot',
    kind: 'draftSlot',
    label: 'Draft Slot',
    value: formatDraftSlotShort(prospect),
    details:
      prospect.draftRound != null && prospect.draftPick != null
        ? [`${formatDraftSlot(prospect)}, ${prospect.draftYear} NFL Draft`]
        : [`Undrafted free agent, ${prospect.draftYear}`],
    unlockAt: FINAL_STEP,
  });

  // "Extra" clues: prospect-specific first, then accolades, then hometown.
  // Extras without an explicit unlockAt are "floating" and may be promoted
  // into an otherwise-empty step.
  const floating: Clue[] = [];
  (prospect.clues ?? []).forEach((c, i) => {
    const clue: Clue = {
      id: `custom-${i}`,
      kind: 'custom',
      label: c.label,
      value: c.value,
      unlockAt: c.unlockAt != null ? clampStep(c.unlockAt) : FINAL_STEP,
    };
    clues.push(clue);
    if (c.unlockAt == null) floating.push(clue);
  });
  if (prospect.accolades && prospect.accolades.length > 0) {
    const clue: Clue = {
      id: 'accolades',
      kind: 'accolades',
      label: 'Accolades',
      value: prospect.accolades[0],
      details: prospect.accolades.length > 1 ? prospect.accolades.slice(1) : undefined,
      unlockAt: BACKGROUND_STEP,
    };
    clues.push(clue);
  }
  if (prospect.hometown) {
    const clue: Clue = {
      id: 'hometown',
      kind: 'hometown',
      label: 'Hometown',
      value: prospect.hometown,
      unlockAt: BACKGROUND_STEP,
    };
    clues.push(clue);
  }

  // Guarantee every step 1..FINAL_STEP-1 reveals something.
  for (let step = 1; step < FINAL_STEP; step++) {
    if (clues.some((c) => c.unlockAt === step)) continue;
    const candidate = floating.find((c) => c.unlockAt === FINAL_STEP);
    if (candidate) candidate.unlockAt = step;
  }

  // Stable sort by unlock step, preserving insertion order within a step.
  return clues
    .map((c, i) => ({ c, i }))
    .sort((a, b) => a.c.unlockAt - b.c.unlockAt || a.i - b.i)
    .map(({ c }) => c);
}

function clampStep(step: number): number {
  return Math.max(0, Math.min(FINAL_STEP, Math.round(step)));
}

/** Clues visible after `wrongGuesses` misses (or everything when `revealAll`). */
export function getUnlockedClues(prospect: Prospect, wrongGuesses: number, revealAll = false): Clue[] {
  const all = buildClues(prospect);
  if (revealAll) return all;
  return all.filter((c) => c.unlockAt <= wrongGuesses);
}

/** Clues still hidden after `wrongGuesses` misses. */
export function getLockedClues(prospect: Prospect, wrongGuesses: number): Clue[] {
  return buildClues(prospect).filter((c) => c.unlockAt > wrongGuesses);
}

/** Non-excerpt, non-position clues — the "intel" grid. */
export function getIntelClues(prospect: Prospect): Clue[] {
  return buildClues(prospect).filter((c) => c.kind !== 'excerpt' && c.kind !== 'position');
}

/** Scouting excerpt clues only, in unlock order. */
export function getExcerptClues(prospect: Prospect): Clue[] {
  return buildClues(prospect).filter((c) => c.kind === 'excerpt');
}

/** Which clue(s) unlock at a given step — for "NEW CLUE" callouts. */
export function getCluesForStep(prospect: Prospect, step: number): Clue[] {
  return buildClues(prospect).filter((c) => c.unlockAt === step);
}
