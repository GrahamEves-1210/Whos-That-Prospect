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
    // REAL Draft Bible quotes (the first from his interview with them, the last from his college coach).
    // Testing: 2021 pro day (no combine that year); all three sources agree.
    id: 'rashawn-slater',
    name: 'Rashawn Slater',
    position: 'OT',
    college: 'Northwestern',
    conference: 'Big Ten',
    height: '6-4',
    weight: 304,
    draftYear: 2021,
    draftRound: 1,
    draftPick: 13,
    fortyTime: 4.91,
    vertical: 33,
    broadJump: 112,
    otherTesting: { Bench: '33 reps', '3-Cone': '7.48s', Shuttle: '4.45s', 'Hand Size': '10 1/2"', 'Arm Length': '33"' },
    scoutingExcerpts: [
      {
        question: 'Obviously, a lot has been made of the length. Did you ever think that would be such a talking point? And how sick are you of hearing it and kind of going out there and proving that they are long enough?',
        text: 'It’s definitely tiring when you put so much work in, put all that film out of you playing tackle, and then people are going to question that just based off of a measurable.',
      },
      'Slater was the anchor of the Wildcats offensive line. He made a smooth transition to left tackle in 2019 after starting the previous two seasons at right tackle and laid down some highly impressive film against Ohio State DE Chase Young.',
      {
        text: 'Amazing family, dad played in the NBA. Really athletic, just needed to get stronger and to Rashawn’s credit, my goodness is he a freak in the weight room. He’s going to have one heck of a pro day.',
        credit: 'Northwestern Head Coach Pat Fitzgerald',
      },
    ],
    clues: [{ label: 'Drafted by', value: 'Los Angeles Chargers', unlockAt: 4 }],
    accolades: ['Third-team All-Big Ten (2018)'],
    hometown: 'Sugar Land, TX',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4242283.png',
  },
  {
    // REAL Draft Bible quotes. Testing: 2008 NFL Combine (his 4.58 forty and 42" vertical were from Ohio State's
    // pro day, so not used). Arm length left off: the sources disagree (33 1/8" vs 34").
    id: 'vernon-gholston',
    name: 'Vernon Gholston',
    position: 'EDGE',
    college: 'Ohio State',
    conference: 'Big Ten',
    height: '6-3',
    weight: 266,
    draftYear: 2008,
    draftRound: 1,
    draftPick: 6,
    fortyTime: 4.65,
    vertical: 35.5,
    broadJump: 125,
    otherTesting: { Bench: '37 reps', '3-Cone': '7.12s', Shuttle: '4.40s', 'Hand Size': '10"' },
    scoutingExcerpts: [
      'Built like a chiseled sculpture, Gholston combines power and agility: a physical specimen who is all muscle. He anticipates the snap as well as anyone and possesses the lightning quick first step to make opponents pay.',
      'When you play at a football school, even potential NFL stars can be overshadowed by some of their teammates. However, by draft day everyone will know who Gholston is. He had 14 sacks this past season, including a marquee effort against highly touted Michigan offensive tackle Jake Long.',
      'Gholston proved he is more than a workout warrior, rushing the edge for the past two seasons on a Buckeyes team that made it to back-to-back BCS Championship games.',
    ],
    clues: [{ label: 'Drafted by', value: 'New York Jets', unlockAt: 4 }],
    accolades: ['Second-team All-American (2007)', 'Big Ten Defensive Lineman of the Year (2007)', 'First-team All-Big Ten (2007)', 'Second-team All-Big Ten (2006)'],
    hometown: 'Detroit, MI',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/11240.png',
  },
  {
    // REAL Draft Bible quotes. Testing: 2010 NFL Combine (nflcombineresults); 3-cone, hand and arm from his
    // Wikipedia pre-draft table (it mixes combine and pro day, so the combine numbers win where they differ).
    // Junior college at Canyons and Fort Scott, then one season at South Florida.
    id: 'jason-pierre-paul',
    name: 'Jason Pierre-Paul',
    aliases: ['JPP'],
    position: 'EDGE',
    college: 'South Florida',
    conference: 'Big East',
    height: '6-5',
    weight: 270,
    draftYear: 2010,
    draftRound: 1,
    draftPick: 15,
    fortyTime: 4.71,
    vertical: 30.5,
    broadJump: 115,
    otherTesting: { Bench: '19 reps', '3-Cone': '7.18s', Shuttle: '4.67s', 'Hand Size': '10 3/8"', 'Arm Length': '34 3/4"' },
    scoutingExcerpts: [
      'In the 75-year history of the NFL Draft, no single player may have blazed a faster trail to the first round based on pure potential than Pierre-Paul.',
      'A fast-riser leading up to the draft, Pierre-Paul is one of the more impressive athletes you will ever see; he owns an 81” wingspan and is notorious for his practice video in which he did 13 consecutive backflips.',
      'The Florida native is behind in the learning curve when it comes to technique, particularly when he needs to use his hands in the trenches. He is not very stout at the point of attack and can get pushed around.',
    ],
    clues: [{ label: 'Drafted by', value: 'New York Giants', unlockAt: 4 }],
    accolades: ['First-team All-American (2009)', 'First-team All-Big East (2009)'],
    hometown: 'Deerfield Beach, FL',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/13256.png',
  },
  {
    // REAL Draft Bible quotes. Testing: 2019 NFL Combine; where sources differ (3-cone, shuttle), the two that
    // agree. Started at Presbyterian (FCS), transferred to Temple for 2018.
    id: 'rock-ya-sin',
    name: 'Rock Ya-Sin',
    aliases: ['Rock Yasin'],
    position: 'CB',
    college: 'Temple',
    conference: 'AAC',
    height: '5-11',
    weight: 192,
    draftYear: 2019,
    draftRound: 2,
    draftPick: 34,
    fortyTime: 4.51,
    vertical: 39.5,
    broadJump: 120,
    otherTesting: { Bench: '18 reps', '3-Cone': '6.97s', Shuttle: '4.31s', 'Hand Size': '9 7/8"', 'Arm Length': '32"' },
    scoutingExcerpts: [
      'While the added exposure in Philadelphia certainly helped, savvy scouts were already aware of Ya-Sin, who had started the previous three seasons at Presbyterian and had already tied conference records for the most interceptions in a single season (five).',
      'Aptly-named given his rocked-up frame, a testament to a lot of time spent in the weight-room.',
      'Comparison: Craig Mager, Denver Broncos. The 5-11, 200 pound Mager was originally drafted in the third round three years ago by the Chargers. Like Ya-Sin, Mager spent much of his college career at a lower level (Texas State), earning a draft pick based on his size and athleticism but sticking because of his grit.',
    ],
    clues: [{ label: 'Drafted by', value: 'Indianapolis Colts', unlockAt: 4 }],
    accolades: ['First-team All-AAC (2018)', 'First-team All-Big South (2017)'],
    hometown: 'Decatur, GA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/3910229.png',
  },
  {
    // REAL Draft Bible quotes (the first is from USC's defensive coordinator). Testing: 2008 NFL Combine;
    // the 40 follows the two sources that agree (4.92). College honors only (no NFL titles).
    id: 'chad-henne',
    name: 'Chad Henne',
    position: 'QB',
    college: 'Michigan',
    conference: 'Big Ten',
    height: '6-3',
    weight: 230,
    draftYear: 2008,
    draftRound: 2,
    draftPick: 57,
    fortyTime: 4.92,
    vertical: 25.5,
    broadJump: 106,
    otherTesting: { '3-Cone': '7.17s', Shuttle: '4.40s', 'Hand Size': '9"', 'Arm Length': '31 5/8"' },
    scoutingExcerpts: [
      { text: 'He’ll stay in the pocket, he’ll take a lick. He doesn’t really get sacked that much but he’ll take a good hit as long as he gets the ball off.', credit: 'USC Defensive Coordinator' },
      'Henne was hoping for a possible Heisman campaign and national championship run. He has struggled in some big games; that creates doubt in the minds of NFL evaluators.',
      'He has also enjoyed the benefit of playing with such illustrious receivers such as Braylon Edwards, Mario Manningham and Adrian Arrington while at Ann Arbor. However, the Pennsylvania quarterback has never beaten Ohio State (0-4) and had just one Bowl win in four tries.',
    ],
    clues: [{ label: 'Drafted by', value: 'Miami Dolphins', unlockAt: 4 }],
    accolades: ['First-team All-Big Ten (2007)', 'Second-team All-Big Ten (2006)'],
    hometown: 'Wyomissing, PA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/11291.png',
  },
  {
    // REAL Draft Bible quotes (the second is from his interview). Testing: 2023 NFL Combine; broad jump and
    // vertical where sources differ follow the two that agree (nflcombineresults + Wikipedia / MockDraftable).
    id: 'emmanuel-forbes',
    name: 'Emmanuel Forbes',
    aliases: ['Emmanuel Forbes Jr.'],
    position: 'CB',
    college: 'Mississippi State',
    conference: 'SEC',
    height: '6-0',
    weight: 166,
    draftYear: 2023,
    draftRound: 1,
    draftPick: 16,
    fortyTime: 4.35,
    vertical: 37.5,
    broadJump: 131,
    otherTesting: { 'Hand Size': '8 1/2"', 'Arm Length': '32 1/4"' },
    scoutingExcerpts: [
      'He possesses elite ball skills, as evident by his 14 career interceptions. Forbes transforms into a playmaker with the ball in his hands and has three career returns for touchdowns. The high-energy leader of the Bulldogs defense has the speed to tag along with any receiver in the nation.',
      'We came together as a team, as a family and just played in a bowl game for Coach Leach and played our tails off.',
      'Forbes is strong in man coverage and even better in zone due to his football intelligence. His highlight-reel play makes Forbes worthy of first-round consideration.',
    ],
    clues: [{ label: 'Drafted by', value: 'Washington Commanders', unlockAt: 4 }],
    accolades: ['Consensus All-American (2022)', 'First-team All-SEC (2022)', 'Second-team All-SEC (2021)', 'SEC All-Freshman (2020)'],
    hometown: 'Grenada, MS',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4429767.png',
  },
  {
    // REAL Draft Bible quotes. Testing: 2008 NFL Combine (no 3-cone, hand or arm on record). No college honors listed.
    id: 'peyton-hillis',
    name: 'Peyton Hillis',
    position: 'FB',
    college: 'Arkansas',
    conference: 'SEC',
    height: '6-1',
    weight: 240,
    draftYear: 2008,
    draftRound: 7,
    draftPick: 227,
    fortyTime: 4.67,
    vertical: 30.5,
    broadJump: 117,
    otherTesting: { Bench: '26 reps', Shuttle: '4.24s' },
    scoutingExcerpts: [
      'He can provide depth at the running back position and be a playmaker at receiver whether playing fullback, H-back or even as a slot receiver in four wide sets.',
      'A well-built athlete who shows more quickness and acceleration than expected for his size. He has phenominal hands out of the backfield, as well as being a solid runner and blocker no matter where he lines up.',
      'He began his career in Fayetteville as a short yardage runner and ended it as the Hogs’ leading receiver during his senior season.',
    ],
    clues: [{ label: 'Drafted by', value: 'Denver Broncos', unlockAt: 4 }],
    hometown: 'Conway, AR',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/11461.png',
  },
  {
    // REAL Draft Bible quotes (the third is from his interview with them). Testing: 2020 NFL Combine + MockDraftable.
    id: 'jalen-reagor',
    name: 'Jalen Reagor',
    position: 'WR',
    college: 'TCU',
    conference: 'Big 12',
    height: '5-11',
    weight: 206,
    draftYear: 2020,
    draftRound: 1,
    draftPick: 21,
    fortyTime: 4.47,
    vertical: 42,
    broadJump: 138,
    otherTesting: { Bench: '17 reps', '3-Cone': '7.31s', Shuttle: '4.46s', 'Hand Size': '9 1/2"', 'Arm Length': '31 3/8"' },
    scoutingExcerpts: [
      'Reagor has an unreal third gear which allows him to break down and stack any cornerback he faces up against. His video game style moves and elite speed strike up visions of Pro Bowl wide receiver DeSean Jackson.',
      'What was it like playing against Jeff Gladney every day? I feel like that’s the best corner in this draft.',
      'His father, Montae Reagor, played nine seasons in the NFL and was a member of the 2006 Indianapolis Colts who won Super Bowl XLI.',
    ],
    clues: [{ label: 'Drafted by', value: 'Philadelphia Eagles', unlockAt: 4 }],
    accolades: ['Big 12 Offensive Freshman of the Year (2017)', 'Second-team All-Big 12 (2018, 2019)'],
    hometown: 'Waxahachie, TX',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241802.png',
  },
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
      'After being overshadowed much of his career by the likes of Jauan Jennings and Marquez Callaway, Palmer put together a solid senior season.',
      'The frame and the big-play capabilities make the Ontario native an enticing Day 3 option, but he is nowhere near a finished product who should be relied on to contribute right out of the gate.',
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
  10: 'jalen-reagor',
  11: 'josh-palmer',
  12: 'peyton-hillis',
  13: 'navorro-bowman',
  14: 'jalen-reagor',
  15: 'chad-henne',
  16: 'rashawn-slater',
  17: 'jason-pierre-paul',
  18: 'emmanuel-forbes',
  19: 'vernon-gholston',
  20: 'rock-ya-sin',
};

/** Credit shown in the footer for every scouting excerpt. */
export const DEFAULT_EXCERPT_SOURCE = 'The NFL Draft Bible';

/** The Draft Bible's own domain (currently redirects to All Access Football). */
export const EXCERPT_SOURCE_URL = 'https://nfldraftbible.com/';
