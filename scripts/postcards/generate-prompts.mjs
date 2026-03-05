#!/usr/bin/env node

/**
 * Generate Postcard Image Prompts
 *
 * Reads chart context descriptions from data/charts/ and generates
 * diffusion-model-optimized image prompts for each country/year entry.
 *
 * Output: data/postcard-prompts.jsonl (one JSON object per line)
 *
 * This script uses a local template approach — no LLM API call needed.
 * For custom/improved prompts, edit data/postcard-prompts.jsonl directly
 * or feed data/chart-contexts.txt to an LLM of your choice.
 *
 * Usage:
 *   node scripts/postcards/generate-prompts.mjs
 *   node scripts/postcards/generate-prompts.mjs --country us
 *   node scripts/postcards/generate-prompts.mjs --country us --year 1985
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const CHARTS_DIR = path.join(ROOT, "data", "charts");
const PROMPTS_FILE = path.join(ROOT, "data", "postcard-prompts.jsonl");

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const countryFlag = getFlag("country");
const yearFlag = getFlag("year");

// Load existing prompts to preserve hand-edited ones
const existing = new Map();
if (fs.existsSync(PROMPTS_FILE)) {
  for (const line of fs.readFileSync(PROMPTS_FILE, "utf-8").split("\n").filter(Boolean)) {
    try {
      const obj = JSON.parse(line);
      existing.set(`${obj.country}/${obj.year}`, obj);
    } catch { /* skip malformed */ }
  }
}

const countries = fs.readdirSync(CHARTS_DIR).filter((f) => {
  if (!fs.statSync(path.join(CHARTS_DIR, f)).isDirectory()) return false;
  if (countryFlag) return f === countryFlag;
  return true;
}).sort();

let added = 0;
let skipped = 0;

for (const country of countries) {
  const dir = path.join(CHARTS_DIR, country);
  let files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  if (yearFlag) files = files.filter((f) => f === `${yearFlag}.json`);

  for (const file of files) {
    const chart = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    const key = `${country}/${chart.year}`;

    if (existing.has(key)) {
      skipped++;
      continue;
    }

    // Generate a basic prompt from context (can be improved with LLM)
    const ctx = chart.context || `${country} ${chart.year} music scene`;
    const prompt = `Vintage postcard illustration of ${country.toUpperCase()} in ${chart.year}. ${ctx}. Artistic postcard style, rich colors, evocative atmosphere, nostalgic mood, detailed illustration.`;

    existing.set(key, { country, year: chart.year, prompt });
    added++;
  }
}

// Write all prompts sorted by country/year
const sorted = [...existing.values()].sort(
  (a, b) => a.country.localeCompare(b.country) || a.year - b.year
);
fs.writeFileSync(PROMPTS_FILE, sorted.map((o) => JSON.stringify(o)).join("\n") + "\n");

console.log(`Prompts file: ${PROMPTS_FILE}`);
console.log(`  Total: ${sorted.length}`);
console.log(`  Added: ${added}`);
console.log(`  Kept existing: ${skipped}`);
