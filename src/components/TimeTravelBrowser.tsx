"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import WorldMap from "./WorldMap";
import TimeCircuit from "./TimeCircuit";

interface LastDeparted {
  country: string;
  year: number;
  date: string;
}

interface TimeTravelBrowserProps {
  availableYearsByCountry: Record<string, number[]>;
  /** Use vertical stacked layout (map on top, circuit below) */
  stacked?: boolean;
  /** Hide the section header */
  hideHeader?: boolean;
  /** Controlled country (optional — if provided, overrides internal state) */
  country?: string | null;
  /** Controlled year (optional — if provided, overrides internal state) */
  year?: number | null;
  /** Called when user changes country */
  onCountryChange?: (country: string | null) => void;
  /** Called when user changes year */
  onYearChange?: (year: number | null) => void;
}

const LS_KEY = "88mph-last-departed";

export default function TimeTravelBrowser({
  availableYearsByCountry,
  stacked = false,
  hideHeader = false,
  country: controlledCountry,
  year: controlledYear,
  onCountryChange,
  onYearChange,
}: TimeTravelBrowserProps) {
  const router = useRouter();
  const [internalCountry, setInternalCountry] = useState<string | null>(null);
  const [internalYear, setInternalYear] = useState<number | null>(null);
  const [lastDeparted, setLastDeparted] = useState<LastDeparted | null>(null);

  const isControlled = controlledCountry !== undefined;
  const selectedCountry = isControlled ? controlledCountry : internalCountry;
  const destinationYear = isControlled ? controlledYear ?? null : internalYear;

  const handleCountryChange = useCallback((c: string | null) => {
    if (isControlled) {
      onCountryChange?.(c);
    } else {
      setInternalCountry(c);
    }
  }, [isControlled, onCountryChange]);

  const handleYearChange = useCallback((y: number | null) => {
    if (isControlled) {
      onYearChange?.(y);
    } else {
      setInternalYear(y);
    }
  }, [isControlled, onYearChange]);

  // Read last departed from localStorage + pre-select random country/year on mount (uncontrolled only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        setLastDeparted(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    if (!isControlled) {
      const countries = Object.keys(availableYearsByCountry).filter(
        (c) => (availableYearsByCountry[c]?.length ?? 0) > 0
      );
      if (countries.length > 0) {
        const country = countries[Math.floor(Math.random() * countries.length)];
        const years = availableYearsByCountry[country];
        const year = years[Math.floor(Math.random() * years.length)];
        setInternalCountry(country);
        setInternalYear(year);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snap destinationYear to nearest available year when country changes (uncontrolled only)
  useEffect(() => {
    if (isControlled) return;
    if (!internalCountry) {
      setInternalYear(null);
      return;
    }
    const years = availableYearsByCountry[internalCountry] || [];
    if (years.length === 0) {
      setInternalYear(null);
      return;
    }
    setInternalYear((prev) => {
      if (prev && years.includes(prev)) return prev;
      if (prev) {
        return years.reduce((a, b) =>
          Math.abs(b - prev) < Math.abs(a - prev) ? b : a
        );
      }
      return years[Math.floor(years.length / 2)];
    });
  }, [internalCountry, availableYearsByCountry, isControlled]);

  const handleGo = () => {
    if (!selectedCountry || !destinationYear) return;
    const departure: LastDeparted = {
      country: selectedCountry,
      year: destinationYear,
      date: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(departure));
    } catch {
      // ignore
    }
    router.push(`/${selectedCountry}/${destinationYear}`);
  };

  const availableYears = selectedCountry
    ? availableYearsByCountry[selectedCountry] || []
    : [];

  return (
    <div>
      {/* Section header */}
      {!hideHeader && (
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl text-foreground/80">
            Set Your Destination
          </h2>
          <span className="font-body text-[11px] text-foreground/15 tracking-wide">
            {Object.keys(availableYearsByCountry).length} countries
          </span>
        </div>
      )}

      {/* Map + Circuit */}
      {stacked ? (
        <div className="space-y-4">
          <div className="anim-slide-up">
            <WorldMap
              selectedCountry={selectedCountry}
              onSelectCountry={handleCountryChange}
              availableYearsByCountry={availableYearsByCountry}
            />
          </div>
          <div className="anim-slide-up" style={{ animationDelay: "0.1s" }}>
            <TimeCircuit
              selectedCountry={selectedCountry}
              destinationYear={destinationYear}
              onYearChange={(y) => handleYearChange(y)}
              availableYears={availableYears}
              lastDeparted={lastDeparted}
              onGo={handleGo}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 lg:gap-8 items-stretch">
          <div className="anim-slide-up">
            <WorldMap
              selectedCountry={selectedCountry}
              onSelectCountry={handleCountryChange}
              availableYearsByCountry={availableYearsByCountry}
            />
          </div>
          <div className="anim-slide-up" style={{ animationDelay: "0.1s" }}>
            <TimeCircuit
              selectedCountry={selectedCountry}
              destinationYear={destinationYear}
              onYearChange={(y) => handleYearChange(y)}
              availableYears={availableYears}
              lastDeparted={lastDeparted}
              onGo={handleGo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
