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
    // REAL Draft Bible quotes. 2021 had no combine: testing is from his pro day (via nflcombineresults + MockDraftable).
    id: 'josh-palmer',
    name: 'Josh Palmer',
    aliases: ['Joshua Palmer'],
    position: 'WR',
    college: 'Tennessee',
    conference: 'SEC',
    height: '6-1',
    weight: 210,
    draftYear: 2021,
    draftRound: 3,
    draftPick: 77,
    fortyTime: 4.52,
    vertical: 34,
    broadJump: 124,
    otherTesting: { '3-Cone': '6.98s', Shuttle: '4.24s', 'Hand Size': '9 5/8"', 'Arm Length': '33"' },
    scoutingExcerpts: [
      'The Canadian is a very physical pass-catcher who excels in contested catch situations and high-pointing the football.',
      'The frame and the big-play capabilities make the Ontario native an enticing Day 3 option, but he is nowhere near a finished product who should be relied on to contribute right out of the gate.',
      'After being overshadowed much of his career by the likes of Jauan Jennings and Marquez Callaway, Palmer put together a solid senior season.',
    ],
    clues: [{ label: 'Drafted by', value: 'Los Angeles Chargers', unlockAt: 4 }],
    accolades: ['Senior Bowl (2021)'],
    hometown: 'Brampton, ON',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4242433.png',
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
  10: 'josh-palmer',
};

/** Credit shown in the footer for every scouting excerpt. */
export const DEFAULT_EXCERPT_SOURCE = 'The NFL Draft Bible';

/** The Draft Bible's own domain (currently redirects to All Access Football). */
export const EXCERPT_SOURCE_URL = 'https://nfldraftbible.com/';
