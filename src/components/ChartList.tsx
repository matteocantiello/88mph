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
}

export default function ChartList({ tracks, country, countryName, year }: ChartListProps) {
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
        {country && countryName && year ? (
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
