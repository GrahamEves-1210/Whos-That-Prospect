import { describe, expect, it } from 'vitest';
import { PROSPECTS } from '../src/data/prospects';
import { excerptAllText, excerptText, type Prospect } from '../src/data/types';
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
import { splitQuoteOnName } from '../src/game/redact';
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
    expect(formatDraftSlot(real('navorro-bowman'))).toBe('Round 3, Pick 91');
  });
});

describe('clue ladder', () => {
  it('starts with one excerpt only; position and measurables join at the first miss, quote 2 at the second', () => {
    const start = getUnlockedClues(fixture('marcus-vale'), 0);
    expect(start.map((c) => c.kind)).toEqual(['excerpt']);
    const afterOne = getUnlockedClues(fixture('marcus-vale'), 1).map((c) => c.kind);
    expect(afterOne).toContain('position');
    expect(afterOne).toContain('measurables');
    expect(afterOne.filter((k) => k === 'excerpt')).toHaveLength(1);
    const afterTwo = getUnlockedClues(fixture('marcus-vale'), 2).map((c) => c.kind);
    expect(afterTwo.filter((k) => k === 'excerpt')).toHaveLength(2);
  });

  it('follows the default schedule for a fully-populated prospect', () => {
    const steps = Object.fromEntries(buildClues(real('navorro-bowman')).map((c) => [c.id, c.unlockAt]));
    expect(steps).toMatchObject({
      position: 1,
      'excerpt-0': 0,
      'excerpt-1': 2,
      measurables: 1,
      testing: 1,
      conference: 3,
      draftYear: 3,
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
      // Quotes are checked separately (they may name the player; the UI blacks it out)
      const text = getUnlockedClues(p, FINAL_STEP)
        .filter((c) => c.kind !== 'excerpt')
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
    expect(row(real('navorro-bowman'), 'measurables')?.value).toBe(`6'1", 242 lbs`);
    expect(getCardRows(real('navorro-bowman')).some((r) => r.id === 'height' || r.id === 'weight')).toBe(false);
  });

  it('splits workout numbers into separate rows, or says "Did not test"', () => {
    expect(row(real('navorro-bowman'), 'forty')?.value).toBe('4.70s');
    expect(row(real('navorro-bowman'), 'vertical')).toBeDefined();
    expect(row(fixture('rafael-quintero'), 'combine')?.value).toBe('Did not test');
    expect(row(fixture('rafael-quintero'), 'forty')).toBeUndefined();
  });

  it('unlocks rows on the documented steps and groups them in report order', () => {
    const rows = getCardRows(real('navorro-bowman'));
    const steps = Object.fromEntries(rows.map((r) => [r.id, r.step]));
    expect(steps).toMatchObject({ measurables: 1, forty: 1, conference: 3, draftYear: 3, hometown: 3, college: 4, draftSlot: 4 });
    const groups = rows.map((r) => r.group);
    const order = ['measurables', 'background', 'draft'];
    expect([...groups].sort((a, b) => order.indexOf(a) - order.indexOf(b))).toEqual(groups);
  });

  it('puts hometown and honors on the card and never leaks the name', () => {
    for (const p of PROSPECTS) {
      const rows = getCardRows(p);
      if (p.hometown) expect(row(p, 'hometown')?.value).toBe(p.hometown);
      if (p.accolades?.length) expect(row(p, 'accolades')?.group).toBe('background');
      expect(rows.map((r) => r.value).join(' '), p.name).not.toContain(p.name);
      expect(rows.every((r) => r.step >= 1 && r.step <= FINAL_STEP), p.name).toBe(true);
    }
  });
});

describe('prospect data sanity', () => {
  it('has unique ids and names', () => {
    expect(PROSPECTS.length).toBeGreaterThan(0);
    expect(new Set(PROSPECTS.map((p) => p.id)).size).toBe(PROSPECTS.length);
    expect(new Set(PROSPECTS.map((p) => p.name)).size).toBe(PROSPECTS.length);
  });

  it('every prospect has an https headshot', () => {
    for (const p of PROSPECTS) {
      expect(p.headshotUrl, p.name).toMatch(/^https:\/\/.+\.png$/);
    }
  });

  it('every prospect has at least two excerpts; what players see never shows the name or college', () => {
    for (const p of PROSPECTS) {
      expect(p.scoutingExcerpts.length, p.name).toBeGreaterThanOrEqual(2);
      const nameParts = p.name.toLowerCase().split(/\s+/);
      for (const [i, ex] of p.scoutingExcerpts.entries()) {
        // The quote as shown while playing: name mentions are blacked out
        const lower = splitQuoteOnName(excerptAllText(ex), p)
          .filter((s) => !s.isName)
          .map((s) => s.text)
          .join('')
          .toLowerCase();
        // Whole words, like the blackout itself ("rocked-up" isn't the name Rock)
        for (const part of nameParts) {
          const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          expect(lower, `${p.name} excerpt leaks "${part}"`).not.toMatch(new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`, 'u'));
        }
        // The quote itself never names the school before the college is shown (a speaker's credit may, and
        // so may the last quote, which unlocks together with the college)
        if (i >= 2) continue;
        const quoteOnly = splitQuoteOnName(excerptText(ex), p).filter((s) => !s.isName).map((s) => s.text).join('').toLowerCase();
        expect(quoteOnly, `${p.name} excerpt leaks college`).not.toContain(p.college.toLowerCase());
      }
    }
  });
});

describe('silhouettes', () => {
  it('every prospect has pre-rendered silhouettes (run `npm run silhouettes` after adding prospects)', async () => {
    const { SILHOUETTES } = await import('../src/data/silhouettes');
    const files = Object.keys(import.meta.glob('/public/silhouettes/*.png')).map((f) => f.split('/').pop());
    for (const p of PROSPECTS) {
      const hash = SILHOUETTES[p.id];
      expect(hash, `${p.name} has no silhouette`).toBeTruthy();
      expect(files, `${p.name} sharp silhouette`).toContain(`${hash}.png`);
      expect(files, `${p.name} blurred silhouette`).toContain(`${hash}-blur.png`);
      expect(hash, 'filename must not contain the name').not.toContain(p.id);
    }
  });
});

describe('quote name redaction', () => {
  const p = { name: 'NaVorro Bowman', aliases: ['Navorro Bowman'] };
  const hidden = (t: string) =>
    splitQuoteOnName(t, p)
      .filter((s) => s.isName)
      .map((s) => s.text);

  it('blacks out the full name, the last name and the first name, any capitalization', () => {
    expect(hidden('NaVorro Bowman hits hard. bowman again. Navorro too.')).toEqual(['NaVorro Bowman', 'bowman', 'Navorro']);
  });

  it('catches the name inside nicknames and possessives but not inside other words', () => {
    expect(hidden('“Big Play” Bowman and Bowman’s motor')).toEqual(['Bowman', 'Bowman']);
    expect(hidden('A bowmanship test')).toEqual([]);
  });

  it('keeps all the other text', () => {
    const t = 'There’s every reason to think that Bowman will develop.';
    expect(splitQuoteOnName(t, p).map((s) => s.text).join('')).toBe(t);
  });
});
