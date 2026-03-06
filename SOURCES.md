# Chart Data Sources

This document tracks all sources used to compile the music chart data in 88mph. It must be updated whenever new chart data is added or existing data is revised.

## Official Chart Organizations

| Source | Countries | URL | Notes |
|--------|-----------|-----|-------|
| Billboard Hot 100 | US | https://en.wikipedia.org/wiki/Billboard_Year-End | Year-end singles charts; 2010–2025 via Billboard Year-End Hot 100 Wikipedia pages (e.g. https://en.wikipedia.org/wiki/Billboard_Year-End_Hot_100_singles_of_2010) |
| Official Charts Company (OCC) | UK | https://www.officialcharts.com/ | UK Singles Chart year-end data |
| NME Chart | UK (1952) | https://en.wikipedia.org/wiki/NME_Chart | First UK singles chart, established Nov 14, 1952 |
| Hit Parade Italia | IT | https://www.hitparadeitalia.it/hp_yends/ | Official Italian year-end singles charts (primary source for all Italian data) |
| Oricon | JP | https://en.wikipedia.org/wiki/Oricon | Japanese year-end singles charts (from 1968) |
| GfK / Musikmarkt | DE | https://en.wikipedia.org/wiki/GfK_Entertainment_charts | German official charts (from ~1954) |
| Offizielle Deutsche Charts | DE | https://www.offiziellecharts.de/ | Modern German chart data |
| Chartsurfer | DE | https://www.chartsurfer.de/ | Historical German chart archive |
| SNEP / IFOP | FR | https://en.wikipedia.org/wiki/SNEP | French official charts |
| ARIA Charts | AU | https://en.wikipedia.org/wiki/ARIA_Charts | Australian charts (from 1988) |
| Kent Music Report | AU | https://en.wikipedia.org/wiki/Kent_Music_Report | Australian charts (pre-1988) |
| Gaon / Circle Chart | KR | https://en.wikipedia.org/wiki/Circle_Chart | Korean year-end charts (from 2010) |
| PROMUSICAE | ES | https://en.wikipedia.org/wiki/Productores_de_M%C3%BAsica_de_Espa%C3%B1a | Spanish official charts |
| Los 40 Principales | ES | https://los40.com/ | Spanish radio chart |
| Sverigetopplistan | SE | https://en.wikipedia.org/wiki/Sverigetopplistan | Swedish official charts (from 1975) |
| Kvällstoppen | SE | https://en.wikipedia.org/wiki/Kv%C3%A4llstoppen | Swedish chart (1962–1975) |
| VG-lista | NO | https://en.wikipedia.org/wiki/VG-lista | Norwegian official charts |
| Dutch Top 40 | NL | https://www.top40.nl/ | Netherlands official chart |
| Monitor Latino | MX | https://monitorlatino.com/ | Mexican music chart |
| Notitas Musicales | MX | — | Historical Mexican chart publication |
| Billboard Mexico | MX | — | Mexican Billboard charts |
| RPM Magazine | CA | https://en.wikipedia.org/wiki/RPM_(magazine) | Canada's primary music trade publication (1964–2000); year-end singles charts |
| Billboard Canadian Hot 100 | CA | https://en.wikipedia.org/wiki/Canadian_Hot_100 | Canadian singles chart (from 2007); year-end data |

## Awards & Radio Data

| Source | Countries | Notes |
|--------|-----------|-------|
| Pesnya Goda (Song of the Year) | RU | Soviet/Russian annual music festival (primary source for USSR-era data) |
| Zolotoy Grammofon | RU | Russian music awards (from 1996) |
| TopHit Radio Charts | RU | Modern Russian radio airplay data |
| KBS Music Awards | KR | Korean broadcast music awards (historical K-pop data) |

## Specialized Archives & Databases

| Source | Countries | URL | Notes |
|--------|-----------|-----|-------|
| hindigeetmala.net | IN | https://www.hindigeetmala.net/ | Bollywood film songs database |
| Binaca Geetmala | IN | https://en.wikipedia.org/wiki/Binaca_Geetmala | Indian radio countdown show (1952–1994), primary source for pre-1994 Indian charts |
| NamuWiki | KR | https://namu.wiki/ | Korean wiki with detailed historical K-pop chart data |

