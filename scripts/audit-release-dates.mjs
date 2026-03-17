#!/usr/bin/env node

/**
 * Chart Data Audit Script — Spotify Release Date Verification
 *
 * For each chart track with a spotifyUri, fetches the album release date
 * from the Spotify API and flags tracks where the release year differs
 * from the chart year by more than ±2 years.
 *
 * Uses a local cache (data/spotify-release-cache.json) to avoid refetching.
 *
 * Usage:
 *   node scripts/audit-release-dates.mjs
 *   node scripts/audit-release-dates.mjs --country il
 *   node scripts/audit-release-dates.mjs --country il --year 2005
 *   node scripts/audit-release-dates.mjs --threshold 1   (stricter: ±1 year)
 *   node scripts/audit-release-dates.mjs --offline        (use cache only, no API calls)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data", "charts");
const REPORT_PATH = path.join(ROOT_DIR, "data", "audit-report.json");
const CACHE_PATH = path.join(ROOT_DIR, "data", "spotify-release-cache.json");

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

// Parse flags
const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}
function hasFlag(name) {
  return args.includes(`--${name}`);
}

const countryFlag = getFlag("country");
const yearFlag = getFlag("year");
const threshold = parseInt(getFlag("threshold") || "2", 10);
const offlineMode = hasFlag("offline");

if (!offlineMode && (!CLIENT_ID || !CLIENT_SECRET)) {
  console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env.local");
  console.error("Use --offline to run with cache only");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Load/save cache
function loadCache() {
  if (fs.existsSync(CACHE_PATH)) {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
}

/** Get a client credentials access token */
async function getAccessToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token request failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/** Fetch track release date using search endpoint (more reliable rate limits) */
async function getTrackReleaseDate(token, title, artist, retries = 0) {
  const cleanArtist = artist
    .replace(/\s*feat\.?\s*/gi, " ")
    .replace(/\s*ft\.?\s*/gi, " ")
    .replace(/\s*featuring\s*/gi, " ")
    .replace(/\s*&\s*/g, " ")
    .split(" ")
    .slice(0, 3)
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
    if (retries >= 3) return "RATE_LIMITED";
    const retryAfter = Math.min(parseInt(res.headers.get("Retry-After") || "5", 10), 30);
    console.log(`  [rate limited] waiting ${retryAfter}s...`);
    await sleep(retryAfter * 1000);
    return getTrackReleaseDate(token, title, artist, retries + 1);
  }

  if (!res.ok) return null;

  const data = await res.json();
  const track = data.tracks?.items?.[0];
  if (!track) return null;

  return {
    releaseDate: track.album?.release_date || null,
    releasePrecision: track.album?.release_date_precision || null,
    matchedTitle: track.name,
    matchedArtist: track.artists?.[0]?.name,
  };
}

/** Extract track ID from spotify:track:XXXXX URI */
function extractTrackId(uri) {
  if (!uri) return null;
  const match = uri.match(/spotify:track:(\w+)/);
  return match ? match[1] : null;
}

