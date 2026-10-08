import type { Prospect } from '../data/types';
import { buildClues, formatBroadJump, formatDraftSlot, formatForty, formatHeight, formatVertical } from './clues';
import { FINAL_STEP } from './clues';

/**
 * Rows of the prospect card, grouped the way the back of a pre-draft
 * scouting report reads: measurables, workout numbers, background, draft.
 * Each row unlocks at a step of the clue ladder (number of wrong guesses).
 */
export type CardGroup = 'measurables' | 'workout' | 'background' | 'draft';

export interface CardRow {
  id: string;
  group: CardGroup;
  label: string;
  value: string;
  step: number;
  /** Width of the black bar while locked */
  redactWidth: string;
}

export const CARD_GROUP_LABELS: Record<CardGroup, string> = {
  measurables: 'Measurables',
  workout: 'Workout & production',
  background: 'Background',
  draft: 'Draft & honors',
};

const GROUP_ORDER: CardGroup[] = ['measurables', 'workout', 'background', 'draft'];

const isLengthKey = (k: string) => /hand|arm|wing/i.test(k);

export function getCardRows(prospect: Prospect): CardRow[] {
  const clues = buildClues(prospect);
  const stepOf = (id: string, fallback: number) => clues.find((c) => c.id === id)?.unlockAt ?? fallback;
  const rows: CardRow[] = [];

  // Measurables (step 2)
  const mStep = stepOf('measurables', 2);
  rows.push({
    id: 'measurables',
    group: 'measurables',
    label: 'Ht / Wt',
    value: `${formatHeight(prospect.height)}, ${prospect.weight} lbs`,
    step: mStep,
    redactWidth: '44%',
  });
  const other = Object.entries(prospect.otherTesting ?? {});
  const lengths = other.filter(([k]) => isLengthKey(k));
  if (lengths.length) {
    rows.push({
      id: 'length',
      group: 'measurables',
      label: 'Length',
      value: lengths.map(([k, v]) => `${k.replace(/ size| length/i, '')} ${v}`).join(', '),
      step: mStep,
      redactWidth: '52%',
    });
  }

  // Workout (step 3)
  const tStep = stepOf('testing', 3);
  const workout: Array<[string, string, string, string]> = [];
  if (prospect.fortyTime != null) workout.push(['forty', '40-yard dash', formatForty(prospect.fortyTime), '30%']);
  if (prospect.vertical != null) workout.push(['vertical', 'Vertical', formatVertical(prospect.vertical), '26%']);
  if (prospect.broadJump != null) workout.push(['broad', 'Broad jump', formatBroadJump(prospect.broadJump), '30%']);
  for (const [k, v] of other.filter(([k]) => !isLengthKey(k))) workout.push([k.toLowerCase(), k, String(v), '34%']);
  if (workout.length === 0) workout.push(['combine', 'Combine', 'Did not test', '48%']);
  for (const [id, label, value, w] of workout) rows.push({ id, group: 'workout', label, value, step: tStep, redactWidth: w });

  // Background (step 4)
  rows.push({ id: 'conference', group: 'background', label: 'Conference', value: prospect.conference, step: stepOf('conference', 4), redactWidth: '40%' });
  rows.push({ id: 'draftYear', group: 'background', label: 'Draft class', value: String(prospect.draftYear), step: stepOf('draftYear', 4), redactWidth: '28%' });
  if (prospect.hometown) {
    rows.push({ id: 'hometown', group: 'background', label: 'Hometown', value: prospect.hometown, step: stepOf('hometown', FINAL_STEP), redactWidth: '46%' });
  }

  // Draft & honors (step 5)
  rows.push({ id: 'college', group: 'draft', label: 'College', value: prospect.college, step: stepOf('college', FINAL_STEP), redactWidth: '50%' });
  rows.push({ id: 'draftSlot', group: 'draft', label: 'Drafted', value: formatDraftSlot(prospect), step: stepOf('draftSlot', FINAL_STEP), redactWidth: '58%' });
  if (prospect.accolades?.length) {
    rows.push({ id: 'accolades', group: 'draft', label: 'Honors', value: prospect.accolades.join(' · '), step: stepOf('accolades', FINAL_STEP), redactWidth: '70%' });
  }

  // Prospect-specific clues land in the group that matches their step.
  (prospect.clues ?? []).forEach((c, i) => {
    const step = stepOf(`custom-${i}`, FINAL_STEP);
    const group: CardGroup = step <= 2 ? 'measurables' : step === 3 ? 'workout' : step === 4 ? 'background' : 'draft';
    rows.push({ id: `custom-${i}`, group, label: c.label, value: c.value, step, redactWidth: '60%' });
  });

  return GROUP_ORDER.flatMap((g) => rows.filter((r) => r.group === g));
}
