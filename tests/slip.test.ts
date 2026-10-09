import { describe, expect, it } from 'vitest';
import { pickSlip, splitName, splitTeam } from '../src/game/slip';
import type { Prospect } from '../src/data/types';

describe('pick slip', () => {
  it('splits names last, first and keeps suffixes with the last name', () => {
    expect(splitName('NaVorro Bowman')).toEqual({ last: 'Bowman', first: 'NaVorro' });
    expect(splitName('Odell Beckham Jr.')).toEqual({ last: 'Beckham Jr.', first: 'Odell' });
    expect(splitName('Amon-Ra St. Brown')).toEqual({ last: 'Brown', first: 'Amon-Ra St.' });
  });

  it('splits team city from nickname', () => {
    expect(splitTeam('Kansas City Chiefs')).toEqual({ city: 'Kansas City', nickname: 'Chiefs' });
    expect(splitTeam('')).toEqual({ city: '', nickname: '' });
  });

  it('fills the slip from the prospect, with undrafted handled', () => {
    const base = {
      id: 'x',
      name: 'Test Player',
      position: 'LB',
      college: 'Penn State',
      conference: 'Big Ten',
      height: '6-1',
      weight: 240,
      draftYear: 2010,
      draftRound: 3,
      draftPick: 91,
      scoutingExcerpts: [],
      clues: [{ label: 'Drafted by', value: 'San Francisco 49ers', unlockAt: 4 }],
    } satisfies Prospect;
    expect(pickSlip(base)).toMatchObject({ year: 2010, round: '3', overall: '91', city: 'San Francisco', nickname: '49ers', last: 'Player' });
    expect(pickSlip({ ...base, draftRound: null, draftPick: null, clues: [] })).toMatchObject({ round: 'Undrafted', overall: '', nickname: '' });
  });
});
