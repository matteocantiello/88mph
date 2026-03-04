import { cookies } from "next/headers";
import crypto from "crypto";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SCOPES = "playlist-modify-public playlist-modify-private";

function getRedirectUri() {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/callback`;
}

function getCookieSecret(): Buffer {
  const secret = process.env.SPOTIFY_COOKIE_SECRET;
  if (!secret || secret.length !== 64) {
    throw new Error("SPOTIFY_COOKIE_SECRET must be a 64-char hex string (32 bytes)");
  }
  return Buffer.from(secret, "hex");
}

// --- PKCE helpers ---

export function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

// --- OAuth URLs ---

export function getAuthorizationUrl(state: string, challenge: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

// --- Token exchange ---

export async function exchangeCode(
  code: string,
  verifier: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }
  return res.json();
}

export async function refreshUserToken(
  refreshToken: string
): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }
  return res.json();
}

// --- Cookie encryption (AES-256-GCM) ---

interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export function encryptTokens(payload: TokenPayload): string {
  const key = getCookieSecret();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // iv (12) + tag (16) + ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptTokens(encoded: string): TokenPayload | null {
  try {
    const key = getCookieSecret();
    const buf = Buffer.from(encoded, "base64url");

    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8"));
  } catch {
    return null;
  }
}

// --- Cookie helpers ---

export function getSpotifyTokens(): TokenPayload | null {
  const cookieStore = cookies();
  const cookie = cookieStore.get("spotify_tokens");
  if (!cookie) return null;
  return decryptTokens(cookie.value);
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = getSpotifyTokens();
  if (!tokens) return null;

  // Token still valid (with 60s buffer)
  if (Date.now() < tokens.expiresAt - 60_000) {
    return tokens.accessToken;
  }

  // Refresh
  try {
    const fresh = await refreshUserToken(tokens.refreshToken);
    const newPayload: TokenPayload = {
      accessToken: fresh.access_token,
      refreshToken: fresh.refresh_token ?? tokens.refreshToken,
      expiresAt: Date.now() + fresh.expires_in * 1000,
    };

    // Note: can't reliably set cookies during refresh in Next.js 14 route handlers.
    // The token will be refreshed again on next request if needed.

    return newPayload.accessToken;
  } catch {
    return null;
  }
}
