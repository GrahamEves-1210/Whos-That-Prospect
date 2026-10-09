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
