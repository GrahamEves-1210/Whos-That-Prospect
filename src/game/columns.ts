import type { Prospect } from '../data/types';
import { BACKGROUND_STEP, FINAL_STEP, MEASURABLES_STEP, buildClues, formatBroadJump, formatDraftSlot, formatForty, formatHeight, formatVertical } from './clues';

/**
 * Rows of the prospect card, grouped the way the back of a pre-draft
 * scouting report reads. Each group unlocks at one step of the clue ladder:
 *   Measurables (miss 2): height/weight, length and combine testing
 *   Background (miss 3): conference, draft class, hometown, college honors
 *   Draft (miss 4):      college, draft pick, drafted by
 */
export type CardGroup = 'measurables' | 'background' | 'draft';

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
  background: 'Background',
  draft: 'Draft',
};

const GROUP_ORDER: CardGroup[] = ['measurables', 'background', 'draft'];

const isLengthKey = (k: string) => /hand|arm|wing/i.test(k);

/** Which card group a step belongs to. */
function groupForStep(step: number): CardGroup {
  if (step < BACKGROUND_STEP) return 'measurables';
  if (step === BACKGROUND_STEP) return 'background';
  return 'draft';
}

export function getCardRows(prospect: Prospect): CardRow[] {
  const clues = buildClues(prospect);
  const stepOf = (id: string, fallback: number) => clues.find((c) => c.id === id)?.unlockAt ?? fallback;
  const rows: CardRow[] = [];

  // Measurables: size, length and workout numbers together
  const mStep = stepOf('measurables', MEASURABLES_STEP);
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
  const tStep = stepOf('testing', MEASURABLES_STEP);
  const workout: Array<[string, string, string, string]> = [];
  if (prospect.fortyTime != null) workout.push(['forty', '40-yard dash', formatForty(prospect.fortyTime), '30%']);
  if (prospect.vertical != null) workout.push(['vertical', 'Vertical', formatVertical(prospect.vertical), '26%']);
  if (prospect.broadJump != null) workout.push(['broad', 'Broad jump', formatBroadJump(prospect.broadJump), '30%']);
  for (const [k, v] of other.filter(([k]) => !isLengthKey(k))) workout.push([k.toLowerCase(), k, String(v), '34%']);
  if (workout.length === 0) workout.push(['combine', 'Combine', 'Did not test', '48%']);
  for (const [id, label, value, w] of workout) rows.push({ id, group: 'measurables', label, value, step: tStep, redactWidth: w });

  // Background & college honors
  rows.push({ id: 'conference', group: 'background', label: 'Conference', value: prospect.conference, step: stepOf('conference', BACKGROUND_STEP), redactWidth: '40%' });
  rows.push({ id: 'draftYear', group: 'background', label: 'Draft class', value: String(prospect.draftYear), step: stepOf('draftYear', BACKGROUND_STEP), redactWidth: '28%' });
  if (prospect.hometown) {
    rows.push({ id: 'hometown', group: 'background', label: 'Hometown', value: prospect.hometown, step: stepOf('hometown', BACKGROUND_STEP), redactWidth: '46%' });
  }
  if (prospect.accolades?.length) {
    rows.push({ id: 'accolades', group: 'background', label: 'College honors', value: prospect.accolades.join(' · '), step: stepOf('accolades', BACKGROUND_STEP), redactWidth: '70%' });
  }

  // Draft
  rows.push({ id: 'college', group: 'draft', label: 'College', value: prospect.college, step: stepOf('college', FINAL_STEP), redactWidth: '50%' });
  rows.push({ id: 'draftSlot', group: 'draft', label: 'Drafted', value: formatDraftSlot(prospect), step: stepOf('draftSlot', FINAL_STEP), redactWidth: '58%' });

  // Prospect-specific clues (e.g. "Drafted by") land in the group that matches their step.
  (prospect.clues ?? []).forEach((c, i) => {
    const step = stepOf(`custom-${i}`, FINAL_STEP);
    rows.push({ id: `custom-${i}`, group: groupForStep(step), label: c.label, value: c.value, step, redactWidth: '60%' });
  });

  return GROUP_ORDER.flatMap((g) => rows.filter((r) => r.group === g));
}
