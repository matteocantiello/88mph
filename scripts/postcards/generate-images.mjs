#!/usr/bin/env node

/**
 * Generate Postcard Images via Together AI (FLUX)
 *
 * Reads prompts from data/postcard-prompts.jsonl and generates images
 * using Together AI's FLUX models. Saves images to public/postcards/.
 *
 * Prerequisites:
 *   TOGETHER_API_KEY in .env.local or environment
 *
 * Usage:
 *   node scripts/postcards/generate-images.mjs
 *   node scripts/postcards/generate-images.mjs --country us
 *   node scripts/postcards/generate-images.mjs --country us --year 1985
 *   node scripts/postcards/generate-images.mjs --model black-forest-labs/FLUX.1.1-pro
 *   node scripts/postcards/generate-images.mjs --dry-run
 *   node scripts/postcards/generate-images.mjs --force        # regenerate existing
 *   node scripts/postcards/generate-images.mjs --width 1280 --height 720
 *   node scripts/postcards/generate-images.mjs --steps 20
 *   node scripts/postcards/generate-images.mjs --seed 42      # reproducible output
 *   node scripts/postcards/generate-images.mjs --prefix "vintage travel postcard, "
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const PROMPTS_FILE = path.join(ROOT, "data", "postcard-prompts.jsonl");
const OUTPUT_DIR = path.join(ROOT, "public", "postcards");

// ---------------------------------------------------------------------------
// Parse flags
// ---------------------------------------------------------------------------
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
const dryRun = hasFlag("dry-run");
const force = hasFlag("force");
const seedFlag = getFlag("seed");

const MODEL = getFlag("model") || "black-forest-labs/FLUX.1-schnell";
const WIDTH = parseInt(getFlag("width") || "1280", 10);
const HEIGHT = parseInt(getFlag("height") || "720", 10);
const STEPS = parseInt(getFlag("steps") || "4", 10);
const PREFIX = getFlag("prefix") || "";
const DELAY_MS = parseInt(getFlag("delay") || "1000", 10);

// ---------------------------------------------------------------------------
// Load API key from .env.local or environment
// ---------------------------------------------------------------------------
function loadApiKey() {
  if (process.env.TOGETHER_API_KEY) return process.env.TOGETHER_API_KEY;

  const envFile = path.join(ROOT, ".env.local");
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
      const match = line.match(/^TOGETHER_API_KEY=(.+)$/);
      if (match) return match[1].trim();
    }
  }
  return null;
}

const API_KEY = loadApiKey();
if (!API_KEY && !dryRun) {
  console.error("TOGETHER_API_KEY not found. Set it in .env.local or environment.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load prompts
// ---------------------------------------------------------------------------
if (!fs.existsSync(PROMPTS_FILE)) {
  console.error(`Prompts file not found: ${PROMPTS_FILE}`);
  console.error("Run: node scripts/postcards/generate-prompts.mjs");
  process.exit(1);
}

let prompts = fs
  .readFileSync(PROMPTS_FILE, "utf-8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

if (countryFlag) prompts = prompts.filter((p) => p.country === countryFlag);
if (yearFlag) prompts = prompts.filter((p) => p.year === parseInt(yearFlag, 10));

if (prompts.length === 0) {
  console.error("No matching prompts found.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Generate images
// ---------------------------------------------------------------------------
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateImage(entry) {
  const filename = `${entry.country}_${entry.year}.webp`;
  const filepath = path.join(OUTPUT_DIR, filename);

  if (!force && fs.existsSync(filepath)) {
    return { status: "skipped", filename };
  }

  const fullPrompt = PREFIX + entry.prompt;

  if (dryRun) {
    console.log(`  [dry-run] ${filename}`);
    console.log(`    Model: ${MODEL}`);
    console.log(`    Size:  ${WIDTH}x${HEIGHT}, steps: ${STEPS}`);
    console.log(`    Prompt: ${fullPrompt.slice(0, 120)}...`);
    return { status: "dry-run", filename };
  }

  const body = {
    model: MODEL,
    prompt: fullPrompt,
    width: WIDTH,
    height: HEIGHT,
    steps: STEPS,
    n: 1,
    response_format: "base64",
  };
  if (seedFlag) body.seed = parseInt(seedFlag, 10);

  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { status: "error", filename, error: `${res.status}: ${err}` };
  }

  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    // Check if URL-based response
    const url = data.data?.[0]?.url;
    if (url) {
      const imgRes = await fetch(url);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(filepath, buf);
      return { status: "ok", filename };
    }
    return { status: "error", filename, error: "No image data in response" };
  }

  fs.writeFileSync(filepath, Buffer.from(b64, "base64"));
  return { status: "ok", filename };
}

async function main() {
  console.log("Postcard Image Generator");
  console.log("========================");
  console.log(`Model:   ${MODEL}`);
  console.log(`Size:    ${WIDTH}x${HEIGHT}`);
  console.log(`Steps:   ${STEPS}`);
  console.log(`Output:  ${OUTPUT_DIR}`);
  console.log(`Entries: ${prompts.length}`);
  if (PREFIX) console.log(`Prefix:  "${PREFIX}"`);
  if (dryRun) console.log(`Mode:    DRY RUN`);
  console.log();

  let ok = 0, skipped = 0, errors = 0;

  for (let i = 0; i < prompts.length; i++) {
    const entry = prompts[i];
    const label = `[${i + 1}/${prompts.length}] ${entry.country}/${entry.year}`;
    process.stdout.write(`${label} ... `);

    const result = await generateImage(entry);

    switch (result.status) {
      case "ok":
        console.log(`ok → ${result.filename}`);
        ok++;
        break;
      case "skipped":
        console.log("skipped (exists)");
        skipped++;
        break;
      case "dry-run":
        skipped++;
        break;
      case "error":
        console.log(`ERROR: ${result.error}`);
        errors++;
        break;
    }

    // Rate-limit delay between API calls
    if (result.status === "ok" && i < prompts.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log("\n========================");
  console.log(`Done! Generated: ${ok}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
