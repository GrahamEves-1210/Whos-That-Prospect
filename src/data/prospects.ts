import type { Prospect } from './types';

/**
 * PROSPECT POOL
 * -------------
 * Five real NFL draft picks from five different classes (2016, 2018, 2020, 2022, 2024), each pinned to a day in
 * PINNED_PUZZLES.
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
 *  - "Drafted by" unlocks at miss 4 (with conference and draft class) to keep these a bit easier.
 */
export const PROSPECTS: Prospect[] = [
  {
    id: 'jordan-howard',
    name: 'Jordan Howard',
    position: 'RB',
    college: 'Indiana',
    conference: 'Big Ten',
    height: '6-0',
    weight: 230,
    draftYear: 2016,
    draftRound: 5,
    draftPick: 150,
    fortyTime: 4.59,
    vertical: 34,
    broadJump: 122,
    otherTesting: { Bench: '16 reps', '3-Cone': '7.14s', Shuttle: '4.34s', 'Hand Size': '9"', 'Arm Length': '32 1/4"' },
    scoutingExcerpts: [
      'Big, downhill runner who gets north in a hurry and finishes runs by falling forward through contact.',
      'Not much of a threat in the passing game, and he lacks the burst to hit home runs on the edge.',
      'Had to change schools when his first program shut down football, then broke out as a workhorse at his second stop.',
    ],
    clues: [
      { label: 'Drafted by', value: 'Chicago Bears', unlockAt: 4 },
      { label: 'College path', value: 'Transferred after his first school shut down its football program' },
      { label: 'NFL rookie year', value: 'Made the Pro Bowl' },
    ],
    hometown: 'Gardendale, AL',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/3060022.png',
  },
  {
    id: 'jeremy-chinn',
    name: 'Jeremy Chinn',
    position: 'S',
    college: 'Southern Illinois',
    conference: 'Missouri Valley',
    height: '6-3',
    weight: 221,
    draftYear: 2020,
    draftRound: 2,
    draftPick: 64,
    fortyTime: 4.45,
    vertical: 41,
    broadJump: 138,
    otherTesting: { Bench: '20 reps', 'Hand Size': '9 5/8"', 'Arm Length': '32 1/8"' },
    scoutingExcerpts: [
      'Long, rangy defensive back with the size of a linebacker and the movement of a much smaller player.',
      'Small-school tape means his eyes and coverage technique are still raw against top competition.',
      'Put up one of the most explosive combine workouts at his position, with a broad jump over 11 feet.',
    ],
    clues: [
      { label: 'Drafted by', value: 'Carolina Panthers', unlockAt: 4 },
      { label: 'NFL rookie year', value: 'Scored two fumble-return touchdowns in one game' },
    ],
    hometown: 'Fishers, IN',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4043169.png',
  },
  {
    id: 'isaiah-likely',
    name: 'Isaiah Likely',
    position: 'TE',
    college: 'Coastal Carolina',
    conference: 'Sun Belt',
    height: '6-4',
    weight: 245,
    draftYear: 2022,
    draftRound: 4,
    draftPick: 139,
    vertical: 36,
    otherTesting: { Shuttle: '4.57s', 'Hand Size': '10"', 'Arm Length': '31 7/8"' },
    scoutingExcerpts: [
      'Smooth, receiver-like tight end who runs crisp routes and is a real threat after the catch.',
      'Undersized for an in-line role and gets moved around as a blocker against bigger defensive ends.',
      'Put up big touchdown numbers in a creative offense at a smaller program, often lining up in the slot.',
    ],
    clues: [{ label: 'Drafted by', value: 'Baltimore Ravens', unlockAt: 4 }],
    hometown: 'Cambridge, MA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4361050.png',
  },
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
      { label: 'College titles', value: 'Won two national championships' },
    ],
    hometown: 'Chatsworth, GA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4612826.png',
  },
  {
    id: 'foyesade-oluokun',
    name: 'Foyesade Oluokun',
    aliases: ['Foye Oluokun'],
    position: 'LB',
    college: 'Yale',
    conference: 'Ivy League',
    height: '6-2',
    weight: 229,
    draftYear: 2018,
    draftRound: 6,
    draftPick: 200,
    fortyTime: 4.48,
    vertical: 37,
    broadJump: 123,
    otherTesting: { Bench: '18 reps', '3-Cone': '6.94s', Shuttle: '4.12s' },
    scoutingExcerpts: [
      'Athletic, rangy linebacker who flies sideline to sideline and has the speed to run with backs and tight ends.',
      'Still learning to take on and shed blocks, and the small-school level of competition is a question.',
      'Tested like an elite athlete for the position and projects as a special-teams standout with upside on defense.',
    ],
    clues: [
      { label: 'Drafted by', value: 'Atlanta Falcons', unlockAt: 4 },
      { label: 'NFL career', value: 'Later led the NFL in tackles' },
    ],
    hometown: 'St. Louis, MO',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/3050073.png',
  },
];

/**
 * Puzzle numbers pinned to a specific prospect (No. 8 = Oct 8). Days that aren't pinned use the
 * seeded rotation of any unpinned prospects, or of the whole pool when every prospect is pinned.
 */
export const PINNED_PUZZLES: Record<number, string> = {
  6: 'jordan-howard',
  7: 'jeremy-chinn',
  8: 'isaiah-likely',
  9: 'ladd-mcconkey',
  10: 'foyesade-oluokun',
};

/** Credit shown in the footer for every scouting excerpt. */
export const DEFAULT_EXCERPT_SOURCE = 'The NFL Draft Bible';

/** The Draft Bible's own domain (currently redirects to All Access Football). */
export const EXCERPT_SOURCE_URL = 'https://nfldraftbible.com/';
