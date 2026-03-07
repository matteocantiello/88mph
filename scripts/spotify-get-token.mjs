#!/usr/bin/env node

/**
 * Spotify OAuth Token Helper
 *
 * One-time script to get a refresh token for the 88mph Spotify account.
 * Opens browser to authorize, captures callback, prints refresh token.
 *
 * Prerequisites:
 *   - SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local
 *
 * Usage:
 *   node scripts/spotify-get-token.mjs
 *
 * Save the printed refresh token as SPOTIFY_REFRESH_TOKEN in .env.local
 */

import http from "http";
import crypto from "crypto";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");

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

const PORT = 8765;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "playlist-modify-public ugc-image-upload";

// PKCE
const verifier = crypto.randomBytes(32).toString("base64url");
const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
const state = crypto.randomBytes(16).toString("hex");

const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("scope", SCOPES);
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("code_challenge_method", "S256");
authUrl.searchParams.set("code_challenge", challenge);

console.log("Starting local server on port", PORT);
console.log("Opening browser for Spotify authorization...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<h1>Authorization denied</h1><p>${error}</p>`);
    server.close();
    process.exit(1);
  }

  if (returnedState !== state) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h1>State mismatch</h1>");
    server.close();
    process.exit(1);
  }

  // Exchange code for tokens
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token exchange failed: ${err}`);
    }

    const tokens = await tokenRes.json();

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Success!</h1><p>You can close this tab. Check your terminal.</p>");

    console.log("=".repeat(50));
    console.log("Authorization successful!");
    console.log("=".repeat(50));
    console.log("\nAdd this to your .env.local:\n");
    console.log(`SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`\nUser ID can be found by running:`);
    console.log(`curl -H "Authorization: Bearer ${tokens.access_token}" https://api.spotify.com/v1/me | jq .id`);
    console.log();
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(`<h1>Error</h1><p>${err.message}</p>`);
    console.error(err);
  }

  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  // Open browser
  try {
    execSync(`open "${authUrl.toString()}"`);
  } catch {
    console.log("Could not open browser automatically.");
    console.log("Open this URL manually:\n");
    console.log(authUrl.toString());
  }
});
