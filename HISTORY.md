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

### Prompt #7 — Rename Directory from timbre to 88mph

> can we change the name of the directory from timbre to 88mph?

**Artifacts modified**: git mv timbre/ 88mph/

### Prompt #8 — Expand to India, South Korea, Mexico, Spain

> How do we find more countries and years charts? Like we have almost nothing in asia (india, china etc.) [...] Let's do all of them

**Key decisions**: Add India (Binaca Geetmala + Bollywood), South Korea (Gaon/K-pop), Mexico (Latin charts), Spain (PROMUSICAE). Research via Wikipedia and web sources.
**Artifacts to produce**: New chart JSONs for 4 countries, updated metadata.json, updated utils.ts

### Prompt #6 — Research Top 10 Songs for 6 Countries Across Multiple Years

> Research the top 10 songs for France (1965, 1980, 1995, 2010), Germany (1975, 1985, 1999, 2010), Brazil (1970, 1985, 2000, 2015), Japan (1975, 1985, 1995, 2005), Australia (1980, 1990, 2000, 2015), Italy (1965, 1985, 2000). Use Wikipedia and web searches. For each country+year: top 10 songs with title and artist, 2-3 sentence cultural context blurb, country code.

**Key decisions**: Systematic web research using Wikipedia year-end charts and music history sources
**Artifacts to produce**: Compiled research findings for all country/year combinations

### Prompt #10 — Research Top 10 Songs in India (1970, 1985, 1995, 2010)

> Research the top 10 most popular songs in India for 1970, 1985, 1995, 2010. For 1970 and 1985, search for "Binaca Geetmala" annual rankings. For 1995, search for Binaca Geetmala 1995 or popular Bollywood songs of 1995. For 2010, search for top Bollywood songs / Indian music charts 2010. Format: title by Artist (from Film Name). Include cultural context blurbs.

**Key decisions**: Use Binaca Geetmala as primary source for pre-1994 years, Bollywood charts for later years
**Artifacts to produce**: Compiled India chart research for 4 years

### Prompt #11 — Research Top 10 Songs in Mexico (1980, 1995, 2010)

> Research the top 10 most popular songs in Mexico for 1980, 1995, 2010. Search for Billboard Mexico, Monitor Latino, Mexican music charts, Wikipedia lists. Include both Spanish and English-language hits popular in Mexico. For each year: top 10 songs with title and artist, 2-3 sentence cultural context blurb, country code: mx.

**Key decisions**: Web research using multiple chart sources for Mexican music history
**Artifacts to produce**: Compiled Mexico chart research for 3 years

### Prompt #12 — Research Top 10 Songs in South Korea (1990, 2000, 2010, 2020)

> Research the top 10 most popular songs in South Korea for 1990, 2000, 2010, 2020. Search for Korean popular music charts, Gaon chart year-end data, KBS music chart, K-pop top songs, Wikipedia lists. For 1990/2000 look at emerging K-pop era (Seo Taiji, HOT, Sechs Kies, BoA). For 2010/2020 use Gaon/Circle chart data. Provide top 10 with romanized titles/artists and cultural context.

**Key decisions**: Web research using multiple chart sources per era
**Artifacts to produce**: Top 10 lists for 4 years with cultural context

### Prompt #13 — Research Top 10 Songs in Spain (1975, 1990, 2005)

> Research the top 10 most popular songs in Spain for 1975, 1990, 2005. Search for PROMUSICAE, Afydep (pre-1990s), and Wikipedia Spanish chart pages. Cultural context: 1975 = late Franco era, 1990 = movida aftermath / Euro-pop, 2005 = Spanish pop + reggaeton arrival. Country code: es.

**Key decisions**: Web research across multiple chart sources for Spanish music history
**Artifacts to produce**: Compiled Spain chart research for 3 years

### Prompt #14 — Create Chart JSON Files for India, South Korea, Mexico, Spain

> (Continuation from context recovery) Create all 14 chart JSON files from research, update metadata.json and utils.ts, build and verify.

**Key decisions**: Created chart data for all 4 new countries based on research (Binaca Geetmala for India, K-pop/Gaon for South Korea, Latin charts for Mexico, PROMUSICAE/Los 40 for Spain)
**Artifacts produced**: 14 new JSON chart files (in/1970,1985,1995,2010 + kr/1990,2000,2010,2020 + mx/1980,1995,2010 + es/1975,1990,2005), updated metadata.json (66 total charts), updated utils.ts (12 countries)
