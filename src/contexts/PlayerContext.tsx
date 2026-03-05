"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Track } from "@/lib/data";

type PlaybackSource = "youtube" | "audio" | null;

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queue: Track[];
  autoPlay: boolean;
  playbackSource: PlaybackSource;
  videoExpanded: boolean;
}

interface PlayerContextType extends PlayerState {
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  toggleAutoPlay: () => void;
  toggleVideoExpanded: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

function isPlayable(track: Track): boolean {
  return !!track.youtubeId || !!track.previewUrl;
}

/**
 * Post a command to the YouTube iframe via postMessage.
 * This avoids the YT.Player API which injects origin params that cause error 150.
 */
function ytCommand(iframe: HTMLIFrameElement, func: string, args: unknown[] = []) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "https://www.youtube.com"
  );
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytReadyRef = useRef(false);
  const ytProgressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    queue: [],
    autoPlay: false,
    playbackSource: null,
    videoExpanded: false,
  });

  const [state, setState] = useState<PlayerState>(stateRef.current);

  const updateState = useCallback((updater: (s: PlayerState) => PlayerState) => {
    setState((s) => {
      const next = updater(s);
      stateRef.current = next;
      return next;
    });
  }, []);

  const stopYTProgress = useCallback(() => {
    if (ytProgressInterval.current) {
      clearInterval(ytProgressInterval.current);
      ytProgressInterval.current = null;
    }
  }, []);

  const startYTProgress = useCallback(() => {
    stopYTProgress();
    // Send "listening" to activate infoDelivery events from the iframe,
    // then keep pinging to ensure we stay subscribed after seeks/state changes.
    ytProgressInterval.current = setInterval(() => {
      const iframe = ytIframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "listening", id: 1 }),
        "https://www.youtube.com"
      );
    }, 500);
  }, [stopYTProgress]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
  }, []);

  const stopYouTube = useCallback(() => {
    stopYTProgress();
    const iframe = ytIframeRef.current;
    if (iframe) {
      ytCommand(iframe, "stopVideo");
    }
  }, [stopYTProgress]);

  /**
   * Ensure the YouTube iframe exists (created once, reused via postMessage).
   * First call creates the iframe with the given videoId + autoplay.
   * Subsequent calls use loadVideoById to switch videos without destroying the iframe,
   * which preserves the user-gesture context on mobile.
   */
  const playYouTube = useCallback(
    (videoId: string) => {
      const wrapper = document.getElementById("yt-player-wrapper");
      if (!wrapper) return;

      if (ytReadyRef.current && ytIframeRef.current) {
        // Reuse existing iframe — load new video via postMessage
        ytCommand(ytIframeRef.current, "loadVideoById", [videoId]);
        startYTProgress();
        return;
      }

      // First play: create the iframe
      wrapper.innerHTML = "";
      const iframe = document.createElement("iframe");
      iframe.id = "yt-player-iframe";
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      wrapper.appendChild(iframe);
      ytIframeRef.current = iframe;
      ytReadyRef.current = true;

      startYTProgress();
    },
    [startYTProgress]
  );

  // Listen for postMessage responses from YouTube iframe (for progress tracking)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://www.youtube.com") return;

      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (!data || !data.event) return;

      if (data.event === "onStateChange") {
        const s = stateRef.current;
        if (s.playbackSource !== "youtube") return;

        switch (data.info) {
          case 1: // PLAYING
            updateState((s) => ({ ...s, isPlaying: true }));
            break;
          case 2: // PAUSED
            updateState((s) => ({ ...s, isPlaying: false }));
            break;
          case 0: { // ENDED
            stopYTProgress();
            const st = stateRef.current;
            if (st.autoPlay) {
              const idx = st.queue.findIndex(
                (t) => t.rank === st.currentTrack?.rank && t.title === st.currentTrack?.title
              );
              for (let i = idx + 1; i < st.queue.length; i++) {
                if (isPlayable(st.queue[i])) {
                  const nextTrack = st.queue[i];
                  setTimeout(() => {
                    if (nextTrack.youtubeId) {
                      stopAudio();
                      playYouTube(nextTrack.youtubeId);
                      updateState((s) => ({
                        ...s,
                        currentTrack: nextTrack,
                        isPlaying: true,
                        progress: 0,
                        playbackSource: "youtube",
                      }));
                    } else if (nextTrack.previewUrl && audioRef.current) {
                      stopYouTube();
                      audioRef.current.src = nextTrack.previewUrl;
                      audioRef.current.play();
                      updateState((s) => ({
                        ...s,
                        currentTrack: nextTrack,
                        isPlaying: true,
                        progress: 0,
                        playbackSource: "audio",
                      }));
                    }
                  }, 0);
                  return;
                }
              }
            }
            updateState((s) => ({ ...s, isPlaying: false, progress: 0 }));
            break;
          }
        }
      }

      if (data.event === "infoDelivery" && data.info) {
        if (typeof data.info.currentTime === "number") {
          updateState((s) =>
            s.playbackSource === "youtube" ? { ...s, progress: data.info.currentTime } : s
          );
        }
        if (typeof data.info.duration === "number" && data.info.duration > 0) {
          updateState((s) =>
            s.playbackSource === "youtube" ? { ...s, duration: data.info.duration } : s
          );
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [updateState, stopYTProgress, stopAudio, stopYouTube, playYouTube]);

  // Initialize HTML5 Audio
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      updateState((s) =>
        s.playbackSource === "audio" ? { ...s, progress: audio.currentTime } : s
      );
    });
    audio.addEventListener("loadedmetadata", () => {
      updateState((s) =>
        s.playbackSource === "audio" ? { ...s, duration: audio.duration } : s
      );
    });
    audio.addEventListener("ended", () => {
      const st = stateRef.current;
      if (st.autoPlay) {
        const idx = st.queue.findIndex(
          (t) => t.rank === st.currentTrack?.rank && t.title === st.currentTrack?.title
        );
        for (let i = idx + 1; i < st.queue.length; i++) {
          if (isPlayable(st.queue[i])) {
            const nextTrack = st.queue[i];
            if (nextTrack.youtubeId) {
              stopAudio();
              playYouTube(nextTrack.youtubeId);
              updateState((s) => ({
                ...s,
                currentTrack: nextTrack,
                isPlaying: true,
                progress: 0,
                playbackSource: "youtube",
              }));
            } else if (nextTrack.previewUrl) {
              audio.src = nextTrack.previewUrl;
              audio.play();
              updateState((s) => ({
                ...s,
                currentTrack: nextTrack,
                isPlaying: true,
                progress: 0,
                playbackSource: "audio",
              }));
            }
            return;
          }
        }
      }
      updateState((s) => ({ ...s, isPlaying: false, progress: 0 }));
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [updateState, stopAudio, playYouTube]);

  const play = useCallback(
    (track: Track, queue?: Track[]) => {
      if (track.youtubeId) {
        stopAudio();
        playYouTube(track.youtubeId);
        updateState((s) => ({
          ...s,
          currentTrack: track,
          isPlaying: true,
          progress: 0,
          duration: 0,
          queue: queue ?? s.queue,
          playbackSource: "youtube",
        }));
        startYTProgress();
      } else if (track.previewUrl) {
        stopYouTube();
        const audio = audioRef.current;
        if (!audio) return;
        audio.src = track.previewUrl;
        audio.play();
        updateState((s) => ({
          ...s,
          currentTrack: track,
          isPlaying: true,
          progress: 0,
          duration: 0,
          queue: queue ?? s.queue,
          playbackSource: "audio",
        }));
      }
    },
    [stopAudio, stopYouTube, playYouTube, startYTProgress, updateState]
  );

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (s.playbackSource === "youtube" && ytIframeRef.current) {
      ytCommand(ytIframeRef.current, "pauseVideo");
      stopYTProgress();
    } else {
      audioRef.current?.pause();
    }
    updateState((s) => ({ ...s, isPlaying: false }));
  }, [stopYTProgress, updateState]);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (s.playbackSource === "youtube" && ytIframeRef.current) {
      ytCommand(ytIframeRef.current, "playVideo");
      startYTProgress();
    } else {
      audioRef.current?.play();
    }
    updateState((s) => ({ ...s, isPlaying: true }));
  }, [startYTProgress, updateState]);

  const next = useCallback(() => {
    const s = stateRef.current;
    const idx = s.queue.findIndex(
      (t) => t.rank === s.currentTrack?.rank && t.title === s.currentTrack?.title
    );
    for (let i = idx + 1; i < s.queue.length; i++) {
      if (isPlayable(s.queue[i])) {
        play(s.queue[i]);
        return;
      }
    }
  }, [play]);

  const previous = useCallback(() => {
    const s = stateRef.current;
    const idx = s.queue.findIndex(
      (t) => t.rank === s.currentTrack?.rank && t.title === s.currentTrack?.title
    );
    for (let i = idx - 1; i >= 0; i--) {
      if (isPlayable(s.queue[i])) {
        play(s.queue[i]);
        return;
      }
    }
  }, [play]);

  const seek = useCallback(
    (time: number) => {
      const s = stateRef.current;
      if (s.playbackSource === "youtube" && ytIframeRef.current) {
        ytCommand(ytIframeRef.current, "seekTo", [time, true]);
        updateState((s) => ({ ...s, progress: time }));
      } else if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    [updateState]
  );

  const toggleAutoPlay = useCallback(() => {
    updateState((s) => ({ ...s, autoPlay: !s.autoPlay }));
  }, [updateState]);

  const toggleVideoExpanded = useCallback(() => {
    updateState((s) => ({ ...s, videoExpanded: !s.videoExpanded }));
  }, [updateState]);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        resume,
        next,
        previous,
        seek,
        toggleAutoPlay,
        toggleVideoExpanded,
      }}
    >
      {/* YouTube player container — repositioned via CSS, never moved in DOM */}
      <div
        id="yt-player-wrapper"
        style={
          state.videoExpanded && state.playbackSource === "youtube"
            ? {
                position: "fixed",
                bottom: "72px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "min(640px, calc(100vw - 32px))",
                aspectRatio: "16/9",
                zIndex: 9998,
                opacity: 1,
                pointerEvents: "auto" as const,
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "56px",
              }
            : {
                position: "fixed" as const,
                bottom: "0px",
                left: "0px",
                width: "200px",
                height: "200px",
                opacity: 0,
                pointerEvents: "none" as const,
                zIndex: -1,
              }
        }
      />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
