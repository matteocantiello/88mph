#!/usr/bin/env node

/**
 * Spotify Data Enrichment Script
 *
 * Reads chart JSON files from data/charts/ and enriches them
 * with Spotify album art, preview URLs, URIs, and external links.
 *
 * Usage:
 *   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/generate-data.mjs
 *   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/generate-data.mjs --country us
 *
 * Features:
 *   - Retry with exponential backoff on 429 (rate limit) responses
 *   - Fallback search: tries plain query if structured query fails
 *   - Skips tracks already enriched (idempotent re-runs)
 *   - --country flag to enrich a single country
 *   - Progress tracking with counts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data", "charts");

// Load .env.local if it exists (no dotenv dependency needed)
const envPath = path.join(ROOT_DIR, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;
let lastRateLimitTime = 0;

// Parse --country flag
const countryFlag = (() => {
  const idx = process.argv.indexOf("--country");
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
})();

async function getToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET");
    process.exit(1);
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    console.error("Failed to get Spotify token:", res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  return data.access_token;
}

async function fetchWithRetry(url, options) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url, options);

    if (res.status === 429) {
      if (attempt === MAX_RETRIES - 1) {
        console.log(`    ✗ Rate limit exhausted after ${MAX_RETRIES} retries`);
        return null;
      }
      const retryAfter = res.headers.get("retry-after");
      const rawDelay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : BASE_DELAY_MS * Math.pow(2, attempt + 1);
      // Cap at 30s — Spotify sometimes returns absurd retry-after values
      const delayMs = Math.min(rawDelay, 30_000);
      lastRateLimitTime = Date.now();
      console.log(`    ⏳ Rate limited, waiting ${Math.round(delayMs / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }

    return res;
  }

  return null;
}

async function searchTrack(token, title, artist) {
  const headers = { Authorization: `Bearer ${token}` };

  // Strategy 1: Structured query (track:X artist:Y)
  const structuredQuery = encodeURIComponent(`track:${title} artist:${artist}`);
  let res = await fetchWithRetry(
    `https://api.spotify.com/v1/search?q=${structuredQuery}&type=track&limit=1`,
    { headers }
  );

  // If rate limit exhausted (null), don't try fallback — Spotify is rejecting us
  if (!res) return null;

  if (res.ok) {
    const data = await res.json();
    const track = data.tracks?.items?.[0];
    if (track) return track;
  }

  // Brief pause before fallback search
  await new Promise((r) => setTimeout(r, 500));

  // Strategy 2: Plain query (just "title artist") — helps with non-Latin scripts
  const plainQuery = encodeURIComponent(`${title} ${artist}`);
  res = await fetchWithRetry(
    `https://api.spotify.com/v1/search?q=${plainQuery}&type=track&limit=1`,
    { headers }
  );

  if (res && res.ok) {
    const data = await res.json();
    const track = data.tracks?.items?.[0];
    if (track) return track;
  }

  return null;
}

function extractTrackInfo(track) {
  return {
    spotifyUri: track.uri,
    previewUrl: track.preview_url || null,
    albumArt:
      track.album.images.find((i) => i.width === 300)?.url ||
      track.album.images[0]?.url ||
      null,
    spotifyUrl: track.external_urls?.spotify || null,
  };
}

async function main() {
  const token = await getToken();
  console.log("✓ Got Spotify token\n");

  const countries = fs.readdirSync(DATA_DIR).filter((f) => {
    if (!fs.statSync(path.join(DATA_DIR, f)).isDirectory()) return false;
    if (countryFlag) return f === countryFlag;
    return true;
  });

  if (countries.length === 0) {
    console.error(countryFlag ? `No chart directory found for country: ${countryFlag}` : "No chart directories found");
    process.exit(1);
  }

  let totalTracks = 0;
  let enrichedTracks = 0;
  let skippedTracks = 0;
  let failedTracks = 0;
  let totalFiles = 0;

  for (const country of countries) {
    const dir = path.join(DATA_DIR, country);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(dir, file);
      const chart = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      totalFiles++;
      console.log(`[${totalFiles}] ${country}/${file} (${chart.tracks.length} tracks)`);

      let modified = false;
      for (const track of chart.tracks) {
        totalTracks++;

        // Skip already-enriched tracks (idempotent)
        if (track.spotifyUri) {
          skippedTracks++;
          console.log(`  ${track.rank}. ${track.title} — ${track.artist} [skipped]`);
          continue;
        }

        console.log(`  ${track.rank}. ${track.title} — ${track.artist}`);
        const spotifyTrack = await searchTrack(token, track.title, track.artist);

        if (spotifyTrack) {
          const info = extractTrackInfo(spotifyTrack);
          track.albumArt = info.albumArt;
          track.previewUrl = info.previewUrl;
          track.spotifyUri = info.spotifyUri;
          track.spotifyUrl = info.spotifyUrl;
          enrichedTracks++;
          modified = true;
          const flags = [
            info.previewUrl ? "preview" : "no preview",
            info.albumArt ? "art" : "no art",
          ].join(", ");
          console.log(`    ✓ Found (${flags})`);
        } else {
          failedTracks++;
          console.log(`    ✗ Not found`);
        }

        // Adaptive delay: slow down if we've been rate-limited recently
        const recentlyLimited = Date.now() - lastRateLimitTime < 120_000;
        const delay = recentlyLimited ? 2000 : 500;
        await new Promise((r) => setTimeout(r, delay));
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(chart, null, 2) + "\n");
      }
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Done! Results:`);
  console.log(`  Files processed: ${totalFiles}`);
  console.log(`  Total tracks:    ${totalTracks}`);
  console.log(`  Enriched:        ${enrichedTracks}`);
  console.log(`  Skipped (already enriched): ${skippedTracks}`);
  console.log(`  Not found:       ${failedTracks}`);
}

main().catch(console.error);
