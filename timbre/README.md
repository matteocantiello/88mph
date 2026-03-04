# 88mph — Musical Time Machine

A cinematic web app that lets you travel through decades of music. Select a country and year to discover the top 10 songs that defined an era.

## Features

- **8 Countries** — USA, UK, France, Germany, Brazil, Japan, Australia, Italy
- **52 Charts** — From 1940s big band swing to 2020s streaming era
- **Decade Color Themes** — Visual design shifts to match each era
- **30-Second Previews** — Play Spotify previews directly in the browser
- **Mini Player** — Fixed bottom bar with playback controls
- **Random Teleport** — Jump to a random era with a dramatic animation
- **Film Grain Overlay** — Cinematic texture over the entire app
- **Editorial Design** — Magazine-style typography with Instrument Serif + Outfit

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Charts

| Country | Years |
|---------|-------|
| USA | 1940, 1950, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020 |
| UK | 1955, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020 |
| France | 1965, 1980, 1995, 2010 |
| Germany | 1975, 1985, 1999, 2010 |
| Brazil | 1970, 1985, 2000, 2015 |
| Japan | 1975, 1985, 1995, 2005 |
| Australia | 1980, 1990, 2000, 2015 |
| Italy | 1965, 1985, 2000 |

## Spotify Integration (Optional)

The app works without Spotify credentials — tracks display without playback. To enable 30-second previews:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app and get your Client ID and Secret
3. Copy `.env.local.example` to `.env.local` and fill in credentials
4. Run the enrichment script to add album art and preview URLs:

```bash
SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/generate-data.mjs
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts + PlayerProvider
│   ├── page.tsx            # Landing page with featured era cards
│   ├── globals.css         # Film grain, themes, transitions
│   ├── [country]/[year]/   # Dynamic chart pages
│   └── api/spotify/token/  # Server-side Spotify token proxy
├── components/
│   ├── FeaturedCard.tsx    # Era preview card with top 5 songs
│   ├── TimeSelector.tsx    # Country toggle + year timeline
│   ├── ChartList.tsx       # Top 10 track list
│   ├── TrackRow.tsx        # Individual track with play button
│   ├── MiniPlayer.tsx      # Fixed bottom audio controls
│   ├── RandomButton.tsx    # Random era teleport
│   └── EraContext.tsx      # Cultural context blurb
├── contexts/
│   └── PlayerContext.tsx   # Audio playback state management
└── lib/
    ├── data.ts             # Data loading utilities
    ├── themes.ts           # Decade color themes + interpolation
    ├── spotify.ts          # Spotify API client
    └── utils.ts            # Helper functions

data/
├── metadata.json           # Available (country, year) index
└── charts/
    ├── us/*.json           # USA (16 charts, 1940–2020)
    ├── uk/*.json           # UK (13 charts, 1955–2020)
    ├── fr/*.json           # France (4 charts)
    ├── de/*.json           # Germany (4 charts)
    ├── br/*.json           # Brazil (4 charts)
    ├── jp/*.json           # Japan (4 charts)
    ├── au/*.json           # Australia (4 charts)
    └── it/*.json           # Italy (3 charts)
```

## Adding Data

Create a new JSON file in `data/charts/{country}/{year}.json`:

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

Then add the entry to `data/metadata.json` with `"available": true`.

## Deployment

Ready for Vercel:

```bash
npm run build
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Spotify Web API** (client credentials flow)
