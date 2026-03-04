# Project History Log

## 2026-03-04

### Prompt #1 — Initial Project Setup: "Timbre" Musical Time Machine

> Build a web app called "Timbre" — a musical time machine that lets users select a country and year, then displays and plays the top 10 songs from that era. Start with USA and UK, 1930–2026. Next.js 14 App Router, Tailwind CSS, Spotify Web API for 30-second previews, static JSON data layer. Features: country/year selector with timeline scrubber, chart display pages, mini player, random era teleport button, decade-based color themes, film grain overlay, cinematic editorial design. Seed data for USA (1940, 1955, 1965, 1975, 1985, 1995, 2005, 2015) and UK (1965, 1985, 2000).

**Key decisions**: Tech stack (Next.js 14, Tailwind, Spotify API), data strategy (static JSON + enrichment script), design direction (cinematic/editorial, decade color themes)

**Artifacts to produce**: Full Next.js app with all components, data files, Spotify integration, scripts, README

### Prompt #2 — Full Implementation of Timbre Plan

> Implement the following plan: [Full 8-step implementation plan for Timbre app covering scaffold, data layer, Spotify integration, UI components, pages, audio playback, visual polish, and documentation]

**Key decisions**: Executing full plan as specified
**Artifacts produced**: Complete Next.js app

### Prompt #3 — Frontend Design Overhaul

> Charts are not shown (it would be good to expose the chart with song title and artist). The layout is dismal and not very enticing. Let's work on it. (via /frontend-design skill)

**Key decisions**: Vinyl record store meets editorial magazine aesthetic. Landing page shows featured era cards with visible song lists. Fonts: Instrument Serif + Outfit. Dramatic staggered card grid. Chart page gets editorial treatment with pull-quote context blurbs.
**Artifacts modified**: globals.css, layout.tsx, page.tsx, [country]/[year]/page.tsx, TimeSelector, TrackRow, ChartList, EraContext, tailwind.config, + new FeaturedCard component

### Prompt #4 — Rename Platform to 88mph

> Let's also change the name of the platform to 88mph

**Key decisions**: Global rename from "Timbre" to "88mph" across all UI text, metadata, and references
**Artifacts modified**: layout.tsx, page.tsx, [country]/[year]/page.tsx, MiniPlayer footer reference, README.md

### Prompt #5 — Expand Chart Database

> This looks great. Now we need to expand the database. Let's search for more charts from more countries and years. Look into repos, wikipedia etc

**Key decisions**: Research historical music charts from Wikipedia, GitHub repos, and other sources. Expand beyond US/UK to more countries and fill in missing decades.
**Artifacts to produce**: New JSON chart files + updated metadata.json

### Prompt #6 — Update Docs, Commit and Push

> lets' update docs, commit and push

**Artifacts modified**: README.md, then git commit + push

### Prompt #6 — Research Top 10 Songs for 6 Countries Across Multiple Years

> Research the top 10 songs for France (1965, 1980, 1995, 2010), Germany (1975, 1985, 1999, 2010), Brazil (1970, 1985, 2000, 2015), Japan (1975, 1985, 1995, 2005), Australia (1980, 1990, 2000, 2015), Italy (1965, 1985, 2000). Use Wikipedia and web searches. For each country+year: top 10 songs with title and artist, 2-3 sentence cultural context blurb, country code.

**Key decisions**: Systematic web research using Wikipedia year-end charts and music history sources
**Artifacts to produce**: Compiled research findings for all country/year combinations
