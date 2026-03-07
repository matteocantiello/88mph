"use client";

import { Suspense } from "react";
import { Track } from "@/lib/data";
import TrackRow from "./TrackRow";
import SaveToSpotify from "./SaveToSpotify";

interface ChartListProps {
  tracks: Track[];
  country?: string;
  countryName?: string;
  year?: number;
  spotifyPlaylistUrl?: string;
}

export default function ChartList({ tracks, country, countryName, year, spotifyPlaylistUrl }: ChartListProps) {
  const trackUris = tracks
    .map((t) => t.spotifyUri)
    .filter((uri): uri is string => !!uri);

  return (
    <div className="divide-y divide-white/[0.04]">
      {/* Header */}
      <div
        className="grid items-center gap-4 px-4 py-2 -mx-4 text-foreground/20"
        style={{ gridTemplateColumns: "2rem 3rem 1fr auto" }}
      >
        <span className="text-right font-body text-[11px] uppercase tracking-wider">#</span>
        <span />
        <span className="font-body text-[11px] uppercase tracking-wider">Title</span>
        {spotifyPlaylistUrl ? (
          <a
            href={spotifyPlaylistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] hover:bg-[#1DB954]/25 transition-colors font-body text-xs font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Listen on Spotify
          </a>
        ) : country && countryName && year ? (
          <Suspense fallback={<span />}>
            <SaveToSpotify
              country={country}
              countryName={countryName}
              year={year}
              trackUris={trackUris}
            />
          </Suspense>
        ) : (
          <span />
        )}
      </div>

      {/* Tracks */}
      {tracks.map((track, i) => (
        <TrackRow key={track.rank} track={track} queue={tracks} index={i} />
      ))}
    </div>
  );
}
