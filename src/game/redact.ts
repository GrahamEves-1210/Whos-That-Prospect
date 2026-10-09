import type { Prospect } from '../data/types';

export interface QuoteSegment {
  text: string;
  /** True when this piece is the player's name (full, first, last or an alias) */
  isName: boolean;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every form of the player's name that should be hidden: full name, aliases, and each name part. */
function nameForms(prospect: Pick<Prospect, 'name' | 'aliases'>): string[] {
  const forms = new Set<string>();
  for (const n of [prospect.name, ...(prospect.aliases ?? [])]) {
    forms.add(n);
    for (const part of n.split(/\s+/)) {
      const clean = part.replace(/[.,]/g, '');
      // Skip suffixes and tiny tokens (Jr, II, III, initials)
      if (clean.length >= 3 && !/^(jr|sr|ii|iii|iv)$/i.test(clean)) forms.add(clean);
    }
  }
  // Longest first so "NaVorro Bowman" is matched as one piece rather than two
  return [...forms].sort((a, b) => b.length - a.length);
}

/**
 * Split a scouting quote into plain text and name pieces, so the UI can black out every mention of
 * the player (any capitalization) while the game is on. Possessives stay outside the bar.
 */
export function splitQuoteOnName(text: string, prospect: Pick<Prospect, 'name' | 'aliases'>): QuoteSegment[] {
  const forms = nameForms(prospect);
  if (forms.length === 0) return [{ text, isName: false }];
  const re = new RegExp(`(?<![\\p{L}])(${forms.map(escape).join('|')})(?![\\p{L}])`, 'giu');
  const out: QuoteSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), isName: false });
    out.push({ text: m[0], isName: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), isName: false });
  return out;
}
