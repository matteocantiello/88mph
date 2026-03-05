"use client";

import Image from "next/image";
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
  const hasYouTube = !!track.youtubeId;
  const hasPreview = !!track.previewUrl;
  const isPlayable = hasYouTube || hasPreview;
  const hasSpotifyLink = !isPlayable && !!track.spotifyUrl;

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
          <Image
            src={track.albumArt}
            alt=""
            width={48}
            height={48}
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
        {isPlayable && (
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

        {/* Spotify link overlay (fallback when no preview) */}
        {hasSpotifyLink && (
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Listen on Spotify"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </a>
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
        {isPlayable && !isActive && (
          <span className="font-body text-[11px] text-foreground/15 opacity-0 group-hover:opacity-100 transition-opacity">
            {hasYouTube ? "Full song" : "Preview"}
          </span>
        )}
        {hasSpotifyLink && (
          <span className="font-body text-[11px] text-foreground/15 opacity-0 group-hover:opacity-100 transition-opacity">
            Spotify
          </span>
        )}
      </div>
    </div>
  );
}
