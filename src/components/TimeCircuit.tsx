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
    <div className="time-circuit-panel rounded-xl p-5 md:p-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-foreground/25 font-medium">
          Time Circuits
        </span>
      </div>

      {/* Row 1: Destination Time (Green) */}
      <CircuitRow
        label="DESTINATION TIME"
        colorClass="led-green"
        indicatorClass="indicator-green"
        month="---"
        day="--"
        year={destinationYear ? String(destinationYear) : "----"}
        dimMonth
        dimDay
        yearInteractive
        onPrev={canGoPrev ? handlePrev : undefined}
        onNext={canGoNext ? handleNext : undefined}
      />

      {/* Row 2: Present Time (Amber) */}
      <CircuitRow
        label="PRESENT TIME"
        colorClass="led-amber"
        indicatorClass="indicator-amber"
        month={presentMonth}
        day={presentDay}
        year={presentYear}
      />

      {/* Row 3: Last Time Departed (Red) */}
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

      {/* GO Button */}
      <button
        onClick={handleGo}
        disabled={!canGo}
        className={`w-full mt-5 py-3 rounded-lg font-body text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
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

/* === Circuit Row === */
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
  yearInteractive?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
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
  yearInteractive,
  onPrev,
  onNext,
}: CircuitRowProps) {
  return (
    <div className="mb-3 last:mb-0">
      {/* Row label */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-2 h-2 rounded-full ${indicatorClass}`} />
        <span className="font-body text-[9px] uppercase tracking-[0.25em] text-foreground/20">
          {label}
        </span>
      </div>

      {/* Display */}
      <div className="flex items-center gap-0 bg-black/40 rounded-lg px-3 py-2.5 border border-white/[0.03]">
        {/* Month */}
        <span className={`led-digit text-lg md:text-xl ${colorClass} ${dimMonth ? "led-dim" : ""}`}>
          {month}
        </span>

        <span className={`led-digit text-lg md:text-xl mx-1 ${colorClass} opacity-30`}>/</span>

        {/* Day */}
        <span className={`led-digit text-lg md:text-xl ${colorClass} ${dimDay ? "led-dim" : ""}`}>
          {day}
        </span>

        <span className={`led-digit text-lg md:text-xl mx-1 ${colorClass} opacity-30`}>/</span>

        {/* Year - with optional arrows */}
        <div className="flex items-center gap-1 ml-auto">
          {yearInteractive && (
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className={`p-1 rounded transition-colors ${
                onPrev ? "text-foreground/40 hover:text-foreground/70" : "text-foreground/10"
              }`}
              aria-label="Previous year"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <span className={`led-digit text-lg md:text-xl ${colorClass} ${dimYear ? "led-dim" : ""}`}>
            {year}
          </span>

          {yearInteractive && (
            <button
              onClick={onNext}
              disabled={!onNext}
              className={`p-1 rounded transition-colors ${
                onNext ? "text-foreground/40 hover:text-foreground/70" : "text-foreground/10"
              }`}
              aria-label="Next year"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
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
