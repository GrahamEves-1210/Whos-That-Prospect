# Who’s That Prospect?

A mobile-first daily guessing game. Every day there is one mystery former NFL draft prospect.
You start with their blacked-out silhouette, their position and one scouting-report excerpt.
Every wrong guess unlocks another clue from their pre-draft profile until only the name is missing. Six guesses.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (use http://127.0.0.1:5173 if localhost hangs)
npm test           # game-logic unit tests (vitest)
npm run build      # typecheck + production build → dist/
npm run preview    # serve the production build
```

Open `/?puzzle=3` (or use the Film room menu) to replay a past day’s prospect. Film room and
practice games are not saved and don’t count toward stats.

## File structure

```
index.html                    HTML shell; loads Clash Display (Fontshare) and Geist / Geist Mono (Google Fonts)
public/favicon.svg
src/
  main.tsx                    React entry
  App.tsx                     Composes the screen; owns menus, toasts, confetti, reveal timing
  styles/global.css           All styling (tokens at the top)

  data/                       ← STANDALONE DATA LAYER
    types.ts                  Prospect / CustomClue types, position names
    prospects.ts              The prospect pool, excerpt source name and link

  game/                       ← PURE GAME LOGIC (no React, fully unit-tested)
    config.ts                 MAX_GUESSES, time zone, puzzle epoch, rotation seed, storage keys
    time.ts                   Eastern-midnight math: getPuzzleNumber(), getNextResetTime()
    daily.ts                  getDailyProspect(), getPracticeProspect()
    guess.ts                  normalizeGuess(), checkGuess(), typo tolerance
    clues.ts                  buildClues() / getUnlockedClues(): the data-driven clue ladder
    columns.ts                Prospect-file rows (Height, Weight, Testing, Conference, Year, College, Pick)
    engine.ts                 createGame(), applyGuess(): pure state transitions
    storage.ts                saveGameState(), loadGameState(), stats + streaks (localStorage)
    share.ts                  generateShareText(), shareText() (Web Share → clipboard)
    random.ts                 Seeded PRNG + permutation for the daily rotation
    types.ts                  GameState, Stats, Clue, GuessOutcome

  hooks/
    useGame.ts                React glue around the engine: persistence, stats, events, modes
    useCountdown.ts           1-second ticker to the next reset

  components/
    SplashScreen.tsx          Split-screen intro with today's silhouette
    Headshot.tsx              Real headshot: blurred black shape while playing (Show silhouette sharpens it), full color on game over
    Logo.tsx                  Logo image (public/logo.png; mark cropped to public/mark.png for the favicon)
    GameHeader.tsx            Logo + mode label, Help / Stats / About / Film room toolbar
    GameStatusBar.tsx         File label, elapsed timer, "Guess 2 of 6" + ticks
    GuessInput.tsx            Label-above input, submit, helper text, inline error
    ClueBoard.tsx             The prospect card: name + seven facts, locked until their step unlocks
    ClueReveal.tsx            One prospect-card row (striped placeholder → value)
    GuessHistory.tsx          Six numbered slots with wrong/correct marks
    MysteryPlayerCard.tsx     Photo card + identity block + scouting report
    ScoutingReportCard.tsx    Quoted excerpts and a blacked-out next excerpt
    ResultPanel.tsx           Game-over banner: stamp, headline, time + countdown, share / play again
    StatsPanel.tsx            Distribution, played / win % / streaks, countdown
    HelpPanel.tsx, AboutPanel.tsx, FlashbackPanel.tsx, Notification.tsx
    Panel.tsx                 Shared double-bezel Panel and pill Button (icon sits in a nested orb)
    Reveal.tsx                IntersectionObserver fade-up wrapper for scroll entry
    Timer.tsx, Countdown.tsx, Confetti.tsx, icons.tsx

tests/                        vitest suites; tests/fixtures.ts holds fictional edge-case prospects
```

## Accounts and leaderboard (Supabase)

The game works without this; Profile and the leaderboard just say accounts aren't set up.

1. Create a project at supabase.com.
2. In the dashboard, open SQL Editor, paste `supabase/schema.sql`, and run it.
3. Copy `.env.example` to `.env.local` and fill in the Project URL and anon key from Project Settings > API.
4. Restart `npm run dev`.

Players sign up with email and password. Their username starts as the part of the email before the @ and can be changed in Profile.
A finished daily game is posted to the leaderboard automatically when signed in. Results are submitted by the client, so they can be faked by a determined player.
To skip the confirmation email while testing, turn off "Confirm email" under Authentication > Providers > Email.

## The prospect pool

`src/data/prospects.ts` holds eight real prospects from the 2023, 2024 and 2025 drafts. The daily
puzzle cycles through all eight before repeating.

| Prospect | Pos | Draft |
|---|---|---|
| Xavier Worthy | WR | 2024, Round 1, Pick 28 |
| Quinyon Mitchell | CB | 2024, Round 1, Pick 22 |
| Ashton Jeanty | RB | 2025, Round 1, Pick 6 |
| Shemar Stewart | EDGE | 2025, Round 1, Pick 17 |
| Shedeur Sanders | QB | 2025, Round 5, Pick 144 |
| Brock Bowers | TE | 2024, Round 1, Pick 13 |
| Jack Campbell | LB | 2023, Round 1, Pick 18 |
| Puka Nacua | WR | 2023, Round 5, Pick 177 |

- **Measurables and testing** come from NFL Scouting Combine results, cross-checked against
  MockDraftable. Jeanty and Sanders did not test, so a prospect-specific clue fills their testing step.
- **Draft slot, college and headshots** come from ESPN’s athlete API. `headshotUrl` points at ESPN’s
  transparent cut-out PNG; the game renders it with `filter: brightness(0)` for the silhouette and
  removes the filter on game over. Any transparent PNG works; an opaque photo would black out to a
  rectangle.
- **Scouting excerpts are placeholders.** They are original stand-in text, not Draft Bible text.
  The footer credits The NFL Draft Bible for every excerpt, so replace them with the licensed
  excerpts before launch.

### Adding or replacing prospects

1. Add a record to `PROSPECTS`. Keep `id` values stable once published, since saved games reference them.
2. Put the excerpts in `scoutingExcerpts`, vague to specific. Excerpt 1 shows at the start, excerpt 2
   after the first miss, the rest in the final step. Excerpts must not mention the name, college or
   draft slot (a unit test enforces this).
3. Fill `height` (`"6-3"`), `weight`, `fortyTime`, `vertical`, `broadJump` and `otherTesting`
   (`{ Bench: '20 reps', 'Hand Size': '10"' }`).
4. For players who did not test, add a clue with `unlockAt: 3` so that miss still reveals something.
5. Use `aliases` for nicknames and common misspellings.
6. The source name and link live in `DEFAULT_EXCERPT_SOURCE` and `EXCERPT_SOURCE_URL`.

Note that adding prospects reshuffles the rotation. If past days need to stay stable after launch,
publish an explicit schedule instead.

## Daily puzzle mechanics

- Puzzle #1 is `PUZZLE_EPOCH` in `game/config.ts`; the number increments at **midnight Eastern**
  regardless of the player’s time zone (DST-safe).
- Today’s game is saved to `localStorage` on every guess, so refreshing restores it. Stats are saved
  separately and updated once per finished daily game.
- **Play Again** starts a practice game with a random prospect.

## Guess matching

Guesses are checked only against the mystery prospect’s `name` and `aliases`. Case, accents,
apostrophes, periods, hyphens, extra spaces and suffixes (Jr./III) are ignored, and one typo is
forgiven on names of nine or more characters (`TYPO_TOLERANCE` in `config.ts`).
