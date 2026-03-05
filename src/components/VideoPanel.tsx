"use client";

import { usePlayer } from "@/contexts/PlayerContext";

export default function VideoPanel() {
  const {
    currentTrack,
    playbackSource,
    videoExpanded,
    toggleVideoExpanded,
  } = usePlayer();

  if (playbackSource !== "youtube") return null;

  return (
    <div
      className="fixed left-0 right-0 z-[9997] transition-transform duration-300 ease-in-out pointer-events-none"
      style={{
        bottom: "72px",
        transform: videoExpanded ? "translateY(0)" : "translateY(100%)",
      }}
    >
      {/* Header — opaque, interactive */}
      <div className="pointer-events-auto bg-[#0c0b0a]/98 backdrop-blur-2xl border-t border-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm font-semibold text-foreground/80 truncate">
              {currentTrack?.title}
            </p>
            <p className="font-body text-xs text-foreground/30 truncate">
              {currentTrack?.artist}
            </p>
          </div>
          <button
            onClick={toggleVideoExpanded}
            className="w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/70 transition-colors rounded-full hover:bg-white/[0.04] shrink-0 ml-2"
            aria-label="Collapse video"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Video area — opaque background, no interaction blocking */}
      <div className="bg-[#0c0b0a]/95 backdrop-blur-2xl flex justify-center px-4 py-3">
        <div className="w-full max-w-[640px] aspect-video" />
      </div>
    </div>
  );
}
