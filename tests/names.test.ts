import { describe, expect, it } from 'vitest';
import { PROSPECTS } from '../src/data/prospects';
import { checkGuess } from '../src/game/guess';
import { buildNameIndex, searchNames, type NameRow } from '../src/game/names';
import realList from '../public/draft-names.json';

const DRAFTED: Array<[string, number]> = [
  ['Navorro Bowman', 2010],
  ['Zackary Bowman', 2008],
  ['Mike Williams', 2010],
  ['Mike Williams', 2017],
  ['Bowman Lee', 2015],
  ['Tom Brady', 2000],
];

describe('guess suggestions', () => {
  const index = buildNameIndex(DRAFTED, PROSPECTS);

  it('waits for three letters', () => {
    expect(searchNames(index, 'bo')).toEqual([]);
    expect(searchNames(index, 'bow').length).toBeGreaterThan(0);
  });

  it('matches first or last names, full-name prefix first', () => {
    const names = searchNames(index, 'bowman').map((e) => e.name);
    expect(names[0]).toBe('Bowman Lee');
    expect(names).toContain('Zackary Bowman');
  });

  it('uses the game spelling for its own prospects, without a duplicate', () => {
    const bowmans = searchNames(index, 'navorro').map((e) => e.name);
    expect(bowmans).toEqual(['NaVorro Bowman']);
  });

  it('keeps same-name players from different drafts apart', () => {
    expect(searchNames(index, 'mike williams').map((e) => e.year).sort()).toEqual([2010, 2017]);
  });

  it('matches two-word queries in any order', () => {
    expect(searchNames(index, 'brady tom').map((e) => e.name)).toEqual(['Tom Brady']);
  });

  it('includes every scheduled prospect even if not in the draft list', () => {
    const empty = buildNameIndex([], PROSPECTS);
    for (const p of PROSPECTS) expect(searchNames(empty, p.name).map((e) => e.name), p.name).toContain(p.name);
  });
});

describe('the answer is always in the suggestions', () => {
  // The real list players download, plus the game's prospects, exactly as the guess box builds it
  const index = buildNameIndex(realList as unknown as NameRow[], PROSPECTS);

  it('every scheduled prospect is findable by full name and by last name, under the exact answer name', () => {
    for (const p of PROSPECTS) {
      const full = searchNames(index, p.name);
      expect(full.map((e) => e.name), p.name).toContain(p.name);
      expect(checkGuess(full.find((e) => e.name === p.name)!.name, p), p.name).toBe(true);
      const last = p.name.split(' ').pop()!;
      if (last.length >= 3) {
        const byLast = searchNames(index, `${p.name.split(' ')[0].slice(0, 3)} ${last}`);
        expect(byLast.map((e) => e.name), `${p.name} by last name`).toContain(p.name);
      }
    }
  });

  it('even when the list fails to load', () => {
    const fallback = buildNameIndex([], PROSPECTS);
    for (const p of PROSPECTS) expect(searchNames(fallback, p.name).map((e) => e.name)).toContain(p.name);
  });

  it('labels undrafted players', () => {
    expect(searchNames(index, 'tony romo')[0]).toMatchObject({ name: 'Tony Romo', year: 2003, udfa: true });
  });
});
