import type { Prospect } from './types';

/**
 * PROSPECT POOL
 * -------------
 * Real NFL draft picks, each pinned to a day in PINNED_PUZZLES.
 *
 * Data sources:
 *  - Height, weight and testing: NFL Scouting Combine results, cross-checked against
 *    MockDraftable (hand, arm and a few drills).
 *  - Draft slot, college, hometown, headshot: ESPN athlete API.
 *  - Headshots are ESPN's transparent cut-out PNGs, loaded from their CDN.
 *
 * SCOUTING EXCERPTS ARE PLACEHOLDERS. They are original stand-in text written
 * for the prototype, NOT text from The NFL Draft Bible. Replace them with the
 * licensed Draft Bible excerpts before launch. The footer credits the Draft
 * Bible as the source of every excerpt.
 *
 * Adding prospects:
 *  - Excerpt 1 shows at the start, excerpt 2 after the first miss, the rest in
 *    the final step. Order them vague to specific.
 *  - Excerpts must not mention the player's name, college or draft slot.
 *  - Keep `id` values stable once published; saved games reference them.
 *  - `clues` with `unlockAt: 3` fill the testing step for players who didn't test.
 *  - "Drafted by" unlocks at miss 4 with the rest of the Draft section. Honors are college honors only.
 */
export const PROSPECTS: Prospect[] = [



  {
    id: 'ladd-mcconkey',
    name: 'Ladd McConkey',
    aliases: ['Ladd Mcconkey'],
    position: 'WR',
    college: 'Georgia',
    conference: 'SEC',
    height: '6-0',
    weight: 186,
    draftYear: 2024,
    draftRound: 2,
    draftPick: 34,
    fortyTime: 4.39,
    vertical: 36,
    broadJump: 124,
    otherTesting: { Bench: '13 reps', '3-Cone': '6.72s', Shuttle: '3.97s', 'Hand Size': '8 5/8"', 'Arm Length': '30 1/4"' },
    scoutingExcerpts: [
      'Sudden, polished route runner who creates separation at every level and makes defenders miss after the catch.',
      'Slight frame and short arms show up against press, and injuries limited his final season.',
      'A key piece of back-to-back national title teams who ran in the 4.3s at the combine.',
    ],
    clues: [
      { label: 'Drafted by', value: 'Los Angeles Chargers', unlockAt: 4 },
    ],
    accolades: ['National champion (2021, 2022)'],
    hometown: 'Chatsworth, GA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4612826.png',
  },
  {
    // REAL quotes from The NFL Draft Bible (first real prospect). Name is blacked out in quotes while playing.
    id: 'navorro-bowman',
    name: 'NaVorro Bowman',
    aliases: ['Navorro Bowman'],
    position: 'LB',
    college: 'Penn State',
    conference: 'Big Ten',
    height: '6-1',
    weight: 242,
    draftYear: 2010,
    draftRound: 3,
    draftPick: 91,
    fortyTime: 4.7,
    vertical: 29.5,
    broadJump: 115,
    otherTesting: { Bench: '26 reps', '3-Cone': '6.70s', Shuttle: '4.59s', 'Hand Size': '9 7/8"', 'Arm Length': '33"' },
    scoutingExcerpts: [
      'The Maryland Mauler tracks down ball carriers with his outstanding sideline-to-sideline speed and hits them with the force of a torpedo.',
      'There’s every reason to think that Bowman will develop into a three-down linebacker in the NFL with his versatility and array of skills. Pro teams will be enamored with the multitude of ways they’ll be able to line him up.',
      'Bowman hits with a purpose and won’t hesitate to put his helmet on the football to force fumbles. “Big Play” Bowman also shows good timing as a blitzer.',
    ],
    clues: [{ label: 'Drafted by', value: 'San Francisco 49ers', unlockAt: 4 }],
    accolades: ['First-team All-Big Ten (2008, 2009)'],
    hometown: 'District Heights, MD',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/13262.png',
  },
];

/**
 * Puzzle numbers pinned to a specific prospect (No. 8 = Oct 8). Days that aren't pinned use the
 * seeded rotation of any unpinned prospects, or of the whole pool when every prospect is pinned.
 */
export const PINNED_PUZZLES: Record<number, string> = {
  9: 'navorro-bowman',
  10: 'ladd-mcconkey',
};

/** Credit shown in the footer for every scouting excerpt. */
export const DEFAULT_EXCERPT_SOURCE = 'The NFL Draft Bible';

/** The Draft Bible's own domain (currently redirects to All Access Football). */
export const EXCERPT_SOURCE_URL = 'https://nfldraftbible.com/';
