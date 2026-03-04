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

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queue: Track[];
  autoPlay: boolean;
}

interface PlayerContextType extends PlayerState {
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  toggleAutoPlay: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    queue: [],
    autoPlay: false,
  });

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setState((s) => ({ ...s, progress: audio.currentTime }));
    });
    audio.addEventListener("loadedmetadata", () => {
      setState((s) => ({ ...s, duration: audio.duration }));
    });
    audio.addEventListener("ended", () => {
      setState((s) => {
        if (s.autoPlay) {
          const idx = s.queue.findIndex(
            (t) => t.rank === s.currentTrack?.rank && t.title === s.currentTrack?.title
          );
          if (idx < s.queue.length - 1) {
            const nextTrack = s.queue[idx + 1];
            if (nextTrack.previewUrl) {
              audio.src = nextTrack.previewUrl;
              audio.play();
              return { ...s, currentTrack: nextTrack, isPlaying: true, progress: 0 };
            }
          }
        }
        return { ...s, isPlaying: false, progress: 0 };
      });
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const play = useCallback((track: Track, queue?: Track[]) => {
    const audio = audioRef.current;
    if (!audio || !track.previewUrl) return;
    audio.src = track.previewUrl;
    audio.play();
    setState((s) => ({
      ...s,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      queue: queue ?? s.queue,
    }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      const idx = s.queue.findIndex(
        (t) => t.rank === s.currentTrack?.rank && t.title === s.currentTrack?.title
      );
      const nextTrack = s.queue[idx + 1];
      if (nextTrack?.previewUrl && audioRef.current) {
        audioRef.current.src = nextTrack.previewUrl;
        audioRef.current.play();
        return { ...s, currentTrack: nextTrack, isPlaying: true, progress: 0 };
      }
      return s;
    });
  }, []);

  const previous = useCallback(() => {
    setState((s) => {
      const idx = s.queue.findIndex(
        (t) => t.rank === s.currentTrack?.rank && t.title === s.currentTrack?.title
      );
      const prevTrack = s.queue[idx - 1];
      if (prevTrack?.previewUrl && audioRef.current) {
        audioRef.current.src = prevTrack.previewUrl;
        audioRef.current.play();
        return { ...s, currentTrack: prevTrack, isPlaying: true, progress: 0 };
      }
      return s;
    });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setState((s) => ({ ...s, autoPlay: !s.autoPlay }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{ ...state, play, pause, resume, next, previous, seek, toggleAutoPlay }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
