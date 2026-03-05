import { NextRequest, NextResponse } from "next/server";
import { getClientCredentialsToken } from "@/lib/spotify";
import { rateLimit } from "@/lib/rate-limit";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(`token:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
      return NextResponse.json({ access_token: cachedToken.token });
    }

    const data = await getClientCredentialsToken();
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };

    return NextResponse.json({ access_token: data.access_token });
  } catch {
    return NextResponse.json(
      { error: "Spotify credentials not configured" },
      { status: 503 }
    );
  }
}
