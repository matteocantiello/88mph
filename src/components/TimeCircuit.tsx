"use client";

import { useState } from "react";

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

  const handleGo = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 500);
    onGo();
  };

  const now = new Date();
  const presentMonth = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const presentDay = String(now.getDate()).padStart(2, "0");
  const presentYear = String(now.getFullYear());

  const canGo = selectedCountry && destinationYear;

  return (
    <div className="time-circuit-panel rounded-xl p-4 md:p-5 h-full flex flex-col">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-foreground/25 font-medium">
          Time Circuits
        </span>
      </div>

      {/* Row 1: Destination Time (Green) — LARGE, hero row */}
      <div className="mb-4 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full indicator-green" />
          <span className="font-body text-[10px] uppercase tracking-[0.25em] text-foreground/25">
            DESTINATION TIME
          </span>
        </div>
        <div className="flex items-center bg-black/40 rounded-xl px-4 py-4 md:py-5 border border-white/[0.03]">
          <span className={`led-digit text-2xl md:text-3xl led-green led-dim`}>
            ---
          </span>
          <span className="led-digit text-2xl md:text-3xl mx-2 led-green opacity-30">/</span>
          <span className={`led-digit text-2xl md:text-3xl led-green led-dim`}>
            --
          </span>
          <span className="led-digit text-2xl md:text-3xl mx-2 led-green opacity-30">/</span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`p-1.5 rounded transition-colors ${
                canGoPrev ? "text-foreground/40 hover:text-foreground/70" : "text-foreground/10"
              }`}
              aria-label="Previous year"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className={`led-digit text-3xl md:text-4xl led-green ${!destinationYear ? "led-dim" : ""}`}>
              {destinationYear ? String(destinationYear) : "----"}
            </span>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-1.5 rounded transition-colors ${
                canGoNext ? "text-foreground/40 hover:text-foreground/70" : "text-foreground/10"
              }`}
              aria-label="Next year"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Present Time (Amber) — compact */}
      <CircuitRow
        label="PRESENT TIME"
        colorClass="led-amber"
        indicatorClass="indicator-amber"
        month={presentMonth}
        day={presentDay}
        year={presentYear}
      />

      {/* Row 3: Last Time Departed (Red) — compact */}
      <CircuitRow
        label="LAST TIME DEPARTED"
        colorClass="led-red"
        indicatorClass="indicator-red"
        month={lastDeparted ? formatMonth(lastDeparted.date) : "---"}
        day={lastDeparted ? formatDay(lastDeparted.date) : "--"}
        year={lastDeparted ? String(lastDeparted.year) : "----"}
        dimMonth={!lastDeparted}
        dimDay={!lastDeparted}
        dimYear={!lastDeparted}
      />

      {/* GO Button — pushed to bottom */}
      <button
        onClick={handleGo}
        disabled={!canGo}
        className={`w-full mt-auto pt-4 py-3 rounded-lg font-body text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
          canGo
            ? "bg-accent text-background hover:bg-accent/90 cursor-pointer"
            : "bg-white/[0.04] text-foreground/15 cursor-not-allowed"
        } ${flashing ? "flux-flash" : ""}`}
      >
        {canGo ? "GO" : "Select Country & Year"}
      </button>
    </div>
  );
}

/* === Compact Circuit Row (for Present/Last Departed) === */
interface CircuitRowProps {
  label: string;
  colorClass: string;
  indicatorClass: string;
  month: string;
  day: string;
  year: string;
  dimMonth?: boolean;
  dimDay?: boolean;
  dimYear?: boolean;
}

function CircuitRow({
  label,
  colorClass,
  indicatorClass,
  month,
  day,
  year,
  dimMonth,
  dimDay,
  dimYear,
}: CircuitRowProps) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-1.5 h-1.5 rounded-full ${indicatorClass}`} />
        <span className="font-body text-[9px] uppercase tracking-[0.25em] text-foreground/20">
          {label}
        </span>
      </div>
      <div className="flex items-center bg-black/40 rounded-lg px-2.5 py-1.5 border border-white/[0.03]">
        <span className={`led-digit text-sm ${colorClass} ${dimMonth ? "led-dim" : ""}`}>
          {month}
        </span>
        <span className={`led-digit text-sm mx-1 ${colorClass} opacity-30`}>/</span>
        <span className={`led-digit text-sm ${colorClass} ${dimDay ? "led-dim" : ""}`}>
          {day}
        </span>
        <span className={`led-digit text-sm mx-1 ${colorClass} opacity-30`}>/</span>
        <span className={`led-digit text-sm ml-auto ${colorClass} ${dimYear ? "led-dim" : ""}`}>
          {year}
        </span>
      </div>
    </div>
  );
}

function formatMonth(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  } catch {
    return "---";
  }
}

function formatDay(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return String(d.getDate()).padStart(2, "0");
  } catch {
    return "--";
  }
}