/** Extract year from Spotify release_date (YYYY, YYYY-MM, or YYYY-MM-DD) */
function extractYear(releaseDate) {
  if (!releaseDate) return null;
  const match = releaseDate.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

async function main() {
  console.log("Chart Data Audit — Spotify Release Date Verification");
  console.log("=".repeat(55));
  console.log(`Threshold: ±${threshold} years`);
  if (offlineMode) console.log("Mode: OFFLINE (cache only)");
  console.log();

  // Load cache
  const cache = loadCache();
  const cachedCount = Object.keys(cache).length;
  if (cachedCount > 0) {
    console.log(`Loaded ${cachedCount} cached release dates`);
  }

  // Collect all charts
  const countries = fs.readdirSync(DATA_DIR).filter((f) => {
    if (!fs.statSync(path.join(DATA_DIR, f)).isDirectory()) return false;
    if (countryFlag) return f === countryFlag;
    return true;
  }).sort();

  // First pass: collect all tracks across all charts
  const allCharts = [];
  const trackInfoMap = new Map(); // trackId -> {title, artist}

  for (const country of countries) {
    const dir = path.join(DATA_DIR, country);
    let files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    if (yearFlag) files = files.filter((f) => f === `${yearFlag}.json`);

    for (const file of files.sort()) {
      const filePath = path.join(dir, file);
      const chart = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const chartKey = `${country}/${chart.year}`;

      const trackEntries = [];
      for (const track of chart.tracks) {
        const trackId = extractTrackId(track.spotifyUri);
        const entry = {
          rank: track.rank,
          title: track.title,
          artist: track.artist,
          spotifyUri: track.spotifyUri,
          trackId,
        };
        trackEntries.push(entry);
        if (trackId && !trackInfoMap.has(trackId)) {
          trackInfoMap.set(trackId, { title: track.title, artist: track.artist });
        }
      }

      allCharts.push({
        country,
        year: chart.year,
        key: chartKey,
        tracks: trackEntries,
      });
    }
  }

  // Determine which tracks need fetching
  const allTrackIds = [...trackInfoMap.keys()];
  const uncached = allTrackIds.filter((id) => !cache[id]);
  console.log(`${allCharts.length} charts, ${allTrackIds.length} unique tracks, ${uncached.length} need fetching`);

  if (uncached.length > 0 && !offlineMode) {
    const token = await getAccessToken();
    console.log("Authenticated with Spotify\n");
    console.log(`Fetching ${uncached.length} tracks via search API...`);

    let fetched = 0;
    let consecutiveRateLimits = 0;

    for (const trackId of uncached) {
      const info = trackInfoMap.get(trackId);
      const data = await getTrackReleaseDate(token, info.title, info.artist);

      if (data === "RATE_LIMITED") {
        consecutiveRateLimits++;
        if (consecutiveRateLimits >= 3) {
          console.log(`\nPersistent rate limiting. Saving cache and continuing with what we have.`);
          break;
        }
        continue;
      }

      consecutiveRateLimits = 0;

      if (data) {
        cache[trackId] = {
          releaseDate: data.releaseDate,
          releasePrecision: data.releasePrecision,
        };
      } else {
        cache[trackId] = { releaseDate: null, releasePrecision: null };
      }

      fetched++;
      if (fetched % 50 === 0) {
        console.log(`  ${fetched}/${uncached.length} fetched`);
        saveCache(cache); // Save periodically
      }
      await sleep(200);
    }

    console.log(`  ${fetched}/${uncached.length} fetched`);
    saveCache(cache);
    console.log("Cache saved\n");
  } else if (uncached.length > 0 && offlineMode) {
    console.log(`Skipping ${uncached.length} uncached tracks (offline mode)\n`);
  } else {
    console.log("All tracks cached, no API calls needed\n");
  }

  // Analyze each chart
  const report = [];
  let totalFlagged = 0;
  let totalTracks = 0;
  let totalNoSpotify = 0;
  let totalNoCached = 0;

  for (const chart of allCharts) {
    const flaggedTracks = [];

    for (const track of chart.tracks) {
      totalTracks++;

      if (!track.trackId) {
        totalNoSpotify++;
        continue;
      }

      const cached = cache[track.trackId];
      if (!cached || !cached.releaseDate) {
        totalNoCached++;
        continue;
      }

      const releaseYear = extractYear(cached.releaseDate);
      if (releaseYear === null) continue;

      const delta = releaseYear - chart.year;

      if (Math.abs(delta) > threshold) {
        flaggedTracks.push({
          rank: track.rank,
          title: track.title,
          artist: track.artist,
          chartYear: chart.year,
          releaseDate: cached.releaseDate,
          releasePrecision: cached.releasePrecision,
          releaseYear,
          delta,
        });
        totalFlagged++;
      }
    }

    if (flaggedTracks.length > 0) {
      const severity =
        flaggedTracks.length >= 5 ? "CRITICAL" :
        flaggedTracks.length >= 3 ? "SERIOUS" :
        flaggedTracks.length >= 1 ? "MINOR" : "OK";

      report.push({
        chart: chart.key,
        country: chart.country,
        year: chart.year,
        totalTracks: chart.tracks.length,
        flaggedCount: flaggedTracks.length,
        severity,
        flaggedTracks,
      });
    }
  }

  // Sort by severity (most flagged first)
  report.sort((a, b) => b.flaggedCount - a.flaggedCount);

  // Print report
  console.log("=".repeat(55));
  console.log("AUDIT REPORT");
  console.log("=".repeat(55));

  if (report.length === 0) {
    console.log("\nNo issues found! All tracks are within the release date threshold.\n");
  } else {
    for (const entry of report) {
      console.log(`\n${entry.chart}: ${entry.flaggedCount}/${entry.totalTracks} flagged (${entry.severity})`);
      for (const t of entry.flaggedTracks) {
        const sign = t.delta > 0 ? "+" : "";
        console.log(`  #${t.rank} "${t.title}" — ${t.artist} | chart:${t.chartYear}, released:${t.releaseYear} (Δ${sign}${t.delta})`);
      }
    }
  }

  console.log(`\n${"=".repeat(55)}`);
  console.log(`SUMMARY`);
  console.log(`  Charts scanned:    ${allCharts.length}`);
  console.log(`  Charts flagged:    ${report.length}`);
  console.log(`  Tracks scanned:    ${totalTracks}`);
  console.log(`  Tracks flagged:    ${totalFlagged}`);
  console.log(`  No Spotify URI:    ${totalNoSpotify}`);
  console.log(`  No cached data:    ${totalNoCached}`);
  console.log(`  Threshold:         ±${threshold} years`);

  const critical = report.filter((r) => r.severity === "CRITICAL");
  const serious = report.filter((r) => r.severity === "SERIOUS");
  const minor = report.filter((r) => r.severity === "MINOR");

  if (critical.length) console.log(`  CRITICAL charts:   ${critical.map((r) => r.chart).join(", ")}`);
  if (serious.length) console.log(`  SERIOUS charts:    ${serious.map((r) => r.chart).join(", ")}`);
  if (minor.length) console.log(`  MINOR charts:      ${minor.map((r) => r.chart).join(", ")}`);

  // Save JSON report
  const jsonReport = {
    generatedAt: new Date().toISOString(),
    threshold,
    summary: {
      chartsScanned: allCharts.length,
      chartsFlagged: report.length,
      tracksScanned: totalTracks,
      tracksFlagged: totalFlagged,
      noSpotifyUri: totalNoSpotify,
      noCachedData: totalNoCached,
    },
    charts: report,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(jsonReport, null, 2) + "\n");
  console.log(`\nFull report saved to: data/audit-report.json`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
