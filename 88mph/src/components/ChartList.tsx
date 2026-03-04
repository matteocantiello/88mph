"use client";

import { Track } from "@/lib/data";
import TrackRow from "./TrackRow";

interface ChartListProps {
  tracks: Track[];
}

export default function ChartList({ tracks }: ChartListProps) {
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
        <span />
      </div>

      {/* Tracks */}
      {tracks.map((track, i) => (
        <TrackRow key={track.rank} track={track} queue={tracks} index={i} />
      ))}
    </div>
  );
}
