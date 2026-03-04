"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/utils";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const availableYears = getAvailableYears(metadata, country);

  useEffect(() => {
    if (initialYear && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-year="${initialYear}"]`);
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [initialYear, country]);

  const handleYearClick = (year: number) => {
    router.push(`/${country}/${year}`);
  };

  const countryKeys = Object.keys(COUNTRIES);

  return (
    <div className="w-full">
      {/* Country Toggle */}
      {!compact && (
        <div className="flex gap-1 mb-5 p-1 bg-surface/60 rounded-full w-fit">
          {countryKeys.map((code) => (
            <button
              key={code}
              onClick={() => setCountry(code)}
              className={`px-5 py-2 rounded-full font-body text-sm font-medium transition-all duration-300 ${
                country === code
                  ? "bg-foreground/[0.08] text-foreground"
                  : "text-foreground/30 hover:text-foreground/60"
              }`}
            >
              <span className="mr-1.5">{COUNTRIES[code].flag}</span>
              {COUNTRIES[code].name}
            </button>
          ))}
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
