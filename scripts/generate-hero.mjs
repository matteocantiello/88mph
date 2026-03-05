#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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
if (!API_KEY) { console.error("Missing TOGETHER_API_KEY"); process.exit(1); }

const prompts = [
  // V1: DeLorean driving into a giant vinyl portal
  `No text, no words, no letters, no writing. Hyper-detailed cinematic widescreen shot: a polished silver DeLorean DMC-12 time machine with glowing flux capacitor, doors open like wings, speeding directly into an enormous spinning vinyl record that serves as a glowing time portal. The vinyl grooves emit swirling rings of amber and electric blue light. Sonic shockwave ripples radiate outward from the point of entry. The vinyl label at the center glows white-hot. Musical notes and sound waves distort through the time-warp energy field around the car. Dark atmospheric background with deep indigo sky, neon light trails, and scattered vinyl records floating in the turbulence. Photorealistic, dramatic lighting, shallow depth of field, 1980s retro-futuristic sci-fi aesthetic.`,
  // V2: DeLorean on vinyl grooves
  `No text, no words, no letters, no writing. Hyper-detailed cinematic widescreen: a silver DeLorean DMC-12 with glowing blue undercarriage and flux capacitor racing along the spiral grooves of a massive vinyl record that stretches to the horizon like a road. The needle arm of a turntable towers in the background like a skyscraper. Amber and cyan light trails stream behind the car. Musical energy pulses ripple outward from the tires along the grooves. The dark sky is filled with floating translucent vinyl discs and swirling sound waves rendered as luminous ribbons. Atmospheric fog, dramatic volumetric lighting, photorealistic detail, retro-futuristic 1980s neon aesthetic.`,
];

const MODEL = process.argv.includes("--flux2")
  ? "black-forest-labs/FLUX.2-pro"
  : "black-forest-labs/FLUX.1.1-pro";
const STEPS = process.argv.includes("--flux2") ? 28 : 20;

console.log(`Model: ${MODEL}, Steps: ${STEPS}\n`);

// Only generate variant 1
for (let i = 0; i < 1; i++) {
  const prompt = prompts[i];
  console.log(`--- Variant ${i + 1} ---`);
  console.log("Prompt:", prompt.slice(0, 80) + "...");
  console.log("Generating...");

  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      width: 1280,
      height: 736,
      steps: STEPS,
      n: 1,
      response_format: "b64_json",
    }),
  });

  if (!res.ok) {
    console.error("API error:", res.status, await res.text());
    continue;
  }

  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const buf = Buffer.from(b64, "base64");
  const outPath = path.join(ROOT, "public", `hero-v${i + 1}.webp`);
  fs.writeFileSync(outPath, buf);
  console.log(`Saved: ${outPath} (${(buf.length / 1024).toFixed(0)} KB)\n`);

  // Brief delay between calls
  if (i < prompts.length - 1) await new Promise(r => setTimeout(r, 1000));
}
