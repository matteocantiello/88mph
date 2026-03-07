#!/usr/bin/env node

/**
 * Spotify Enrichment Script
 *
 * Searches Spotify for chart tracks missing spotifyUri and adds:
 *   - spotifyUri
 *   - spotifyUrl
 *   - albumArt (if not already set)
 *
 * Uses client credentials flow (no user auth needed).
 * Preserves ALL existing fields (youtubeId, previewUrl, etc.).
 *
 * Usage:
 *   node scripts/enrich-spotify.mjs
 *   node scripts/enrich-spotify.mjs --country us
 *   node scripts/enrich-spotify.mjs --country us --year 2011
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data", "charts");

// Load .env.local
const envPath = path.join(ROOT_DIR, ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env.local");
  process.exit(1);
}

// Parse flags
const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const countryFlag = getFlag("country");
const yearFlag = getFlag("year");

// Files to skip entirely (old songs not on Spotify correctly)
const SKIP_FILES = new Set(["it/1947.json", "it/1950.json"]);

/** Get a client credentials access token */
async function getAccessToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token request failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/** Search Spotify for a track */
async function searchTrack(token, title, artist) {
  // Clean up artist string for better search results
  const cleanArtist = artist
    .replace(/\s*feat\.?\s*/gi, " ")
    .replace(/\s*ft\.?\s*/gi, " ")
    .replace(/\s*featuring\s*/gi, " ")
    .replace(/\s*&\s*/g, " ")
    .split(" ")
    .slice(0, 3) // Use first 3 words of artist to avoid over-specifying
    .join(" ");

  const query = `track:${title} artist:${cleanArtist}`;
  const url = `https://api.spotify.com/v1/search?${new URLSearchParams({
    q: query,
    type: "track",
    limit: "1",
  })}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "5", 10);
    console.log(`    [rate limited] waiting ${retryAfter}s...`);
    await sleep(retryAfter * 1000);
    return searchTrack(token, title, artist);
  }

  if (!res.ok) {
    const err = await res.text();
    console.log(`    [search error] ${res.status}: ${err}`);
    return null;
  }

  const data = await res.json();
  const tracks = data.tracks?.items;

  if (!tracks || tracks.length === 0) {
    // Fallback: simpler search without field prefixes
    const fallbackUrl = `https://api.spotify.com/v1/search?${new URLSearchParams({
      q: `${title} ${cleanArtist}`,
      type: "track",
      limit: "1",
    })}`;

    const fallbackRes = await fetch(fallbackUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!fallbackRes.ok) return null;
    const fallbackData = await fallbackRes.json();
    const fallbackTracks = fallbackData.tracks?.items;
    if (!fallbackTracks || fallbackTracks.length === 0) return null;
    return fallbackTracks[0];
  }

  return tracks[0];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("Spotify Enrichment Script");
  console.log("=".repeat(40));

  const token = await getAccessToken();
  console.log("Authenticated with client credentials\n");

  const countries = fs.readdirSync(DATA_DIR).filter((f) => {
    if (!fs.statSync(path.join(DATA_DIR, f)).isDirectory()) return false;
    if (countryFlag) return f === countryFlag;
    return true;
  });

  if (countries.length === 0) {
    console.error(
      countryFlag
        ? `No chart directory found for country: ${countryFlag}`
        : "No chart directories found"
    );
    process.exit(1);
  }

  let totalTracks = 0;
  let enrichedTracks = 0;
  let skippedTracks = 0;
  let failedTracks = 0;
  let totalFiles = 0;
  let modifiedFiles = 0;
  let skippedFiles = 0;

  for (const country of countries.sort()) {
    const dir = path.join(DATA_DIR, country);
    let files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

    if (yearFlag) {
      files = files.filter((f) => f === `${yearFlag}.json`);
      if (files.length === 0) continue;
    }

    for (const file of files.sort()) {
      const key = `${country}/${file}`;

      // Skip excluded files
      if (SKIP_FILES.has(key)) {
        skippedFiles++;
        console.log(`[skip] ${key} — excluded`);
        continue;
      }

      const filePath = path.join(dir, file);
      const chart = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      totalFiles++;

      // Check if any tracks need enrichment
      const needsEnrichment = chart.tracks.some((t) => !t.spotifyUri);
      if (!needsEnrichment) {
        console.log(`[skip] ${key} — all tracks have Spotify URIs`);
        continue;
      }

      console.log(`\n[${totalFiles}] ${key} (${chart.tracks.length} tracks)`);

      let modified = false;
      for (const track of chart.tracks) {
        totalTracks++;

        if (track.spotifyUri) {
          skippedTracks++;
          console.log(`  ${track.rank}. ${track.title} — ${track.artist} [has URI]`);
          continue;
        }

        console.log(`  ${track.rank}. ${track.title} — ${track.artist}`);
        const result = await searchTrack(token, track.title, track.artist);

        if (result) {
          track.spotifyUri = result.uri;
          track.spotifyUrl = result.external_urls.spotify;

          // Only set albumArt if not already set (preserve YouTube albumArt if present)
          if (!track.albumArt && result.album?.images?.length > 0) {
            // Pick the 300x300 image (index 1) or the first available
            const img = result.album.images.find((i) => i.width === 300) || result.album.images[0];
            track.albumArt = img.url;
          }

          enrichedTracks++;
          modified = true;
          console.log(`    -> ${result.uri}`);
        } else {
          failedTracks++;
          console.log(`    -> NOT FOUND`);
        }

        // Rate limit: 100ms between searches
        await sleep(100);
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(chart, null, 2) + "\n");
        modifiedFiles++;
      }
    }
  }

  console.log(`\n${"=".repeat(40)}`);
  console.log(`Done! Results:`);
  console.log(`  Files processed:  ${totalFiles}`);
  console.log(`  Files modified:   ${modifiedFiles}`);
  console.log(`  Files skipped:    ${skippedFiles}`);
  console.log(`  Tracks searched:  ${totalTracks}`);
  console.log(`  Tracks enriched:  ${enrichedTracks}`);
  console.log(`  Already had URI:  ${skippedTracks}`);
  console.log(`  Not found:        ${failedTracks}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
