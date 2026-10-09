import { describe, expect, it } from 'vitest';
import { PROSPECTS } from '../src/data/prospects';
import type { Prospect } from '../src/data/types';
import {
  FINAL_STEP,
  buildClues,
  formatBroadJump,
  formatDraftSlot,
  formatHeight,
  getIntelClues,
  getLockedClues,
  getUnlockedClues,
} from '../src/game/clues';
import { getCardRows } from '../src/game/columns';
import { FIXTURES, fixture } from './fixtures';

const real = (id: string): Prospect => {
  const p = PROSPECTS.find((x) => x.id === id);
  if (!p) throw new Error(`missing prospect ${id}`);
  return p;
};

describe('formatting', () => {
  it('formats heights and jumps', () => {
    expect(formatHeight('6-3')).toBe(`6'3"`);
    expect(formatHeight('5-11')).toBe(`5'11"`);
    expect(formatBroadJump(131)).toBe(`10'11"`);
    expect(formatBroadJump(120)).toBe(`10'0"`);
  });

  it('formats draft slots including undrafted', () => {
    expect(formatDraftSlot(fixture('marcus-vale'))).toBe('Round 1, Pick 6');
    expect(formatDraftSlot(fixture('zeke-thornbury'))).toBe('Undrafted');
    expect(formatDraftSlot(real('isaiah-likely'))).toBe('Round 4, Pick 139');
  });
});

describe('clue ladder', () => {
  it('starts with one excerpt only; position joins at the first miss', () => {
    const start = getUnlockedClues(fixture('marcus-vale'), 0);
    expect(start.map((c) => c.kind)).toEqual(['excerpt']);
    const afterOne = getUnlockedClues(fixture('marcus-vale'), 1);
    expect(afterOne.map((c) => c.kind).sort()).toEqual(['excerpt', 'excerpt', 'position']);
  });

  it('follows the default schedule for a fully-populated prospect', () => {
    const steps = Object.fromEntries(buildClues(real('ladd-mcconkey')).map((c) => [c.id, c.unlockAt]));
    expect(steps).toMatchObject({
      position: 1,
      'excerpt-0': 0,
      'excerpt-1': 1,
      measurables: 2,
      testing: 3,
      conference: 4,
      draftYear: 4,
      college: FINAL_STEP,
      draftSlot: FINAL_STEP,
      'excerpt-2': FINAL_STEP,
    });
  });

  it('unlocks progressively and never loses clues', () => {
    const p = fixture('dontrell-hask');
    let prev = 0;
    for (let step = 0; step <= FINAL_STEP; step++) {
      const count = getUnlockedClues(p, step).length;
      expect(count).toBeGreaterThanOrEqual(prev);
      prev = count;
    }
    expect(getLockedClues(p, FINAL_STEP)).toHaveLength(0);
  });

  it('reveals everything except the name by the final step', () => {
    for (const p of PROSPECTS) {
      const kinds = new Set(getUnlockedClues(p, FINAL_STEP).map((c) => c.kind));
      for (const k of ['position', 'excerpt', 'measurables', 'conference', 'draftYear', 'college', 'draftSlot']) {
        expect(kinds.has(k as never), `${p.name} missing ${k}`).toBe(true);
      }
      const text = getUnlockedClues(p, FINAL_STEP)
        .map((c) => `${c.value} ${(c.details ?? []).join(' ')}`)
        .join(' ');
      expect(text, `${p.name} leaks name`).not.toContain(p.name);
    }
  });

  it('uses a prospect-specific clue when a player did not test', () => {
    for (const id of ['rafael-quintero']) {
      const p = fixture(id);
      expect(buildClues(p).some((c) => c.kind === 'testing'), id).toBe(false);
      const step3 = buildClues(p).filter((c) => c.unlockAt === 3);
      expect(step3.some((c) => c.kind === 'custom'), id).toBe(true);
    }
  });

  it('promotes a clue for a kicker with no testing', () => {
    const p = fixture('rafael-quintero');
    expect(buildClues(p).some((c) => c.unlockAt === 3 && c.label === 'Career Long')).toBe(true);
  });

  it('every prospect reveals something at every step', () => {
    for (const p of [...PROSPECTS, ...FIXTURES]) {
      const clues = buildClues(p);
      for (let step = 0; step <= FINAL_STEP; step++) {
        expect(
          clues.some((c) => c.unlockAt === step),
          `${p.name} reveals nothing at step ${step}`,
        ).toBe(true);
      }
    }
  });

  it('respects explicit unlockAt on custom clues', () => {
    const bg = buildClues(fixture('nico-valdes')).find((c) => c.label === 'Background');
    expect(bg?.unlockAt).toBe(3);
  });

  it('intel grid excludes excerpts and position', () => {
    const intel = getIntelClues(fixture('marcus-vale'));
    expect(intel.every((c) => c.kind !== 'excerpt' && c.kind !== 'position')).toBe(true);
  });

  it('fills an empty excerpt step when a prospect has only one excerpt', () => {
    const p: Prospect = {
      ...fixture('marcus-vale'),
      id: 'one-excerpt',
      scoutingExcerpts: ['Only excerpt.'],
      clues: [{ label: 'Extra', value: 'Something' }],
    };
    expect(buildClues(p).some((c) => c.unlockAt === 1)).toBe(true);
  });
});

