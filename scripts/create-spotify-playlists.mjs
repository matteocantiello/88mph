#!/usr/bin/env node

/**
 * Spotify Playlist Creator
 *
 * Creates public playlists on the 88mph Spotify account for all charts.
 * Saves playlist URLs back to chart JSON files.
 *
 * Prerequisites:
 *   - SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN in .env.local
 *
 * Usage:
 *   node scripts/create-spotify-playlists.mjs
 *   node scripts/create-spotify-playlists.mjs --country us
 *   node scripts/create-spotify-playlists.mjs --country us --year 2020
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data", "charts");
const POSTCARDS_DIR = path.join(ROOT_DIR, "public", "postcards");

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
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, or SPOTIFY_REFRESH_TOKEN in .env.local"
  );
  console.error("Run `node scripts/spotify-get-token.mjs` first to get a refresh token.");
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

// Country code → display name mapping
const COUNTRY_NAMES = {
  ar: "Argentina", au: "Australia", at: "Austria", br: "Brazil",
  ca: "Canada", cl: "Chile", cn: "China", co: "Colombia",
  cz: "Czech Republic", dk: "Denmark", eg: "Egypt", fi: "Finland",
  fr: "France", de: "Germany", gr: "Greece", hu: "Hungary",
  in: "India", id: "Indonesia", ie: "Ireland", il: "Israel",
  it: "Italy", jp: "Japan", kr: "South Korea", mx: "Mexico",
  nl: "Netherlands", nz: "New Zealand", ng: "Nigeria", no: "Norway",
  pk: "Pakistan", ph: "Philippines", pl: "Poland", pt: "Portugal",
  ro: "Romania", ru: "Russia", sa: "Saudi Arabia", za: "South Africa",
  es: "Spain", se: "Sweden", ch: "Switzerland", tw: "Taiwan",
  th: "Thailand", tr: "Turkey", ua: "Ukraine", ae: "UAE",
  gb: "United Kingdom", us: "United States", vn: "Vietnam",
};

function getCountryName(code) {
  return COUNTRY_NAMES[code] || code.toUpperCase();
}

/** Get a valid access token using the refresh token */
async function getAccessToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/** Get the Spotify user ID */
async function getUserId(token) {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to get user profile");
  const data = await res.json();
  return data.id;
}

/** Create a public playlist */
async function createPlaylist(token, userId, name, description) {
  const res = await fetch(`https://api.spotify.com/v1/me/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create playlist "${name}": ${err}`);
  }

  return res.json();
}

/** Add tracks to a playlist */
async function addTracks(token, playlistId, uris) {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to add tracks to playlist: ${err}`);
  }

  return res.json();
}

/** Upload a cover image to a playlist (base64 JPEG, max 256KB) */
async function uploadCoverImage(token, playlistId, country, year) {
  const postcardPath = path.join(POSTCARDS_DIR, `${country}_${year}.webp`);
  if (!fs.existsSync(postcardPath)) return false;

  try {
    // Convert WebP to JPEG, resize to square (Spotify requires square), compress to fit under 256KB
    const jpegBuffer = await sharp(postcardPath)
      .resize(640, 640, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Spotify limit is 256KB for base64-encoded image
    if (jpegBuffer.length > 180_000) {
      // Re-compress with lower quality
      const smallerBuffer = await sharp(postcardPath)
        .resize(640, 640, { fit: "cover" })
        .jpeg({ quality: 50 })
        .toBuffer();
      var base64 = smallerBuffer.toString("base64");
    } else {
      var base64 = jpegBuffer.toString("base64");
    }

    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "image/jpeg",
      },
      body: base64,
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`            [cover failed] ${err}`);
      return false;
    }

    return true;
  } catch (err) {
    console.log(`            [cover failed] ${err.message}`);
    return false;
  }
}

/** Sleep helper */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("Spotify Playlist Creator");
  console.log("=".repeat(40));

  const token = await getAccessToken();
  const userId = await getUserId(token);
  console.log(`Authenticated as: ${userId}\n`);

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

  let created = 0;
  let skipped = 0;
  let failed = 0;
  let noTracks = 0;
  let totalFiles = 0;

  for (const country of countries.sort()) {
    const dir = path.join(DATA_DIR, country);
    let files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

    if (yearFlag) {
      files = files.filter((f) => f === `${yearFlag}.json`);
      if (files.length === 0) continue;
    }

    for (const file of files.sort()) {
      const filePath = path.join(dir, file);
      const chart = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      totalFiles++;

      const year = parseInt(file.replace(".json", ""), 10);
      const countryName = getCountryName(country);

      // Skip if already has playlist URL
      if (chart.spotifyPlaylistUrl) {
        skipped++;
        console.log(`  [skip] ${country}/${file} — already has playlist`);
        continue;
      }

      // Collect Spotify URIs
      const uris = chart.tracks
        .filter((t) => t.spotifyUri)
        .map((t) => t.spotifyUri);

      if (uris.length === 0) {
        noTracks++;
        console.log(`  [skip] ${country}/${file} — no Spotify URIs`);
        continue;
      }

      const playlistName = `88mph: ${countryName} ${year}`;
      const description = `Top 10 songs from ${countryName} in ${year}. Explore more at 88mph.fm`;

      try {
        // Create playlist
        const playlist = await createPlaylist(token, userId, playlistName, description);
        await sleep(500);

        // Add tracks
        await addTracks(token, playlist.id, uris);
        await sleep(500);

        // Upload postcard as cover image
        const hasCover = await uploadCoverImage(token, playlist.id, country, year);
        if (hasCover) console.log(`            [cover uploaded]`);
        await sleep(500);

        // Save URL to chart JSON
        chart.spotifyPlaylistUrl = playlist.external_urls.spotify;
        fs.writeFileSync(filePath, JSON.stringify(chart, null, 2) + "\n");

        created++;
        console.log(
          `  [created] ${country}/${file} — ${playlistName} (${uris.length} tracks)`
        );
        console.log(`            ${playlist.external_urls.spotify}`);
      } catch (err) {
        failed++;
        console.error(`  [error] ${country}/${file} — ${err.message}`);
      }

      // Rate limit between API calls
      await sleep(1000);
    }
  }

  console.log(`\n${"=".repeat(40)}`);
  console.log(`Done!`);
  console.log(`  Files processed:  ${totalFiles}`);
  console.log(`  Playlists created: ${created}`);
  console.log(`  Skipped (exists):  ${skipped}`);
  console.log(`  Skipped (no URIs): ${noTracks}`);
  console.log(`  Failed:            ${failed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
