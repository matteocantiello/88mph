"use client";

import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    autoPlay,
    playbackSource,
    videoExpanded,
    pause,
    resume,
    next,
    previous,
    seek,
    toggleAutoPlay,
    toggleVideoExpanded,
  } = usePlayer();

  if (!currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] bg-[#0c0b0a]/95 backdrop-blur-2xl border-t border-white/[0.06]">
      {/* Progress Bar */}
      <div
        className="h-[3px] cursor-pointer group relative"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          seek(x * duration);
        }}
      >
        <div className="h-full bg-white/[0.06] relative">
          <div
            className="absolute top-0 left-0 h-full bg-accent transition-[width] duration-100 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Hover indicator */}
        <div className="absolute -top-1 -bottom-1 left-0 right-0 group-hover:bg-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
        {/* Album Art */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/[0.06]">
          {currentTrack.albumArt ? (
            <Image src={currentTrack.albumArt} alt="" width={40} height={40} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-raised flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-foreground/20"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-sm text-foreground/90 truncate">
            {currentTrack.title}
          </p>
          <p className="font-body text-xs text-foreground/30 truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* Time */}
        <span className="font-body text-[11px] text-foreground/20 tabular-nums hidden sm:block">
          {formatTime(progress)} / {formatTime(duration)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={previous}
            className="w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/70 transition-colors rounded-full hover:bg-white/[0.04]"
            aria-label="Previous"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? pause : resume}
            className="w-10 h-10 rounded-full bg-foreground/[0.08] text-foreground flex items-center justify-center hover:bg-foreground/[0.12] transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
              </svg>
            )}
          </button>

          <button
            onClick={next}
            className="w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/70 transition-colors rounded-full hover:bg-white/[0.04]"
            aria-label="Next"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <div className="w-px h-5 bg-white/[0.06] mx-1 hidden sm:block" />

          <button
            onClick={toggleAutoPlay}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors hidden sm:flex ${
              autoPlay
                ? "text-accent bg-accent/10"
                : "text-foreground/20 hover:text-foreground/40 hover:bg-white/[0.04]"
            }`}
            aria-label="Toggle auto-play"
            title="Auto-play"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
          </button>

          {playbackSource === "youtube" && (
            <button
              onClick={toggleVideoExpanded}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors hidden sm:flex ${
                videoExpanded
                  ? "text-accent bg-accent/10"
                  : "text-foreground/20 hover:text-foreground/40 hover:bg-white/[0.04]"
              }`}
              aria-label="Toggle video"
              title="Show video"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <polyline points="8 21 12 17 16 21" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
