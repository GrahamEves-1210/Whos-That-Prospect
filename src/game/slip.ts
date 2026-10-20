import type { Prospect } from '../data/types';

const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v']);

export interface PickSlip {
  year: number;
  /** "3", or "Undrafted" */
  round: string;
  /** "91", or "" when undrafted */
  overall: string;
  last: string;
  first: string;
  position: string;
  school: string;
  /** "San Francisco" / "49ers"; empty when there's no "Drafted by" / "Signed by" clue */
  city: string;
  nickname: string;
}

/** "NaVorro Bowman" -> { last: 'Bowman', first: 'NaVorro' }; keeps suffixes with the last name. */
export function splitName(name: string): { last: string; first: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return { last: parts[0] ?? '', first: '' };
  const lastCount = parts.length > 2 && SUFFIXES.has(parts[parts.length - 1].toLowerCase()) ? 2 : 1;
  return { last: parts.slice(-lastCount).join(' '), first: parts.slice(0, -lastCount).join(' ') };
}

/** "San Francisco 49ers" -> city "San Francisco", nickname "49ers" (every NFL nickname is one word). */
export function splitTeam(team: string): { city: string; nickname: string } {
  const parts = team.trim().split(/\s+/);
  if (parts.length < 2) return { city: '', nickname: parts[0] ?? '' };
  return { city: parts.slice(0, -1).join(' '), nickname: parts[parts.length - 1] };
}

/** The draft-day card a team hands in, filled out for this prospect. */
export function pickSlip(prospect: Prospect): PickSlip {
  // "Drafted by" for picks, "Signed by" for undrafted free agents
  const team = prospect.clues?.find((c) => ['drafted by', 'signed by'].includes(c.label.toLowerCase()))?.value ?? '';
  return {
    year: prospect.draftYear,
    round: prospect.draftRound != null ? String(prospect.draftRound) : 'Undrafted',
    overall: prospect.draftPick != null ? String(prospect.draftPick) : '',
    ...splitName(prospect.name),
    position: prospect.position,
    school: prospect.college,
    ...splitTeam(team),
  };
}