## Enrichment Sources

| Source | Data Provided | URL | Notes |
|--------|---------------|-----|-------|
| Spotify Web API | Album art, track URIs, 30-second previews, external links | https://developer.spotify.com/documentation/web-api | Used via client credentials flow; enrichment script in `scripts/generate-data.mjs` |

## General Reference

| Source | Countries | URL | Notes |
|--------|-----------|-----|-------|
| Wikipedia | All | https://en.wikipedia.org/ | Year-end chart compilations, cultural context, music history |
| QQ Music | CN | https://y.qq.com/ | Chinese streaming platform (reference for modern Chinese charts) |
| Springbok Radio | ZA | — | Historical South African radio charts (apartheid era) |

## Coverage by Country

| Country | Code | Charts | Years | Primary Source(s) |
|---------|------|--------|-------|-------------------|
| United States | us | 29 | 1940–2025 | Billboard Hot 100 (Year-End Hot 100) |
| United Kingdom | uk | 16 | 1952–2025 | NME (1952), OCC |
| Italy | it | 17 | 1947–2025 | hitparadeitalia.it |
| Germany | de | 14 | 1955–2025 | GfK/Musikmarkt, chartsurfer.de, Offizielle Deutsche Charts |
| Spain | es | 11 | 1965–2025 | Los 40 Principales, PROMUSICAE |
| India | in | 12 | 1955–2025 | Binaca Geetmala, hindigeetmala.net |
| France | fr | 11 | 1955–2025 | SNEP/IFOP |
| Japan | jp | 11 | 1968–2025 | Oricon, Billboard Japan |
| Australia | au | 10 | 1960–2025 | Kent Music Report, ARIA |
| South Korea | kr | 8 | 1980–2025 | KBS Awards, Gaon/Circle Chart |
| Brazil | br | 9 | 1960–2025 | Wikipedia, Brazilian music charts |
| Mexico | mx | 10 | 1965–2025 | Notitas Musicales, Monitor Latino, Billboard Mexico |
| Sweden | se | 10 | 1965–2025 | Kvällstoppen, Sverigetopplistan |
| Russia | ru | 9 | 1975–2025 | Pesnya Goda, TopHit, Zolotoy Grammofon |
| Netherlands | nl | 9 | 1965–2025 | Dutch Top 40 |
| China | cn | 8 | 1985–2025 | Cultural significance, QQ Music |
| Norway | no | 8 | 1970–2025 | VG-lista |
| Nigeria | ng | 8 | 1975–2025 | TurnTable, cultural significance (Afrobeat/Afrobeats documentation) |
| South Africa | za | 8 | 1965–2025 | Springbok Radio, cultural significance |
| Canada | ca | 12 | 1970–2025 | RPM Magazine (1970–2000), Billboard Canadian Hot 100 (2005–2025) |

**Total: 230 charts across 20 countries (1940–2025)**

## Notes

- Pre-digital era charts (before ~1990) rely heavily on radio play data, physical sales reports, and cultural significance rankings rather than precise streaming metrics.
- For countries without formal chart infrastructure in certain eras (Soviet Russia, pre-2000 Nigeria, apartheid-era South Africa, pre-2000 China), data is compiled from award shows, festival data, retrospective rankings, and cultural documentation.
- Italian charts were verified directly against hitparadeitalia.it official year-end data; existing charts for 1965, 1985, and 2000 matched the official source exactly.
- Indian pre-1994 data uses Binaca Geetmala (later Cibaca Geetmala) annual countdown rankings, the most authoritative source for that era.
- Spotify enrichment adds `albumArt`, `spotifyUri`, `spotifyUrl`, and `previewUrl` (when available) to each track. Preview URLs may be null due to Spotify's late-2024 policy changes restricting 30-second previews; in those cases, the app offers a "Play on Spotify" external link instead.
