# Spotify Preview Integration

## Tasks
- [x] Improve enrichment script (retry, fallback search, spotifyUrl, idempotent)
- [x] Add spotifyUrl to Track interface
- [x] Update TrackRow with "Play on Spotify" fallback
- [x] Run enrichment script — 60/133 charts enriched (au, br, cn, de, es, fr, in, us)
- [ ] Enrich remaining 73 charts (it, jp, kr, mx, ng, nl, no, ru, se, uk, za) — pending Spotify rate limit reset
- [x] Update chart integrity tests for Spotify fields
- [x] Verify tests pass (696/696) and build succeeds
- [x] Commit and push
- [x] Update SOURCES.md, README.md

## Notes
- Script reads credentials from `.env.local` automatically
- Run with: `node scripts/generate-data.mjs`
- Use `--country us` to test with a single country first
- Script is idempotent: re-running skips already-enriched tracks
- Spotify rate limit hit after ~600 tracks; retry with `node scripts/generate-data.mjs` later
