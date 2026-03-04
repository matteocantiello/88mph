# Spotify Preview Integration

## Tasks
- [x] Improve enrichment script (retry, fallback search, spotifyUrl, idempotent)
- [x] Add spotifyUrl to Track interface
- [x] Update TrackRow with "Play on Spotify" fallback
- [ ] Run enrichment script on all 133 charts (requires Spotify credentials)
- [x] Update chart integrity tests for Spotify fields
- [x] Verify tests pass (696/696) and build succeeds
- [ ] Commit and push

## Notes
- Enrichment script requires `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` env vars
- Run with: `SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/generate-data.mjs`
- Use `--country us` to test with a single country first
- Script is idempotent: re-running skips already-enriched tracks
