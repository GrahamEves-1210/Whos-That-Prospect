import type { Prospect } from './types';

/**
 * PROSPECT POOL
 * -------------
 * Eight real prospects from the 2023, 2024 and 2025 drafts. The daily puzzle
 * cycles through all of them before repeating.
 *
 * Data sources:
 *  - Height, weight and testing: NFL Scouting Combine results
 *    (cross-checked against MockDraftable). Jeanty, Sanders and Bowers did not
 *    test; Nacua's drills are from his pro day.
 *  - Draft slot, college, headshot: ESPN athlete API.
 *  - Headshots are ESPN's transparent cut-out PNGs, loaded from their CDN.
 *
 * SCOUTING EXCERPTS ARE PLACEHOLDERS. They are original stand-in text written
 * for the prototype, NOT text from The NFL Draft Bible. Replace them with the
 * licensed Draft Bible excerpts before launch — the footer credits the Draft
 * Bible as the source of every excerpt.
 *
 * Adding prospects:
 *  - Excerpt 1 shows at the start, excerpt 2 after the first miss, the rest in
 *    the final step. Order them vague → specific.
 *  - Excerpts must not mention the player's name, college or draft slot.
 *  - Keep `id` values stable once published — saved games reference them.
 *  - `clues` with `unlockAt: 3` fill the testing step for players who didn't test.
 */
