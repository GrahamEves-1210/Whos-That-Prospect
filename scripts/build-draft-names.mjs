// Builds public/draft-names.json: every NFL draft pick from FIRST_YEAR to the latest draft, plus the notable
// undrafted free agents in notable-udfas.json, for the guess box's suggestions.
// Run after each April draft: `npm run draft-names`. Entries: [name, year] for picks, [name, year, 1] for UDFAs.
// Source: ESPN's public draft feed (one request per year, names inline).
import fs from 'node:fs';

const FIRST_YEAR = 2000;
const OUT = new URL('../public/draft-names.json', import.meta.url);

const lastYear = new Date().getFullYear();
const entries = [];
for (let year = FIRST_YEAR; year <= lastYear; year++) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/draft?season=${year}`);
  if (!res.ok) {
    console.log(`${year}: HTTP ${res.status}, skipped`);
    continue;
  }
  const picks = (await res.json()).picks ?? [];
  const names = picks.map((p) => p.athlete?.displayName?.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (names.length === 0) {
    console.log(`${year}: no picks yet, skipped`);
    continue;
  }
  for (const name of names) entries.push([name, year]);
  console.log(`${year}: ${names.length} picks`);
}

// Notable undrafted free agents (hand-picked list; add more any time). A name that was also drafted that year
// (a different player) stays as the drafted entry.
const udfas = JSON.parse(fs.readFileSync(new URL('./notable-udfas.json', import.meta.url), 'utf8'));
for (const [name, year] of udfas) entries.push([name, year, 1]);
console.log(`+ ${udfas.length} notable UDFAs`);

// One entry per name + year, sorted by name
const seen = new Set();
const unique = entries.filter(([n, y]) => {
  const key = `${n.toLowerCase()}|${y}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
unique.sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1]);

fs.writeFileSync(OUT, JSON.stringify(unique));
console.log(`Wrote ${unique.length} names to public/draft-names.json`);
