import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { generatePKCE, getAuthorizationUrl } from "@/lib/spotify-auth";

function sanitizeReturnTo(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/";
  }
  return value;
}

export async function GET(request: NextRequest) {
  const returnTo = sanitizeReturnTo(
    request.nextUrl.searchParams.get("returnTo") || "/"
  );

  const { verifier, challenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString("hex");

  const url = getAuthorizationUrl(state, challenge);
  const response = NextResponse.redirect(url);

  // Store verifier + returnTo + state in a short-lived cookie on the response
  response.cookies.set(
    "spotify_oauth",
    JSON.stringify({ verifier, returnTo, state }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    }
  );

  return response;
}
