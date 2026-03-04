#!/usr/bin/env node

/**
 * Spotify Data Enrichment Script
 *
 * Reads seed JSON files from data/charts/ and enriches them
 * with Spotify album art, preview URLs, and URIs.
 *
 * Usage: SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/generate-data.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data", "charts");

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

  const data = await res.json();
  return data.access_token;
}

async function searchTrack(token, title, artist) {
  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const track = data.tracks?.items?.[0];
  if (!track) return null;

  return {
    spotifyUri: track.uri,
    previewUrl: track.preview_url,
    albumArt:
      track.album.images.find((i) => i.width === 300)?.url ||
      track.album.images[0]?.url,
  };
}

async function main() {
  const token = await getToken();
  console.log("Got Spotify token");

  const countries = fs.readdirSync(DATA_DIR).filter((f) => {
    return fs.statSync(path.join(DATA_DIR, f)).isDirectory();
  });

  for (const country of countries) {
    const dir = path.join(DATA_DIR, country);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(dir, file);
      const chart = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      console.log(`\nEnriching ${country}/${file}...`);

      for (const track of chart.tracks) {
        console.log(`  ${track.rank}. ${track.title} — ${track.artist}`);
        const info = await searchTrack(token, track.title, track.artist);
        if (info) {
          track.albumArt = info.albumArt;
          track.previewUrl = info.previewUrl;
          track.spotifyUri = info.spotifyUri;
          console.log(`    ✓ Found${info.previewUrl ? " (with preview)" : " (no preview)"}`);
        } else {
          console.log(`    ✗ Not found`);
        }
        // Rate limit
        await new Promise((r) => setTimeout(r, 100));
      }

      fs.writeFileSync(filePath, JSON.stringify(chart, null, 2) + "\n");
    }
  }

  console.log("\nDone! All chart files enriched.");
}

main().catch(console.error);
