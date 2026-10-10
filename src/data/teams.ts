/** Team colors by nickname: primary (band) and secondary (city line). Old names map to today's team. */
export interface TeamColors {
  primary: string;
  secondary: string;
}

export const TEAM_COLORS: Record<string, TeamColors> = {
  Cardinals: { primary: '#97233F', secondary: '#FFB612' },
  Falcons: { primary: '#A71930', secondary: '#C8CCCE' },
  Ravens: { primary: '#241773', secondary: '#9E7C0C' },
  Bills: { primary: '#00338D', secondary: '#E8A1A9' },
  Panthers: { primary: '#0085CA', secondary: '#BFC0BF' },
  Bears: { primary: '#0B162A', secondary: '#C83803' },
  Bengals: { primary: '#FB4F14', secondary: '#000000' },
  Browns: { primary: '#311D00', secondary: '#FF3C00' },
  Cowboys: { primary: '#003594', secondary: '#B0B7BC' },
  Broncos: { primary: '#002244', secondary: '#FB4F14' },
  Lions: { primary: '#0076B6', secondary: '#B0B7BC' },
  Packers: { primary: '#203731', secondary: '#FFB612' },
  Texans: { primary: '#03202F', secondary: '#A71930' },
  Oilers: { primary: '#418FDE', secondary: '#C8102E' },
  Colts: { primary: '#002C5F', secondary: '#A2AAAD' },
  Jaguars: { primary: '#006778', secondary: '#D7A22A' },
  Chiefs: { primary: '#E31837', secondary: '#FFB81C' },
  Raiders: { primary: '#000000', secondary: '#A5ACAF' },
  Chargers: { primary: '#0080C6', secondary: '#FFC20E' },
  Rams: { primary: '#003594', secondary: '#FFA300' },
  Dolphins: { primary: '#008E97', secondary: '#FC4C02' },
  Vikings: { primary: '#4F2683', secondary: '#FFC62F' },
  Patriots: { primary: '#002244', secondary: '#C60C30' },
  Saints: { primary: '#101820', secondary: '#D3BC8D' },
  Giants: { primary: '#0B2265', secondary: '#A71930' },
  Jets: { primary: '#125740', secondary: '#FFFFFF' },
  Eagles: { primary: '#004C54', secondary: '#A5ACAF' },
  Steelers: { primary: '#101820', secondary: '#FFB612' },
  '49ers': { primary: '#AA0000', secondary: '#B3995D' },
  Seahawks: { primary: '#002244', secondary: '#69BE28' },
  Buccaneers: { primary: '#D50A0A', secondary: '#B1BABF' },
  Titans: { primary: '#0C2340', secondary: '#4B92DB' },
  Commanders: { primary: '#5A1414', secondary: '#FFB612' },
  Redskins: { primary: '#5A1414', secondary: '#FFB612' },
};

/**
 * Wordmark lettering for the pick card's team name. Teams' real wordmark fonts are custom and not
 * public, so each maps to the closest free (Google) font in the same style: slab blocks, condensed
 * sans, wide heavy sans, collegiate block, serif, or a slanted sporty italic. Swap in real font
 * files here if you ever have them.
 */
export interface TeamFont {
  family: string;
  /** Google Fonts weight to load */
  weight: number;
  /** Slant like the team's italic wordmark */
  italic?: boolean;
  lowercase?: boolean;
}

const SLAB: TeamFont = { family: 'Alfa Slab One', weight: 400 };
const SLAB_ITALIC: TeamFont = { ...SLAB, italic: true };
const CONDENSED: TeamFont = { family: 'Oswald', weight: 700 };
const SPORT_ITALIC: TeamFont = { family: 'Teko', weight: 700, italic: true };
const WIDE: TeamFont = { family: 'Archivo Black', weight: 400 };
const WIDE_ITALIC: TeamFont = { ...WIDE, italic: true };
const BLOCK: TeamFont = { family: 'Graduate', weight: 400 };
const SERIF: TeamFont = { family: 'Playfair Display', weight: 900 };

export const TEAM_FONTS: Record<string, TeamFont> = {
  Cardinals: SLAB_ITALIC,
  Falcons: SPORT_ITALIC,
  Ravens: SERIF,
  Bills: SPORT_ITALIC,
  Panthers: SPORT_ITALIC,
  Bears: SLAB,
  Bengals: CONDENSED,
  Browns: SLAB,
  Cowboys: SLAB,
  Broncos: SPORT_ITALIC,
  Lions: WIDE,
  Packers: SLAB,
  Texans: SLAB,
  Oilers: WIDE,
  Colts: WIDE,
  Jaguars: CONDENSED,
  Chiefs: SLAB_ITALIC,
  Raiders: BLOCK,
  Chargers: SPORT_ITALIC,
  Rams: WIDE,
  Dolphins: SPORT_ITALIC,
  Vikings: BLOCK,
  Patriots: SPORT_ITALIC,
  Saints: SERIF,
  Giants: { ...WIDE_ITALIC, lowercase: true },
  Jets: WIDE_ITALIC,
  Eagles: SPORT_ITALIC,
  Steelers: WIDE,
  '49ers': SLAB_ITALIC,
  Seahawks: WIDE_ITALIC,
  Buccaneers: CONDENSED,
  Titans: SPORT_ITALIC,
  Commanders: BLOCK,
  Redskins: BLOCK,
};

/** Load a team font from Google Fonts on demand (once), so only the shown team's font downloads. */
export function loadTeamFont(font: TeamFont): void {
  if (typeof document === 'undefined') return;
  const id = `team-font-${font.family.replace(/\s+/g, '-')}-${font.weight}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/\s+/g, '+')}:wght@${font.weight}&display=swap`;
  document.head.appendChild(link);
}