export const PROSPECTS: Prospect[] = [
  {
    id: 'xavier-worthy',
    name: 'Xavier Worthy',
    position: 'WR',
    college: 'Texas',
    conference: 'Big 12',
    height: '5-11',
    weight: 165,
    draftYear: 2024,
    draftRound: 1,
    draftPick: 28,
    fortyTime: 4.21,
    vertical: 41,
    broadJump: 131,
    otherTesting: { 'Hand Size': '8 3/4"', 'Arm Length': '31 1/8"' },
    scoutingExcerpts: [
      'Game-breaking long speed that forces safeties to bail at the snap; wins vertically without needing a clean release.',
      'Rail-thin frame shows against press and through contact, and physical corners can knock him off his landing spots.',
      'Produced from his first college snap and adds value in the return game. The testing confirmed every bit of the speed on tape.',
    ],
    clues: [{ label: 'Combine note', value: 'Ran the fastest 40-yard dash in combine history' }],
    hometown: 'Fresno, CA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4683062.png',
  },
  {
    id: 'quinyon-mitchell',
    name: 'Quinyon Mitchell',
    aliases: ['Quinyon Mitchel'],
    position: 'CB',
    college: 'Toledo',
    conference: 'MAC',
    height: '6-0',
    weight: 195,
    draftYear: 2024,
    draftRound: 1,
    draftPick: 22,
    fortyTime: 4.33,
    vertical: 38,
    broadJump: 120,
    otherTesting: { Bench: '20 reps', 'Hand Size': '10"', 'Arm Length': '31"' },
    scoutingExcerpts: [
      'Fluid, patient press corner who mirrors releases at the line and stays in phase all the way down the sideline.',
      'Level of competition is the main question, as he was rarely tested by NFL-caliber receivers before all-star week.',
      'Turned a dominant all-star week into a first-round grade, and the ball production backs up the tape.',
    ],
    clues: [{ label: 'All-star week', value: 'Senior Bowl standout' }],
    hometown: 'Williston, FL',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4686273.png',
  },
  {
    id: 'ashton-jeanty',
    name: 'Ashton Jeanty',
    position: 'RB',
    college: 'Boise State',
    conference: 'Mountain West',
    height: '5-8',
    weight: 211,
    draftYear: 2025,
    draftRound: 1,
    draftPick: 6,
    scoutingExcerpts: [
      'Low center of gravity and violent contact balance; first contact rarely ends the run.',
      'Workload is the long-term question after carrying one of the heaviest loads in college football.',
      'Finished a Heisman-runner-up season just shy of the all-time single-season rushing record.',
    ],
    clues: [{ label: 'Final season', value: '2,601 rushing yards, 29 rushing TD', unlockAt: 3 }],
    accolades: ['Heisman Trophy runner-up (2024)', 'Doak Walker Award (2024)', 'Maxwell Award (2024)'],
    hometown: 'Frisco, TX',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4890973.png',
  },
  {
    id: 'shemar-stewart',
    name: 'Shemar Stewart',
    position: 'EDGE',
    college: 'Texas A&M',
    conference: 'SEC',
    height: '6-5',
    weight: 267,
    draftYear: 2025,
    draftRound: 1,
    draftPick: 17,
    fortyTime: 4.59,
    vertical: 40,
    broadJump: 131,
    otherTesting: { 'Hand Size': '9 5/8"', 'Arm Length': '34 1/8"' },
    scoutingExcerpts: [
      'Rare length and explosiveness for his size; sets a firm edge and overwhelms tight ends at the point of attack.',
      'Production has never matched the tools. The rush plan lacks counters and he finishes too few of the pressures he creates.',
      'Former five-star recruit who tested off the charts at nearly 270 pounds.',
    ],
    clues: [{ label: 'Production', value: '4.5 career sacks in three seasons' }],
    hometown: 'Miami, FL',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4685562.png',
  },
  {
    id: 'shedeur-sanders',
    name: 'Shedeur Sanders',
    position: 'QB',
    college: 'Colorado',
    conference: 'Big 12',
    height: '6-1',
    weight: 212,
    draftYear: 2025,
    draftRound: 5,
    draftPick: 144,
    scoutingExcerpts: [
      'Surgical in the short and intermediate game; reads the field quickly and puts the ball on the correct shoulder.',
      'Holds the ball too long hunting for the big play and absorbed a heavy sack total behind a leaky line.',
      'Transferred up from the FCS level with his head coach and became a record-setting passer in a power conference.',
    ],
    clues: [
      { label: 'Final season', value: '4,134 passing yards, 37 TD', unlockAt: 3 },
      { label: 'Draft day', value: 'Slid to Day 3 despite first-round projections' },
    ],
    accolades: ['Johnny Unitas Golden Arm Award (2024)'],
    hometown: 'Dallas, TX',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432762.png',
  },
  {
    // Did no drills at the combine or his pro day (hamstring); combine weigh-in only.
    id: 'brock-bowers',
    name: 'Brock Bowers',
    position: 'TE',
    college: 'Georgia',
    conference: 'SEC',
    height: '6-3',
    weight: 243,
    draftYear: 2024,
    draftRound: 1,
    draftPick: 13,
    otherTesting: { 'Hand Size': '9 3/4"', 'Arm Length': '32 3/4"' },
    scoutingExcerpts: [
      'Moves like a big receiver: separates from linebackers with sharp breaks and turns short throws into chunk gains after the catch.',
      'Light for an in-line role and can get stacked by longer defensive ends when asked to block on the edge.',
      'A focal point of back-to-back national title teams, used as a runner on schemed touches as well as a receiver.',
    ],
    clues: [{ label: 'Freshman year', value: '882 receiving yards, 13 TD', unlockAt: 3 }],
    accolades: ['John Mackey Award (2022, 2023)', 'National champion (2021, 2022)'],
    hometown: 'Napa, CA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432665.png',
  },
  {
    id: 'jack-campbell',
    name: 'Jack Campbell',
    position: 'LB',
    college: 'Iowa',
    conference: 'Big Ten',
    height: '6-5',
    weight: 249,
    draftYear: 2023,
    draftRound: 1,
    draftPick: 18,
    fortyTime: 4.65,
    vertical: 37.5,
    broadJump: 128,
    otherTesting: { '3-Cone': '6.74s', Shuttle: '4.24s', 'Hand Size': '10 1/4"', 'Arm Length': '31 7/8"' },
    scoutingExcerpts: [
      'Instinctive, downhill inside linebacker who diagnoses run fits quickly and arrives with a heavy shoulder.',
      'Long frame and upright pads can leave him a step late changing direction in man coverage against quicker backs.',
      'Tested like an elite athlete at his size, and his leadership and off-field credentials stood out to every evaluator.',
    ],
    clues: [{ label: 'Draft day', value: 'First linebacker taken in his class' }],
    accolades: ['Butkus Award (2022)', 'William V. Campbell Trophy (2022)'],
    hometown: 'Cedar Falls, IA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4569465.png',
  },
  {
    // Combine weigh-in and length; drills are from his pro day (he did not run at the combine).
    id: 'puka-nacua',
    name: 'Puka Nacua',
    position: 'WR',
    college: 'BYU',
    conference: 'Independent',
    height: '6-2',
    weight: 201,
    draftYear: 2023,
    draftRound: 5,
    draftPick: 177,
    fortyTime: 4.57,
    vertical: 33,
    broadJump: 121,
    otherTesting: { Bench: '15 reps', '3-Cone': '7.32s', Shuttle: '4.36s', 'Hand Size': '9 1/2"', 'Arm Length': '31 1/2"' },
    scoutingExcerpts: [
      'Big-bodied possession receiver who catches everything in traffic and runs angry after the catch.',
      'Lacks a true second gear, and injuries limited his availability, so speed and durability questions pushed him down boards.',
      'Transferred home after two quiet seasons elsewhere and became the focal point of the offense, including jet sweeps and runs.',
    ],
    clues: [{ label: 'NFL rookie year', value: 'Set rookie records for catches and receiving yards' }],
    hometown: 'Provo, UT',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4426515.png',
  },
  // ---- Pinned to puzzles No. 1-3 (see PINNED_PUZZLES below). Deep-cut, late-round picks. ----
  {
    id: 'dee-winters',
    name: 'Dee Winters',
    position: 'LB',
    college: 'TCU',
    conference: 'Big 12',
    height: '5-11',
    weight: 227,
    draftYear: 2023,
    draftRound: 6,
    draftPick: 216,
    fortyTime: 4.49,
    vertical: 30.5,
    broadJump: 117,
    otherTesting: { 'Hand Size': '8 5/8"', 'Arm Length': '31 5/8"' },
    scoutingExcerpts: [
      'Undersized, twitchy linebacker who plays like a safety in the box and closes on the ball in a hurry.',
      'Lack of length shows when blockers get their hands on him, and he can get washed out on downhill runs.',
      'A senior-year starter on a surprise national-title-game team, projected as a special-teams core player who can cover in space.',
    ],
    clues: [{ label: 'Final college season', value: 'Played in the national championship game' }],
    hometown: 'Brenham, TX',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4428914.png',
  },
  {
    id: 'zack-kuntz',
    name: 'Zack Kuntz',
    aliases: ['Zach Kuntz'],
    position: 'TE',
    college: 'Old Dominion',
    conference: 'Sun Belt',
    height: '6-7',
    weight: 255,
    draftYear: 2023,
    draftRound: 7,
    draftPick: 220,
    fortyTime: 4.55,
    vertical: 40,
    broadJump: 128,
    otherTesting: { Bench: '23 reps', '3-Cone': '6.87s', Shuttle: '4.12s', 'Hand Size': '10 1/4"', 'Arm Length': '34"' },
    scoutingExcerpts: [
      'A huge target who moves like a wide receiver, with long strides that eat up cushion in a hurry.',
      'Raw as a blocker and missed most of his final season with injury, so the tape is thin.',
      'Started his career at a Big Ten program, then tested as one of the best athletes at his position in combine history.',
    ],
    clues: [{ label: 'College path', value: 'Transferred from a Big Ten program' }],
    hometown: 'Camp Hill, PA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4361417.png',
  },
  {
    id: 'andrei-iosivas',
    name: 'Andrei Iosivas',
    position: 'WR',
    college: 'Princeton',
    conference: 'Ivy League',
    height: '6-3',
    weight: 205,
    draftYear: 2023,
    draftRound: 6,
    draftPick: 206,
    fortyTime: 4.43,
    vertical: 39,
    broadJump: 128,
    otherTesting: { Bench: '19 reps', '3-Cone': '6.85s', Shuttle: '4.12s', 'Hand Size': '8 3/4"', 'Arm Length': '32"' },
    scoutingExcerpts: [
      'Long, fluid receiver with real build-up speed who wins on vertical routes and high-points the ball.',
      'Route tree is limited and the level of competition was low, so the transition will take time.',
      'An elite track athlete as well, and the testing numbers matched the multi-event background.',
    ],
    clues: [{ label: 'Two-sport athlete', value: 'Also starred in track and field' }],
    hometown: 'Honolulu, HI',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4368003.png',
  },
];

/**
 * Puzzle numbers pinned to a specific prospect. Every other day uses the seeded rotation of the
 * rest of the pool, so adding pinned prospects never changes which prospect any other day shows.
 */
export const PINNED_PUZZLES: Record<number, string> = {
  1: 'dee-winters',
  2: 'zack-kuntz',
  3: 'andrei-iosivas',
};

/** Credit shown in the footer for every scouting excerpt. */
export const DEFAULT_EXCERPT_SOURCE = 'The NFL Draft Bible';

/** The Draft Bible's own domain (currently redirects to All Access Football). */
export const EXCERPT_SOURCE_URL = 'https://nfldraftbible.com/';
