"use client";

import { useState, useRef, useEffect } from "react";

interface LastDeparted {
  country: string;
  year: number;
  date: string;
}

interface TimeCircuitProps {
  selectedCountry: string | null;
  destinationYear: number | null;
  onYearChange: (year: number) => void;
  availableYears: number[];
  lastDeparted: LastDeparted | null;
  onGo: () => void;
}

export default function TimeCircuit({
  selectedCountry,
  destinationYear,
  onYearChange,
  availableYears,
  lastDeparted,
  onGo,
}: TimeCircuitProps) {
  const [flashing, setFlashing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentYearIndex = destinationYear
    ? availableYears.indexOf(destinationYear)
    : -1;

  const canGoPrev = currentYearIndex > 0;
  const canGoNext = currentYearIndex < availableYears.length - 1;

  const handlePrev = () => {
    if (canGoPrev) onYearChange(availableYears[currentYearIndex - 1]);
  };
  const handleNext = () => {
    if (canGoNext) onYearChange(availableYears[currentYearIndex + 1]);
  };

  const handlePickYear = (y: number) => {
    onYearChange(y);
    setPickerOpen(false);
  };

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    // Scroll selected year into view within the picker (not the page)
    requestAnimationFrame(() => {
      const selected = pickerRef.current?.querySelector("[data-selected]") as HTMLElement | null;
      const scroller = pickerRef.current?.querySelector("[data-picker-scroll]") as HTMLElement | null;
      if (selected && scroller) {
        const top = selected.offsetTop - scroller.clientHeight / 2 + selected.clientHeight / 2;
        scroller.scrollTo({ top, behavior: "instant" });
      }
    });
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  useEffect(() => {
    setPickerOpen(false);
  }, [selectedCountry]);

  const handleGo = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 500);
    fetch("/api/trips", { method: "POST" }).catch(() => {});
    onGo();
  };

  const presentYear = new Date().getFullYear();
  const canGo = selectedCountry && destinationYear;
  const hasCountry = !!selectedCountry;

  return (
    <div className="time-circuit-panel rounded-xl p-4 md:p-5 h-full flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
        <span className="font-body text-[12px] uppercase tracking-[0.3em] text-foreground/25 font-medium">
          Time Circuits
        </span>
      </div>

      {/* All three circuit rows */}
      <div className="space-y-2 flex-1 flex flex-col justify-center">
        {/* Destination (Green) */}
        <div className="relative" ref={pickerRef}>
          <div className="flex items-center bg-black/40 rounded-lg px-3 py-2.5 border border-white/[0.03]">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${hasCountry ? "indicator-green" : "bg-foreground/10"}`} />
              <span className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground/20">
                Destination
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`p-0.5 rounded transition-colors ${
                  canGoPrev ? "text-foreground/30 hover:text-foreground/60" : "text-foreground/[0.07]"
                }`}
                aria-label="Previous year"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={hasCountry ? () => setPickerOpen(!pickerOpen) : undefined}
                className={hasCountry ? "cursor-pointer" : "cursor-default"}
              >
                <span className={`led-digit text-4xl md:text-5xl led-green ${!destinationYear ? "led-dim" : ""}`}>
                  {destinationYear ? String(destinationYear) : "----"}
                </span>
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`p-0.5 rounded transition-colors ${
                  canGoNext ? "text-foreground/30 hover:text-foreground/60" : "text-foreground/[0.07]"
                }`}
                aria-label="Next year"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Year grid picker */}
          {pickerOpen && availableYears.length > 0 && (
            <div data-picker-scroll className="absolute left-0 right-0 top-full mt-1 z-20 bg-[#111] border border-white/[0.08] rounded-xl p-3 shadow-2xl shadow-black/60 max-h-[40vh] overflow-y-auto scrollbar-hide animate-picker-open">
              <div className="grid grid-cols-4 gap-1.5">
                {availableYears.map((y) => (
                  <button
                    key={y}
                    onClick={() => handlePickYear(y)}
                    {...(y === destinationYear ? { "data-selected": true } : {})}
                    className={`py-1.5 rounded-lg font-body text-xs tabular-nums transition-all duration-150 ${
                      y === destinationYear
                        ? "bg-[#39ff14]/15 text-[#39ff14] font-semibold shadow-[0_0_8px_rgba(57,255,20,0.25)]"
                        : "text-foreground/40 hover:text-foreground/70 hover:bg-white/[0.06]"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Present (Amber) */}
        <div className="flex items-center bg-black/40 rounded-lg px-3 py-2.5 border border-white/[0.03]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full indicator-amber" />
            <span className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground/20">
              Present
            </span>
          </div>
          <span className="led-digit text-xl ml-auto led-amber">
            {presentYear}
          </span>
        </div>

        {/* Last Departed (Red) */}
        <div className="flex items-center bg-black/40 rounded-lg px-3 py-2.5 border border-white/[0.03]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full indicator-red" />
            <span className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground/20">
              Last Departed
            </span>
          </div>
          <span className={`led-digit text-xl ml-auto led-red ${!lastDeparted ? "led-dim" : ""}`}>
            {lastDeparted ? String(lastDeparted.year) : "----"}
          </span>
        </div>
      </div>

      {/* GO Button */}
      <button
        onClick={handleGo}
        disabled={!canGo}
        className={`w-full py-3 mt-4 rounded-lg font-body text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
          canGo
            ? "bg-accent text-background hover:bg-accent/90 cursor-pointer"
            : "bg-white/[0.04] text-foreground/10 cursor-not-allowed"
        } ${flashing ? "flux-flash" : ""}`}
      >
        GO
      </button>
    </div>
  );
}
