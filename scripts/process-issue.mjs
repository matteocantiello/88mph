#!/usr/bin/env node

/**
 * process-issue.mjs — Chart Pipeline
 *
 * Two modes:
 *   1. CI triage (--validate-only): parse + validate + comment (no secrets needed)
 *   2. Local full pipeline (--issue <number>): validate, Claude, enrich, PR
 *
 * CI mode env vars: GITHUB_TOKEN, ISSUE_NUMBER, ISSUE_BODY, REPO_FULL_NAME
 * Local mode: uses `gh` CLI (already authenticated) + .env.local for API keys
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// ─── Constants ───────────────────────────────────────────────────────

const VALID_COUNTRIES = [
  "us", "uk", "fr", "de", "br", "jp", "au", "it", "in", "kr",
  "mx", "es", "se", "no", "nl", "ru", "cn", "ng", "za", "ca",
];

const COUNTRY_NAMES = {
  us: "United States", uk: "United Kingdom", fr: "France", de: "Germany",
  br: "Brazil", jp: "Japan", au: "Australia", it: "Italy", in: "India",
  kr: "South Korea", mx: "Mexico", es: "Spain", se: "Sweden", no: "Norway",
  nl: "Netherlands", ru: "Russia", cn: "China", ng: "Nigeria",
  za: "South Africa", ca: "Canada",
};

const MIN_YEAR = 1940;
const MAX_YEAR = 2026;
const CLAUDE_MODEL = "claude-sonnet-4-6-20250514";
const DATA_DIR = path.resolve("data/charts");
const METADATA_PATH = path.resolve("data/metadata.json");

// ─── CLI arg parsing ─────────────────────────────────────────────────

const args = process.argv.slice(2);
const VALIDATE_ONLY = args.includes("--validate-only");
const issueIdx = args.indexOf("--issue");
const LOCAL_ISSUE = issueIdx !== -1 ? parseInt(args[issueIdx + 1], 10) : null;
const LOCAL_MODE = LOCAL_ISSUE !== null;

if (!VALIDATE_ONLY && !LOCAL_MODE) {
  console.error("Usage:");
  console.error("  CI:    node scripts/process-issue.mjs --validate-only");
  console.error("  Local: node scripts/process-issue.mjs --issue <number>");
  process.exit(1);
}

// ─── Load .env.local for local mode ──────────────────────────────────

function loadEnvLocal() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

if (LOCAL_MODE) {
  loadEnvLocal();
}

// ─── GitHub API helpers ──────────────────────────────────────────────

function ghExec(cmd) {
  return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
}

// CI mode: use fetch with GITHUB_TOKEN env var
// Local mode: use `gh` CLI (already authenticated)

async function ghApiCall(endpoint, method = "GET", body = null) {
  // Resolve repo-relative endpoints (e.g. /issues/1) to full paths
  const repo = getRepo();
  const fullEndpoint = endpoint.startsWith("/repos/") || endpoint.startsWith("https://")
    ? endpoint
    : `/repos/${repo}${endpoint}`;

  if (LOCAL_MODE) {
    let cmd = `gh api "${fullEndpoint}" --method ${method}`;
    if (body) {
      cmd += ` --input -`;
      return JSON.parse(
        execSync(cmd, {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
          input: JSON.stringify(body),
        }).trim()
      );
    }
    return JSON.parse(ghExec(cmd));
  }

  // CI mode: raw fetch
  const { GITHUB_TOKEN } = process.env;
  const url = fullEndpoint.startsWith("https://")
    ? fullEndpoint
    : `https://api.github.com${fullEndpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

function getIssueNumber() {
  return LOCAL_MODE ? LOCAL_ISSUE : parseInt(process.env.ISSUE_NUMBER, 10);
}

async function commentOnIssue(body) {
  const num = getIssueNumber();
  await ghApiCall(`/issues/${num}/comments`, "POST", { body });
}

async function closeIssue() {
  const num = getIssueNumber();
  await ghApiCall(`/issues/${num}`, "PATCH", { state: "closed" });
}

async function addLabel(label) {
  const num = getIssueNumber();
  await ghApiCall(`/issues/${num}/labels`, "POST", { labels: [label] });
}

function getRepo() {
  if (process.env.REPO_FULL_NAME) return process.env.REPO_FULL_NAME;
  // Detect from git remote
  const remote = ghExec("git remote get-url origin");
  const m = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
  return m ? m[1] : "";
}

async function fetchIssueBody(issueNumber) {
  const data = await ghApiCall(`/repos/${getRepo()}/issues/${issueNumber}`);
  return data.body;
}

// ─── Issue parsing ───────────────────────────────────────────────────

function parseIssueBody(body) {
  const sections = {};
  const parts = body.split(/^### /m).filter(Boolean);
  for (const part of parts) {
    const newlineIdx = part.indexOf("\n");
    if (newlineIdx === -1) continue;
    const header = part.slice(0, newlineIdx).trim().toLowerCase();
    const value = part.slice(newlineIdx + 1).trim();
    sections[header] = value;
  }
  return sections;
}

function extractCountryCode(countryField) {
  const match = countryField.match(/\(([a-z]{2})\)/i);
  return match ? match[1].toLowerCase() : null;
}

function parseSongs(songsText) {
  const lines = songsText.split("\n").filter((l) => l.trim());
  const tracks = [];
  for (const line of lines) {
    const m = line.match(
      /^\s*(\d+)\.\s*"?([^"""\u201C\u201D-]+?)"?\s*[-\u2013\u2014]\s*(.+?)\s*$/
    );
    if (m) {
      tracks.push({
        rank: parseInt(m[1], 10),
        title: m[2].trim(),
        artist: m[3].trim(),
      });
    }
  }
  return tracks;
}

// ─── Validation ──────────────────────────────────────────────────────

function validateFields(sections) {
  const errors = [];

  const type = sections["type"] || "";
  if (!type) errors.push("Missing 'Type' field.");

  const countryField = sections["country"] || "";
  const code = extractCountryCode(countryField);
  if (!code) {
    errors.push(
      `Could not extract country code from: "${countryField}". Expected format: "Country Name (xx)".`
    );
  } else if (!VALID_COUNTRIES.includes(code)) {
    errors.push(
      `Country code "${code}" is not one of the 20 supported countries: ${VALID_COUNTRIES.join(", ")}.`
    );
  }

  const yearStr = (sections["year"] || "").trim();
  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) {
    errors.push(`Year "${yearStr}" is invalid. Must be between ${MIN_YEAR} and ${MAX_YEAR}.`);
  }

  const songsText = sections["top 10 songs"] || "";
  const tracks = parseSongs(songsText);
  if (tracks.length === 0) {
    errors.push("Could not parse any songs from the 'Top 10 Songs' field.");
  } else if (tracks.length < 5) {
    errors.push(`Only parsed ${tracks.length} songs. Expected at least 5 (ideally 10).`);
  }

  const source = (sections["source url"] || "").trim();
  if (!source) errors.push("Missing 'Source URL' field.");

  return { errors, code, year, tracks, type, source };
}

// ─── Claude API (local mode only) ────────────────────────────────────

async function callClaude(messages, tools, toolChoice) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set in .env.local");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages,
      tools,
      tool_choice: toolChoice,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API ${res.status}: ${text}`);
  }
  const data = await res.json();
  const toolBlock = data.content?.find((b) => b.type === "tool_use");
  if (!toolBlock) throw new Error("Claude did not return a tool_use block");
  return toolBlock.input;
}

async function validateWithClaude(tracks, country, year, source) {
  const tools = [
    {
      name: "validate_chart",
      description:
        "Validate whether the submitted chart data appears plausible for the given country and year.",
      input_schema: {
        type: "object",
        properties: {
          valid: {
            type: "boolean",
            description: "Whether the chart data appears plausible and valid",
          },
          reason: {
            type: "string",
            description: "Explanation of why the data is valid or invalid",
          },
          verified_tracks: {
            type: "array",
            description: "The tracks with any corrections applied",
            items: {
              type: "object",
              properties: {
                rank: { type: "number" },
                title: { type: "string" },
                artist: { type: "string" },
              },
              required: ["rank", "title", "artist"],
            },
          },
        },
        required: ["valid", "reason", "verified_tracks"],
      },
    },
  ];

  const countryName = COUNTRY_NAMES[country] || country;
  const trackList = tracks
    .map((t) => `${t.rank}. "${t.title}" - ${t.artist}`)
    .join("\n");

  return callClaude(
    [
      {
        role: "user",
        content: `You are validating a year-end chart submission for ${countryName} (${country}) in ${year}.

Source URL: ${source}

Submitted tracks:
${trackList}

Please validate:
1. Do these songs/artists seem plausible for ${countryName} in ${year}?
2. Are the artist names and song titles reasonably accurate (minor spelling differences are OK)?
3. Is the ranking plausible?

If valid, return the tracks as-is (or with minor spelling corrections). If clearly wrong (e.g., songs from the wrong decade, fictional artists), mark as invalid.`,
      },
    ],
    tools,
    { type: "tool", name: "validate_chart" }
  );
}

async function generateChartWithClaude(tracks, country, year, source, userContext) {
  const tools = [
    {
      name: "create_chart",
      description: "Create chart data with cultural context",
      input_schema: {
        type: "object",
        properties: {
          context: {
            type: "string",
            description:
              "2-3 sentence cultural context blurb about the music scene in this country/year",
          },
          tracks: {
            type: "array",
            description: "The final track list",
            items: {
              type: "object",
              properties: {
                rank: { type: "number" },
                title: { type: "string" },
                artist: { type: "string" },
              },
              required: ["rank", "title", "artist"],
            },
          },
        },
        required: ["context", "tracks"],
      },
    },
  ];

  const countryName = COUNTRY_NAMES[country] || country;
  const trackList = tracks
    .map((t) => `${t.rank}. "${t.title}" - ${t.artist}`)
    .join("\n");

  return callClaude(
    [
      {
        role: "user",
        content: `Create chart data for ${countryName} (${country}), year ${year}.

Source: ${source}
${userContext ? `User-provided context: ${userContext}` : ""}

Tracks:
${trackList}

Generate a 2-3 sentence cultural context blurb about the music scene in ${countryName} in ${year}. Reference major trends, genres, or cultural moments reflected in the chart. Be specific and informative.

Return the tracks exactly as provided (do not reorder or modify).`,
      },
    ],
    tools,
    { type: "tool", name: "create_chart" }
  );
}

// ─── Chart file operations ───────────────────────────────────────────

function chartExists(country, year) {
  return fs.existsSync(path.join(DATA_DIR, country, `${year}.json`));
}

function writeChart(country, year, context, tracks) {
  const dir = path.join(DATA_DIR, country);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const chart = { country, year, context, tracks };
  fs.writeFileSync(
    path.join(dir, `${year}.json`),
    JSON.stringify(chart, null, 2) + "\n"
  );
}

function updateMetadata(country, year) {
  const meta = JSON.parse(fs.readFileSync(METADATA_PATH, "utf-8"));
  const exists = meta.charts.some(
    (c) => c.country === country && c.year === year
  );
  if (!exists) {
    meta.charts.push({ country, year, available: true });
    meta.charts.sort((a, b) => {
      if (a.country < b.country) return -1;
      if (a.country > b.country) return 1;
      return a.year - b.year;
    });
    fs.writeFileSync(METADATA_PATH, JSON.stringify(meta, null, 2) + "\n");
  }
}

// ─── Enrichment steps (local mode only) ──────────────────────────────

function runEnrichment(label, command) {
  console.log(`\n--- ${label} ---`);
  try {
    execSync(command, { stdio: "inherit", timeout: 300_000 });
    console.log(`${label}: OK`);
    return true;
  } catch (err) {
    console.error(`${label}: FAILED - ${err.message}`);
    return false;
  }
}

// ─── Git + PR (local mode only) ──────────────────────────────────────

function gitExec(cmd) {
  return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
}

function createBranchAndPR(country, year, countryName, enrichmentNotes) {
  const issueNum = getIssueNumber();
  const branch = `chart/${country}-${year}`;

  gitExec(`git checkout -b ${branch}`);
  gitExec(`git add -A`);
  gitExec(
    `git commit -m "Add ${countryName} ${year} chart (closes #${issueNum})"`
  );
  gitExec(`git push -u origin ${branch}`);

  const body = [
    `## New Chart: ${countryName} ${year}`,
    "",
    `Closes #${issueNum}`,
    "",
    "### Changes",
    `- Added \`data/charts/${country}/${year}.json\``,
    "- Updated `data/metadata.json`",
    "",
    "### Enrichment Status",
    ...enrichmentNotes.map((n) => `- ${n}`),
    "",
    "---",
    "*Generated by the chart pipeline.*",
  ].join("\n");

  const prUrl = ghExec(
    `gh pr create --title "Add ${countryName} ${year} chart" --body "${body.replace(/"/g, '\\"')}"`
  );
  return prUrl;
}

// ─── Main: CI triage mode ────────────────────────────────────────────

async function runValidateOnly() {
  const issueNum = process.env.ISSUE_NUMBER;
  const issueBody = process.env.ISSUE_BODY;
  console.log(`Triaging issue #${issueNum}`);

  const sections = parseIssueBody(issueBody);
  console.log("Parsed sections:", Object.keys(sections).join(", "));

  // Route unsupported types
  const type = (sections["type"] || "").trim();
  if (type.toLowerCase().includes("new country")) {
    await commentOnIssue(
      "Thank you for suggesting a new country! New country additions require code changes and will be handled manually. Labeling for manual review."
    );
    await addLabel("manual-review");
    return;
  }
  if (type.toLowerCase().includes("correction")) {
    await commentOnIssue(
      "Thank you for the correction! Corrections require manual review to merge with existing data. Labeling for manual review."
    );
    await addLabel("manual-review");
    return;
  }

  // Validate fields
  const { errors, code, year, tracks } = validateFields(sections);
  if (errors.length > 0) {
    await commentOnIssue(
      `This submission has validation errors:\n\n${errors.map((e) => `- ${e}`).join("\n")}\n\nPlease fix these and open a new issue.`
    );
    await closeIssue();
    return;
  }

  // Check for duplicate
  if (chartExists(code, year)) {
    await commentOnIssue(
      `A chart for **${COUNTRY_NAMES[code]} ${year}** already exists. If you want to correct it, please open a new issue with type "Correction".`
    );
    await closeIssue();
    return;
  }

  // Valid submission
  const countryName = COUNTRY_NAMES[code];
  await commentOnIssue(
    `Submission validated:\n- **Chart:** ${countryName} ${year}\n- **Tracks:** ${tracks.length} parsed\n\nThis issue is ready for processing. A maintainer will run the pipeline locally to create a PR.`
  );
  await addLabel("validated");
  console.log(`Issue #${issueNum} validated: ${countryName} ${year}`);
}

// ─── Main: local full pipeline ───────────────────────────────────────

async function runLocalPipeline() {
  const issueNum = LOCAL_ISSUE;
  console.log(`Processing issue #${issueNum} locally`);

  // 1. Fetch issue body via gh CLI
  const issueBody = await fetchIssueBody(issueNum);
  const sections = parseIssueBody(issueBody);
  console.log("Parsed sections:", Object.keys(sections).join(", "));

  // 2. Route unsupported types
  const type = (sections["type"] || "").trim();
  if (type.toLowerCase().includes("new country")) {
    console.error("This is a 'New country' request — not supported by the automated pipeline.");
    process.exit(1);
  }
  if (type.toLowerCase().includes("correction")) {
    console.error("This is a 'Correction' request — not supported by the automated pipeline.");
    process.exit(1);
  }

  // 3. Validate fields
  const { errors, code, year, tracks, source } = validateFields(sections);
  if (errors.length > 0) {
    console.error("Validation errors:");
    errors.forEach((e) => console.error(`  - ${e}`));
    await commentOnIssue(
      `This submission has validation errors:\n\n${errors.map((e) => `- ${e}`).join("\n")}\n\nPlease fix these and open a new issue.`
    );
    await closeIssue();
    process.exit(1);
  }

  // 4. Check for duplicate
  if (chartExists(code, year)) {
    console.error(`Chart for ${COUNTRY_NAMES[code]} ${year} already exists.`);
    await commentOnIssue(
      `A chart for **${COUNTRY_NAMES[code]} ${year}** already exists.`
    );
    await closeIssue();
    process.exit(1);
  }

  const countryName = COUNTRY_NAMES[code];
  console.log(`\nProcessing: ${countryName} (${code}) ${year}, ${tracks.length} tracks`);

  // 5. Claude validation
  let verifiedTracks = tracks;
  try {
    console.log("\n--- Claude Validation ---");
    const validation = await validateWithClaude(tracks, code, year, source);
    if (!validation.valid) {
      console.error(`Validation failed: ${validation.reason}`);
      await commentOnIssue(
        `The chart data did not pass validation:\n\n> ${validation.reason}\n\nPlease verify your data against the source and resubmit.`
      );
      await closeIssue();
      process.exit(1);
    }
    console.log(`Validation passed: ${validation.reason}`);
    verifiedTracks = validation.verified_tracks || tracks;
  } catch (err) {
    console.error(`Claude validation error: ${err.message}`);
    console.error("Proceeding with unvalidated tracks.");
  }

  // 6. Generate context with Claude
  let context = "";
  let finalTracks = verifiedTracks;
  try {
    console.log("\n--- Claude Context Generation ---");
    const userContext = (sections["additional context"] || "").trim();
    const chartData = await generateChartWithClaude(
      verifiedTracks, code, year, source, userContext
    );
    context = chartData.context;
    finalTracks = chartData.tracks;
    console.log(`Context: ${context.slice(0, 120)}...`);
  } catch (err) {
    console.error(`Claude context generation failed: ${err.message}`);
  }

  // 7. Write chart JSON
  console.log("\n--- Writing Chart ---");
  writeChart(code, year, context, finalTracks);
  console.log(`Written: data/charts/${code}/${year}.json`);

  // 8. Update metadata
  console.log("\n--- Updating Metadata ---");
  updateMetadata(code, year);

  // 9. Enrichment pipeline
  const enrichmentNotes = [];

  const spotifyOk = runEnrichment(
    "Spotify Enrichment",
    `node scripts/generate-data.mjs --country ${code}`
  );
  enrichmentNotes.push(
    spotifyOk ? "Spotify: enriched" : "Spotify: skipped (error or missing credentials)"
  );

  const ytOk = runEnrichment(
    "YouTube Enrichment",
    `node scripts/enrich-youtube.mjs --country ${code} --year ${year}`
  );
  enrichmentNotes.push(
    ytOk ? "YouTube: enriched" : "YouTube: skipped (yt-dlp error)"
  );

  const artOk = runEnrichment(
    "Album Art Fallback",
    `node scripts/enrich-albumart-yt.mjs --country ${code}`
  );
  enrichmentNotes.push(
    artOk ? "Album art: filled gaps" : "Album art: skipped"
  );

  const promptOk = runEnrichment(
    "Postcard Prompt",
    `node scripts/postcards/generate-prompts.mjs --country ${code} --year ${year}`
  );
  enrichmentNotes.push(
    promptOk ? "Postcard prompt: generated" : "Postcard prompt: skipped"
  );

  const imgOk = runEnrichment(
    "Postcard Image",
    `node scripts/postcards/generate-images.mjs --country ${code} --year ${year} --model black-forest-labs/FLUX.1.1-pro --steps 20 --height 736`
  );
  enrichmentNotes.push(
    imgOk ? "Postcard image: generated" : "Postcard image: skipped"
  );

  // 10. Create branch and PR
  console.log("\n--- Creating PR ---");
  try {
    const prUrl = createBranchAndPR(code, year, countryName, enrichmentNotes);
    console.log(`\nPR created: ${prUrl}`);

    await commentOnIssue(
      `Chart processed! PR created:\n\n${prUrl}\n\n### Summary\n- **Chart:** ${countryName} ${year}\n- **Tracks:** ${finalTracks.length}\n\n### Enrichment\n${enrichmentNotes.map((n) => `- ${n}`).join("\n")}`
    );
  } catch (err) {
    console.error(`PR creation failed: ${err.message}`);
    console.log("\nChart data was written locally. You can commit and push manually.");
  }
}

// ─── Entry point ─────────────────────────────────────────────────────

if (VALIDATE_ONLY) {
  runValidateOnly().catch((err) => {
    console.error("Triage failed:", err);
    process.exit(1);
  });
} else {
  runLocalPipeline().catch((err) => {
    console.error("Pipeline failed:", err);
    process.exit(1);
  });
}
