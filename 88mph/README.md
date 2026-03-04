# 88mph — Musical Time Machine

A cinematic web app that lets you travel through decades of music. Select a country and year to discover the top 10 songs that defined an era.

## Features

- **19 Countries** — USA, UK, France, Germany, Brazil, Japan, Australia, Italy, India, South Korea, Mexico, Spain, Sweden, Norway, Netherlands, Russia, China, Nigeria, South Africa
- **133 Charts** — From 1940 pre-war USA to 2020s global streaming era
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

| Country | Charts | Years |
|---------|--------|-------|
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
    ├── uk/*.json           # UK (15 charts, 1952–2020)
    ├── it/*.json           # Italy (12 charts, 1947–2020)
    ├── de/*.json           # Germany (11 charts, 1955–2020)
    ├── es/*.json           # Spain (8 charts, 1965–2015)
    ├── in/*.json           # India (7 charts, 1955–2010)
    ├── fr/*.json           # France (6 charts, 1955–2010)
    ├── jp/*.json           # Japan (6 charts, 1968–2005)
    ├── au/*.json           # Australia (6 charts, 1960–2015)
    ├── kr/*.json           # South Korea (5 charts, 1980–2020)
    ├── br/*.json           # Brazil (5 charts, 1960–2015)
    ├── mx/*.json           # Mexico (5 charts, 1965–2010)
    ├── se/*.json           # Sweden (5 charts, 1965–2010)
    ├── ru/*.json           # Russia (5 charts, 1975–2015)
    ├── nl/*.json           # Netherlands (5 charts, 1965–2020)
    ├── cn/*.json           # China (4 charts, 1985–2015)
    ├── no/*.json           # Norway (4 charts, 1970–2015)
    ├── ng/*.json           # Nigeria (4 charts, 1975–2020)
    └── za/*.json           # South Africa (4 charts, 1965–2020)
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
