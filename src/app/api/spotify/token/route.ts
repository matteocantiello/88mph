import { NextResponse } from "next/server";
import { getClientCredentialsToken } from "@/lib/spotify";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function GET() {
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
