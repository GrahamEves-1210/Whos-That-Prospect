import { describe, expect, it } from 'vitest';
import { PROSPECTS } from '../src/data/prospects';
import { checkGuess, editDistance, isDuplicateGuess, normalizeGuess } from '../src/game/guess';
import { FIXTURES, fixture } from './fixtures';

describe('normalizeGuess', () => {
  it('lower-cases and trims', () => {
    expect(normalizeGuess('  Marcus   VALE ')).toBe('marcus vale');
  });

  it('strips apostrophes and periods, keeps word boundaries', () => {
    expect(normalizeGuess("D'Marco St. Pierre")).toBe('dmarco st pierre');
    expect(normalizeGuess('J.J. Steele')).toBe('jj steele');
    expect(normalizeGuess('D’Marco St Pierre')).toBe('dmarco st pierre');
  });

  it('treats hyphens as spaces', () => {
    expect(normalizeGuess('Reggie Okafor-Lane')).toBe('reggie okafor lane');
  });

  it('strips accents', () => {
    expect(normalizeGuess('Nico Valdés')).toBe('nico valdes');
  });

  it('drops generational suffixes', () => {
    expect(normalizeGuess('Caleb Nkemelu Jr.')).toBe('caleb nkemelu');
    expect(normalizeGuess('Caleb Nkemelu III')).toBe('caleb nkemelu');
  });
});

describe('editDistance', () => {
  it('counts substitutions, insertions, deletions and transpositions', () => {
    expect(editDistance('abc', 'abc')).toBe(0);
    expect(editDistance('abc', 'abd')).toBe(1);
    expect(editDistance('abc', 'ab')).toBe(1);
    expect(editDistance('abc', 'abcd')).toBe(1);
    expect(editDistance('abcd', 'abdc')).toBe(1);
    expect(editDistance('abcd', 'wxyz')).toBe(4);
  });

  it('early-exits past max', () => {
    expect(editDistance('abcdef', 'uvwxyz', 1)).toBe(2);
  });
});

describe('checkGuess', () => {
  it('accepts the exact name regardless of case/spacing', () => {
    expect(checkGuess('marcus vale', fixture('marcus-vale'))).toBe(true);
    expect(checkGuess('MARCUS  VALE', fixture('marcus-vale'))).toBe(true);
  });

  it('accepts aliases', () => {
    expect(checkGuess('JJ Steele', fixture('jamarion-steele'))).toBe(true);
    expect(checkGuess('Reggie Lane', fixture('reggie-okafor-lane'))).toBe(true);
  });

  it('accepts punctuation variants', () => {
    expect(checkGuess('DMarco St Pierre', fixture('dmarco-st-pierre'))).toBe(true);
    expect(checkGuess("d'marco st. pierre", fixture('dmarco-st-pierre'))).toBe(true);
    expect(checkGuess('Nico Valdes', fixture('nico-valdes'))).toBe(true);
  });

  it('forgives a single typo on long names', () => {
    expect(checkGuess('Harrison Delacroiz', fixture('harrison-delacroix'))).toBe(true);
    expect(checkGuess('Harison Delacroix', fixture('harrison-delacroix'))).toBe(true);
  });

  it('accepts the last name on its own, but not the first name', () => {
    const p = PROSPECTS.find((x) => x.id === 'navorro-bowman')!;
    expect(checkGuess('Bowman', p)).toBe(true);
    expect(checkGuess('NaVorro', p)).toBe(false);
  });

  it('rejects wrong names and empty input', () => {
    expect(checkGuess('Tom Brady', fixture('marcus-vale'))).toBe(false);
    expect(checkGuess('', fixture('marcus-vale'))).toBe(false);
    expect(checkGuess('Marcus', fixture('marcus-vale'))).toBe(false);
  });

  it('accepts every real prospect by name, lower-cased and with a typo', () => {
    for (const p of PROSPECTS) {
      expect(checkGuess(p.name.toLowerCase(), p), p.name).toBe(true);
    }
    const bowman = PROSPECTS.find((p) => p.id === 'navorro-bowman');
    expect(bowman && checkGuess('navorro bowmen', bowman)).toBe(true);
  });

  it('does not accept one prospect as another', () => {
    const pool = [...PROSPECTS, ...FIXTURES];
    for (const a of pool) {
      for (const b of pool) {
        if (a.id === b.id) continue;
        expect(checkGuess(a.name, b), `${a.name} should not match ${b.name}`).toBe(false);
      }
    }
  });
});

describe('isDuplicateGuess', () => {
  it('detects repeats after normalization', () => {
    expect(isDuplicateGuess('marcus vale', ['Marcus Vale'])).toBe(true);
    expect(isDuplicateGuess('Trey Lockhart', ['Marcus Vale'])).toBe(false);
  });
});
