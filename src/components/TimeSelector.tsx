"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, REGIONS } from "@/lib/utils";
import { Metadata, getAvailableYears } from "@/lib/data";
import { getThemeForYear } from "@/lib/themes";

interface TimeSelectorProps {
  metadata: Metadata;
  initialCountry?: string;
  initialYear?: number;
  compact?: boolean;
}

export default function TimeSelector({
  metadata,
  initialCountry = "us",
  initialYear,
  compact = false,
}: TimeSelectorProps) {
  const router = useRouter();
  const [country, setCountry] = useState(initialCountry);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const availableYears = getAvailableYears(metadata, country);

  useEffect(() => {
    if (initialYear && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-year="${initialYear}"]`) as HTMLElement | null;
      if (el) {
        // Use scrollLeft instead of scrollIntoView to avoid scrolling the whole page
        const container = scrollRef.current;
        const scrollTarget = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
        container.scrollTo({ left: scrollTarget, behavior: "smooth" });
      }
    }
  }, [initialYear, country]);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCountryPicker(false);
      }
    }
    if (showCountryPicker) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showCountryPicker]);

  const handleYearClick = (year: number) => {
    router.push(`/${country}/${year}`, { scroll: true });
  };

  const handleCountrySelect = (code: string) => {
    setCountry(code);
    setShowCountryPicker(false);
    const years = getAvailableYears(metadata, code);
    if (years.length > 0) {
      router.push(`/${code}/${years[Math.floor(years.length / 2)]}`);
    }
  };

  return (
    <div className="w-full">
      {/* Country selector (compact dropdown style) */}
      {!compact && (
        <div className="relative mb-5" ref={pickerRef}>
          <button
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
          >
            <span className="text-lg">{COUNTRIES[country]?.flag}</span>
            <span className="font-body text-sm text-foreground/70 font-medium">
              {COUNTRIES[country]?.name}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`text-foreground/30 transition-transform duration-200 ${showCountryPicker ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showCountryPicker && (
            <div className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-[#161514] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 z-50 p-2">
              {REGIONS.map((region) => (
                <div key={region.name} className="mb-1">
                  <p className="font-body text-[10px] uppercase tracking-[0.15em] text-foreground/20 px-3 py-1.5">
                    {region.name}
                  </p>
                  {region.countries.map((code) => (
                    <button
                      key={code}
                      onClick={() => handleCountrySelect(code)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
                        code === country
                          ? "bg-accent/10 text-accent"
                          : "text-foreground/50 hover:text-foreground/80 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-base">{COUNTRIES[code]?.flag}</span>
                      <span className="font-body text-sm font-medium flex-1">{COUNTRIES[code]?.name}</span>
                      <span className="font-body text-[10px] opacity-40">
                        {getAvailableYears(metadata, code).length}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Year Timeline */}
      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-[3px] min-w-max">
            {availableYears.map((year) => {
              const isSelected = year === initialYear;
              const theme = getThemeForYear(year);

              return (
                <button
                  key={year}
                  data-year={year}
                  onClick={() => handleYearClick(year)}
                  className={`relative group flex flex-col items-center transition-all duration-300 ${
                    compact ? "px-3 py-2" : "px-4 py-3"
                  } rounded-xl ${
                    isSelected
                      ? "scale-105"
                      : "hover:scale-[1.02]"
                  }`}
                  style={{
                    background: isSelected ? `${theme.accent}15` : undefined,
                    borderColor: isSelected ? `${theme.accent}30` : "transparent",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                >
                  <span
                    className={`font-display transition-colors duration-300 ${
                      compact ? "text-xl" : "text-2xl md:text-3xl"
                    }`}
                    style={{
                      color: isSelected ? theme.accent : `${theme.foreground}50`,
                    }}
                  >
                    {year}
                  </span>
                  {isSelected && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: theme.accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fade edges */}
        <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
