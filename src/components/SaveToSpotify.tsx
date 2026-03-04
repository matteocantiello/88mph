"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface SaveToSpotifyProps {
  country: string;
  countryName: string;
  year: number;
  trackUris: string[];
}

type Status = "idle" | "checking" | "creating" | "success" | "error";

export default function SaveToSpotify({
  country,
  countryName,
  year,
  trackUris,
}: SaveToSpotifyProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [playlistUri, setPlaylistUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const createPlaylist = useCallback(async () => {
    setStatus("creating");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/spotify/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName, year, trackUris }),
      });

      if (res.status === 401) {
        // Token expired or invalid — re-auth
        window.location.href = `/api/spotify/auth?returnTo=/${country}/${year}`;
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create playlist");
      }

      const data = await res.json();
      setPlaylistUrl(data.playlistUrl);
      setPlaylistUri(data.playlistUri);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, [country, countryName, year, trackUris]);

  // Auto-trigger after OAuth callback
  useEffect(() => {
    const spotifyParam = searchParams.get("spotify");

    if (spotifyParam === "connected") {
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("spotify");
      router.replace(url.pathname, { scroll: false });

      createPlaylist();
    } else if (spotifyParam === "error") {
      const url = new URL(window.location.href);
      url.searchParams.delete("spotify");
      router.replace(url.pathname, { scroll: false });

      setErrorMsg("Spotify authorization was denied or failed");
      setStatus("error");
    }
  }, [searchParams, router, createPlaylist]);

  // Only show when explicitly enabled (dev mode: 5 user limit)
  if (process.env.NEXT_PUBLIC_ENABLE_SPOTIFY_SAVE !== "true") return null;

  // Don't render if no tracks have Spotify URIs
  if (trackUris.length === 0) return null;

  const handleClick = async () => {
    if (status === "creating") return;

    // Check if already authenticated
    setStatus("checking");
    try {
      const res = await fetch("/api/spotify/me");
      const data = await res.json();

      if (data.authenticated) {
        await createPlaylist();
      } else {
        // Redirect to OAuth
        window.location.href = `/api/spotify/auth?returnTo=/${country}/${year}`;
      }
    } catch {
      // Redirect to OAuth as fallback
      window.location.href = `/api/spotify/auth?returnTo=/${country}/${year}`;
    }
  };

  const openSpotify = () => {
    if (!playlistUri || !playlistUrl) return;

    // Try deep link first (mobile), fall back to web
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = playlistUri;
    } else {
      window.open(playlistUrl, "_blank", "noopener");
    }
  };

  if (status === "success") {
    return (
      <button
        onClick={openSpotify}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] hover:bg-[#1DB954]/25 transition-colors font-body text-xs font-medium"
      >
        <SpotifyIcon />
        Open in Spotify
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={status === "checking" || status === "creating"}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-wait transition-colors font-body text-xs text-foreground/60 hover:text-foreground/80 font-medium"
      >
        <SpotifyIcon />
        {status === "checking" || status === "creating"
          ? "Saving..."
          : "Save to Spotify"}
      </button>
      {status === "error" && errorMsg && (
        <span className="font-body text-[10px] text-red-400/70">{errorMsg}</span>
      )}
    </div>
  );
}

function SpotifyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
