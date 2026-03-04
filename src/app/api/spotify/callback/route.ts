import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode, encryptTokens } from "@/lib/spotify-auth";

function sanitizeReturnTo(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/";
  }
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  const cookieStore = cookies();
  const oauthCookie = cookieStore.get("spotify_oauth");

  if (error || !code || !oauthCookie) {
    const returnTo = oauthCookie
      ? sanitizeReturnTo(JSON.parse(oauthCookie.value).returnTo)
      : "/";
    return NextResponse.redirect(
      new URL(`${returnTo}?spotify=error&reason=auth_failed`, request.url)
    );
  }

  let parsed: { verifier: string; returnTo: string; state: string };
  try {
    parsed = JSON.parse(oauthCookie.value);
  } catch {
    return NextResponse.redirect(
      new URL(`/?spotify=error&reason=auth_failed`, request.url)
    );
  }

  const returnTo = sanitizeReturnTo(parsed.returnTo);
  const { verifier, state: savedState } = parsed;

  // Verify state to prevent CSRF
  if (state !== savedState) {
    return NextResponse.redirect(
      new URL(`${returnTo}?spotify=error&reason=auth_failed`, request.url)
    );
  }

  try {
    const tokens = await exchangeCode(code, verifier);

    const encrypted = encryptTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    // Build redirect response and set cookies on it directly
    const redirectUrl = new URL(`${returnTo}?spotify=connected`, request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set token cookie on the response
    response.cookies.set("spotify_tokens", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Delete oauth cookie
    response.cookies.delete("spotify_oauth");

    return response;
  } catch (err) {
    console.error("Spotify callback error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.redirect(
      new URL(`${returnTo}?spotify=error&reason=auth_failed`, request.url)
    );
  }
}