describe('prospect card rows', () => {
  const row = (p: Prospect, id: string) => getCardRows(p).find((r) => r.id === id);

  it('combines height and weight into one measurables row', () => {
    expect(row(real('ladd-mcconkey'), 'measurables')?.value).toBe(`6'0", 186 lbs`);
    expect(getCardRows(real('ladd-mcconkey')).some((r) => r.id === 'height' || r.id === 'weight')).toBe(false);
  });

  it('splits workout numbers into separate rows, or says "Did not test"', () => {
    expect(row(real('ladd-mcconkey'), 'forty')?.value).toBe('4.39s');
    expect(row(real('ladd-mcconkey'), 'vertical')).toBeDefined();
    expect(row(fixture('rafael-quintero'), 'combine')?.value).toBe('Did not test');
    expect(row(fixture('rafael-quintero'), 'forty')).toBeUndefined();
  });

  it('unlocks rows on the documented steps and groups them in report order', () => {
    const rows = getCardRows(real('jordan-howard'));
    const steps = Object.fromEntries(rows.map((r) => [r.id, r.step]));
    expect(steps).toMatchObject({ measurables: 2, forty: 3, conference: 4, draftYear: 4, college: 5, draftSlot: 5 });
    const groups = rows.map((r) => r.group);
    const order = ['measurables', 'workout', 'background', 'draft'];
    expect([...groups].sort((a, b) => order.indexOf(a) - order.indexOf(b))).toEqual(groups);
  });

  it('puts hometown and honors on the card and never leaks the name', () => {
    for (const p of PROSPECTS) {
      const rows = getCardRows(p);
      if (p.hometown) expect(row(p, 'hometown')?.value).toBe(p.hometown);
      if (p.accolades?.length) expect(row(p, 'accolades')?.group).toBe('draft');
      expect(rows.map((r) => r.value).join(' '), p.name).not.toContain(p.name);
      expect(rows.every((r) => r.step >= 2 && r.step <= FINAL_STEP), p.name).toBe(true);
    }
  });
});

describe('prospect data sanity', () => {
  it('has the five real prospects with unique ids and names', () => {
    expect(PROSPECTS).toHaveLength(5);
    expect(new Set(PROSPECTS.map((p) => p.id)).size).toBe(PROSPECTS.length);
    expect(new Set(PROSPECTS.map((p) => p.name)).size).toBe(PROSPECTS.length);
  });

  it('every prospect has an https headshot', () => {
    for (const p of PROSPECTS) {
      expect(p.headshotUrl, p.name).toMatch(/^https:\/\/.+\.png$/);
    }
  });

  it('every prospect has at least two excerpts and none leaks the name or college', () => {
    for (const p of PROSPECTS) {
      expect(p.scoutingExcerpts.length, p.name).toBeGreaterThanOrEqual(2);
      const nameParts = p.name.toLowerCase().split(/\s+/);
      for (const ex of p.scoutingExcerpts) {
        const lower = ex.toLowerCase();
        for (const part of nameParts) expect(lower, `${p.name} excerpt leaks "${part}"`).not.toContain(part);
        expect(lower, `${p.name} excerpt leaks college`).not.toContain(p.college.toLowerCase());
      }
    }
  });
});
