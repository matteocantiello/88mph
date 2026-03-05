#!/usr/bin/env node

/**
 * YouTube Thumbnail Fallback for Album Art
 *
 * For tracks that have a youtubeId but no albumArt (after Spotify enrichment),
 * sets albumArt to the YouTube video thumbnail URL.
 *
 * No API key needed — YouTube thumbnail URLs are deterministic:
 *   https://img.youtube.com/vi/{videoId}/mqdefault.jpg  (320x180)
 *   https://img.youtube.com/vi/{videoId}/hqdefault.jpg  (480x360)
 *
 * Usage:
 *   node scripts/enrich-albumart-yt.mjs
 *   node scripts/enrich-albumart-yt.mjs --country uk
 *   node scripts/enrich-albumart-yt.mjs --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data", "charts");

const countryFlag = (() => {
  const idx = process.argv.indexOf("--country");
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
})();
const dryRun = process.argv.includes("--dry-run");

const countries = fs.readdirSync(DATA_DIR).filter((f) => {
  if (!fs.statSync(path.join(DATA_DIR, f)).isDirectory()) return false;
  if (countryFlag) return f === countryFlag;
  return true;
});

let filled = 0;
let skipped = 0;
let noYt = 0;

for (const country of countries) {
  const dir = path.join(DATA_DIR, country);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const chart = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    let modified = false;

    for (const track of chart.tracks) {
      if (track.albumArt) {
        skipped++;
        continue;
      }

      if (!track.youtubeId) {
        noYt++;
        continue;
      }

      // Use hqdefault (480x360) — good quality, always available
      const thumbUrl = `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`;
      if (!dryRun) {
        track.albumArt = thumbUrl;
        modified = true;
      }
      filled++;
      console.log(`  ${country}/${file} #${track.rank} ${track.title} — ${track.artist} → YT thumb`);
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(chart, null, 2) + "\n");
    }
  }
}

console.log(`\nDone!`);
console.log(`  Filled with YT thumbnails: ${filled}`);
console.log(`  Already had albumArt:       ${skipped}`);
console.log(`  No youtubeId available:     ${noYt}`);
if (dryRun) console.log(`  (dry run — no files modified)`);
