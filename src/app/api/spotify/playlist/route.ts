import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/spotify-auth";

const TRACK_URI_PATTERN = /^spotify:track:[a-zA-Z0-9]{22}$/;
const MAX_TRACKS = 50;
const MAX_COUNTRY_NAME_LENGTH = 100;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export async function POST(request: NextRequest) {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated with Spotify" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { countryName, year, trackUris } = body;

    // Validate countryName
    if (typeof countryName !== "string" || countryName.length === 0 || countryName.length > MAX_COUNTRY_NAME_LENGTH) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Validate year
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum) || yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Validate trackUris
    if (!Array.isArray(trackUris) || trackUris.length === 0 || trackUris.length > MAX_TRACKS) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    for (const uri of trackUris) {
      if (typeof uri !== "string" || !TRACK_URI_PATTERN.test(uri)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
    }

    // Get user ID
    const meRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meRes.ok) {
      console.error("Spotify /me failed:", meRes.status, await meRes.text());
      return NextResponse.json({ error: "Failed to create playlist" }, { status: 502 });
    }

    const me = await meRes.json();

    // Create playlist
    const createRes = await fetch(
      `https://api.spotify.com/v1/users/${me.id}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `88mph: ${countryName} ${yearNum}`,
          description: `Top 10 songs from ${countryName} in ${yearNum} — curated by 88mph`,
          public: false,
        }),
      }
    );

    if (!createRes.ok) {
      console.error("Spotify create playlist failed:", createRes.status, await createRes.text());
      return NextResponse.json({ error: "Failed to create playlist" }, { status: 502 });
    }

    const playlist = await createRes.json();

    // Add tracks
    const addRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: trackUris }),
      }
    );

    if (!addRes.ok) {
      console.error("Spotify add tracks failed:", addRes.status, await addRes.text());
      return NextResponse.json({ error: "Failed to create playlist" }, { status: 502 });
    }

    return NextResponse.json({
      playlistUrl: playlist.external_urls.spotify,
      playlistUri: playlist.uri,
    });
  } catch (err) {
    console.error("Playlist route error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
  }
}
