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

### Prompt #15 — Expand Italian Charts from Official Source (hitparadeitalia.it)

> For italian charts, here's the official italian resource. Please extract from here: https://www.hitparadeitalia.it//hp_yends/

**Key decisions**: Use official hitparadeitalia.it year-end singles charts as the authoritative source for Italian data. Verified existing 3 charts (1965, 1985, 2000) match official data. Added 5 new years (1975, 1990, 1995, 2010, 2020).
**Artifacts produced**: 5 new Italian chart files (it/1975, 1990, 1995, 2010, 2020), updated metadata.json (71 total charts), updated README.md

### Prompt #16 — Expand All Countries with Older Historical Charts

> Great. It would be good to go as far back in time as charts are available. Could you look at older charts for all the countries we have?

**Key decisions**: Research the earliest available chart data for all 12 countries and add historical charts going as far back as possible.
**Artifacts to produce**: New historical chart JSON files for all countries, updated metadata.json and README.md

### Prompt #17 — Fetch Italian Charts from hitparadeitalia.it (1947, 1950, 1955, 1960)

> Research and extract the top 10 year-end singles from hitparadeitalia.it for the following years: 1947, 1950, 1955, 1960. For each year, fetch the URL https://www.hitparadeitalia.it/hp_yends/hpe{YEAR}.htm and extract the top 10 songs with title and artist. Provide top 10 songs (rank, title, artist), cultural context blurb, country code: it.

**Key decisions**: Fetch directly from hitparadeitalia.it official source
**Artifacts to produce**: Compiled Italian chart data for 4 early years

### Prompt #18 — Research Top 10 Songs for UK (1952, 1960), Australia (1960, 1970), France (1955, 1960)

> Research the top 10 most popular songs for UK 1952 (NME chart), UK 1960, Australia 1960 (Kent Music Report), Australia 1970 (Kent Music Report), France 1955, France 1960. Use Wikipedia, web searches, chart archives. Provide top 10 songs, cultural context blurbs, and country codes.

**Key decisions**: Systematic web research using Wikipedia, NME chart archives, Kent Music Report, and French chart sources
**Artifacts to produce**: Compiled chart research for 6 country/year combinations

### Prompt #19 — Research Top 10 Songs for India (1955, 1960, 1965), Brazil (1960), Mexico (1965, 1970), Spain (1965), South Korea (1980)

> Research the top 10 most popular songs for: India 1955/1960/1965 (Binaca Geetmala), Brazil 1960, Mexico 1965/1970, Spain 1965, South Korea 1980. Use Wikipedia, web searches, hindigeetmala.net for India. Provide top 10 songs, cultural context, country codes.

**Key decisions**: Systematic web research using multiple sources per country/year
**Artifacts to produce**: Compiled chart research for 8 country/year combinations

### Prompt #20 — Research Top 10 Songs for Germany (1955, 1960, 1965) and Japan (1968, 1970)

> Research the top 10 most popular songs for Germany (1955, 1960, 1965) and Japan (1968, 1970). Use Wikipedia, web searches, and chart archives. Germany: Musikmarkt/GfK charts (started ~1954). Japan: Oricon (started 1968). Provide top 10 songs (rank, title, artist), cultural context, country codes (de, jp). Use romanized titles for Japanese songs.

**Key decisions**: Web research using multiple sources for German Schlager and early Oricon charts
**Artifacts to produce**: Compiled chart research for 5 country/year combinations

### Prompt #21 — Major Global Expansion: Europe, Africa, Asia, Russia, China

> What about spain, scandinavian countries, germany, other major european countries, african countries and other asian countries? What about russia and china?

**Key decisions**: Expand to new countries with verifiable chart data. Add Scandinavia (Sweden, Norway), Netherlands, Russia, China, Nigeria, South Africa, plus fill gaps in existing countries (Spain, Germany).
**Artifacts produced**: 39 new chart JSON files (se/5, no/4, nl/5, ru/5, cn/4, ng/4, za/4, es/4 gap-fills, de/4 gap-fills), updated utils.ts (19 countries), metadata.json (133 entries), README.md

### Prompt #22 — Landing Page Redesign

> (via /frontend-design skill) Charts are not shown (it would be good to expose the chart with song title and artist). The layout is dismal and not very enticing. Let's work on it.

**Key decisions**: Editorial hero layout with spotlight chart cards, regional country browser (Americas/Europe/Asia/Eurasia/Africa), dropdown country picker for chart pages.
**Artifacts produced**: New CountryBrowser.tsx component, rewritten page.tsx, updated TimeSelector.tsx with dropdown, updated utils.ts (REGIONS), updated globals.css

### Prompt #23 — Create sources.md and Update CLAUDE.md

> Let's add to a source.md file the links used to extract all the charts used by 88mph. We should add to claude.md that this file should be updated everytime new charts data is ingested

**Key decisions**: Create 88mph/SOURCES.md documenting all chart data sources. Add mandatory rule to CLAUDE.md requiring SOURCES.md updates on data ingestion.
**Artifacts produced**: 88mph/SOURCES.md, updated CLAUDE.md
