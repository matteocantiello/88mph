# 88mph

**A musical time machine.** Select a country and year to discover the top 10 songs that defined an era — from 1940s big band to 2020s Afrobeats, across 19 countries.

[![CI](https://github.com/matteocantiello/88mph/actions/workflows/ci.yml/badge.svg)](https://github.com/matteocantiello/88mph/actions/workflows/ci.yml)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's Inside

- **133 charts** across **19 countries**, spanning **1940–2020**
- Decade-based color themes that shift the entire UI palette per era
- Cultural context blurbs for every chart (what was happening in music that year)
- Spotify album art, 30-second previews with a mini player, and "Play on Spotify" links
- Film grain overlay, editorial typography (Instrument Serif + Outfit), staggered animations
- Random "teleport" button that drops you into a surprise era

## Available Charts

| Country | # | Years |
|---------|---|-------|
| USA | 16 | 1940, 1950, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020 |
| UK | 15 | 1952, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020 |
| Italy | 12 | 1947, 1950, 1955, 1960, 1965, 1975, 1985, 1990, 1995, 2000, 2010, 2020 |
| Germany | 11 | 1955, 1960, 1965, 1970, 1975, 1985, 1990, 1999, 2000, 2010, 2020 |
| Spain | 8 | 1965, 1975, 1980, 1985, 1990, 2000, 2005, 2015 |
| India | 7 | 1955, 1960, 1965, 1970, 1985, 1995, 2010 |
| France | 6 | 1955, 1960, 1965, 1980, 1995, 2010 |
| Japan | 6 | 1968, 1970, 1975, 1985, 1995, 2005 |
| Australia | 6 | 1960, 1970, 1980, 1990, 2000, 2015 |
| South Korea | 5 | 1980, 1990, 2000, 2010, 2020 |
| Brazil | 5 | 1960, 1970, 1985, 2000, 2015 |
| Mexico | 5 | 1965, 1970, 1980, 1995, 2010 |
| Sweden | 5 | 1965, 1975, 1985, 1995, 2010 |
| Russia | 5 | 1975, 1985, 1995, 2005, 2015 |
| Netherlands | 5 | 1965, 1975, 1990, 2005, 2020 |
| China | 4 | 1985, 1995, 2005, 2015 |
| Norway | 4 | 1970, 1985, 2000, 2015 |
| Nigeria | 4 | 1975, 1990, 2010, 2020 |
| South Africa | 4 | 1965, 1985, 2000, 2020 |

Chart data is sourced from official chart organizations (Billboard, Oricon, ARIA, OCC, etc.) and documented in [`SOURCES.md`](SOURCES.md).

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking
npm test             # Run tests
npm run test:ci      # Tests with coverage
```

### CI Pipeline

GitHub Actions runs on every push and PR to `main`:

1. **Lint** — ESLint with Next.js config
2. **Type Check** — `tsc --noEmit`
3. **Test** — Jest (unit tests + chart data integrity validation)
4. **Build** — Next.js production build (runs after lint/typecheck/test pass)

### Tests

Tests cover:
- **Utilities** — Country/region data, validation, formatting
- **Themes** — Decade color interpolation, CSS variable generation
- **Data layer** — Year navigation, metadata queries
- **Chart integrity** — Validates all 133 JSON chart files (correct schema, sequential ranks, metadata consistency)

### Spotify Integration

Charts are enriched with Spotify data: album art, track links, and 30-second previews (where available). For tracks without previews, the app shows a "Play on Spotify" button that opens the track externally.

To re-run enrichment or enrich new charts:

1. Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Copy `.env.local.example` to `.env.local` and add your Client ID and Secret
3. Run the enrichment script:

```bash
node scripts/generate-data.mjs            # all countries
node scripts/generate-data.mjs --country us  # single country
```

The script is idempotent — re-running skips already-enriched tracks. It includes retry with backoff for rate limits and fallback search for non-Latin titles.

## Adding Chart Data

Create `data/charts/{country}/{year}.json`:

```json
{
  "country": "us",
  "year": 2020,
  "context": "Cultural context blurb...",
  "tracks": [
    { "rank": 1, "title": "Song Title", "artist": "Artist Name" }
  ]
}
```

Then add the entry to `data/metadata.json` and update `SOURCES.md` with the data source.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, PlayerProvider)
│   ├── page.tsx                # Landing page (hero, country browser)
│   ├── globals.css             # Film grain, themes, animations
│   ├── [country]/[year]/       # Dynamic chart pages
│   └── api/spotify/token/      # Spotify token proxy
├── __tests__/                  # Test suite
├── components/
│   ├── CountryBrowser.tsx      # Regional country + chart browser
│   ├── TimeSelector.tsx        # Country dropdown + year timeline
│   ├── ChartList.tsx           # Top 10 track list
│   ├── TrackRow.tsx            # Track row with play button
│   ├── MiniPlayer.tsx          # Fixed bottom audio controls
│   ├── RandomButton.tsx        # Random era teleport
│   └── EraContext.tsx          # Cultural context blockquote
├── contexts/
│   └── PlayerContext.tsx       # Audio playback state
└── lib/
    ├── data.ts                 # Data loading + metadata queries
    ├── themes.ts               # Decade color themes + interpolation
    ├── spotify.ts              # Spotify API client
    └── utils.ts                # Countries, regions, helpers
data/
├── metadata.json               # Available (country, year) index
└── charts/{country}/{year}.json
```

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest](https://jestjs.io/) + [Testing Library](https://testing-library.com/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) (optional, client credentials flow)

## License

MIT
