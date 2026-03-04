import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/spotify-auth";

export async function GET() {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const res = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await res.json();
    return NextResponse.json({
      authenticated: true,
      displayName: user.display_name,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
