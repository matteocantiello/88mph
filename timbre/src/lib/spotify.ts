interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrackResult {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number }[] };
  uri: string;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export async function getClientCredentialsToken(): Promise<SpotifyToken> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("Failed to get Spotify token");
  return res.json();
}

export async function searchTrack(
  token: string,
  title: string,
  artist: string
): Promise<SpotifyTrackResult | null> {
  const query = encodeURIComponent(`track:${title} artist:${artist}`);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.tracks?.items?.[0] ?? null;
}

export function extractTrackInfo(track: SpotifyTrackResult) {
  return {
    spotifyUri: track.uri,
    previewUrl: track.preview_url,
    albumArt:
      track.album.images.find((i) => i.width === 300)?.url ??
      track.album.images[0]?.url,
    spotifyUrl: track.external_urls.spotify,
  };
}
