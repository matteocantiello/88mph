"use client";

import { Track } from "@/lib/data";
import { usePlayer } from "@/contexts/PlayerContext";

interface TrackRowProps {
  track: Track;
  queue: Track[];
  index: number;
}

export default function TrackRow({ track, queue, index }: TrackRowProps) {
  const { play, pause, currentTrack, isPlaying } = usePlayer();
  const isActive =
    currentTrack?.title === track.title && currentTrack?.rank === track.rank;
  const hasPreview = !!track.previewUrl;

  return (
    <div
      className="track-row group grid items-center gap-4 px-4 py-3 -mx-4 rounded-xl transition-all duration-300 hover:bg-white/[0.02] cursor-default"
      style={{
        animationDelay: `${index * 70 + 100}ms`,
        gridTemplateColumns: "2rem 3rem 1fr auto",
      }}
    >
      {/* Rank */}
      <div className="text-right">
        <span
          className={`font-display text-xl tabular-nums transition-colors duration-300 ${
            isActive ? "text-accent" : "text-foreground/20"
          }`}
        >
          {String(track.rank).padStart(2, "0")}
        </span>
      </div>

      {/* Album Art */}
      <div
        className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 relative transition-all duration-300 ${
          isActive
            ? "ring-2 ring-accent/40 shadow-lg shadow-accent/10"
            : "ring-1 ring-white/[0.06]"
        }`}
      >
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface-raised flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground/15"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}

        {/* Play overlay */}
        {hasPreview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isActive && isPlaying) pause();
              else play(track, queue);
            }}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
              isActive && isPlaying
                ? "bg-black/40 opacity-100"
                : "bg-black/50 opacity-0 group-hover:opacity-100"
            }`}
            aria-label={isActive && isPlaying ? "Pause" : "Play"}
          >
            {isActive && isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Track Info */}
      <div className="min-w-0">
        <p
          className={`font-body font-semibold text-[15px] truncate transition-colors duration-300 ${
            isActive ? "text-accent" : "text-foreground/90"
          }`}
        >
          {track.title}
        </p>
        <p className="font-body text-sm text-foreground/35 truncate">
          {track.artist}
        </p>
      </div>

      {/* Right indicator */}
      <div className="flex items-center">
        {isActive && isPlaying && (
          <div className="flex items-end gap-[3px] h-4">
            <span className="w-[3px] bg-accent rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "60%", animationDelay: "0ms" }} />
            <span className="w-[3px] bg-accent rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "100%", animationDelay: "0.15s" }} />
            <span className="w-[3px] bg-accent rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "40%", animationDelay: "0.3s" }} />
          </div>
        )}
        {hasPreview && !isActive && (
          <span className="font-body text-[11px] text-foreground/15 opacity-0 group-hover:opacity-100 transition-opacity">
            Preview
          </span>
        )}
      </div>
    </div>
  );
}
