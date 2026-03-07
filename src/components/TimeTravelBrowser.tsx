"use client";

import { useState, useEffect } from "react";
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
  /** Called when selected country or year changes */
  onSelectionChange?: (country: string | null, year: number | null) => void;
}

const LS_KEY = "88mph-last-departed";

export default function TimeTravelBrowser({
  availableYearsByCountry,
  stacked = false,
  hideHeader = false,
  onSelectionChange,
}: TimeTravelBrowserProps) {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [destinationYear, setDestinationYear] = useState<number | null>(null);
  const [lastDeparted, setLastDeparted] = useState<LastDeparted | null>(null);

  // Read last departed from localStorage + pre-select random country/year on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        setLastDeparted(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Pick a random country with charts, then a random year
    const countries = Object.keys(availableYearsByCountry).filter(
      (c) => (availableYearsByCountry[c]?.length ?? 0) > 0
    );
    if (countries.length > 0) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const years = availableYearsByCountry[country];
      const year = years[Math.floor(Math.random() * years.length)];
      setSelectedCountry(country);
      setDestinationYear(year);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snap destinationYear to nearest available year when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setDestinationYear(null);
      return;
    }
    const years = availableYearsByCountry[selectedCountry] || [];
    if (years.length === 0) {
      setDestinationYear(null);
      return;
    }
    setDestinationYear((prev) => {
      if (prev && years.includes(prev)) return prev;
      if (prev) {
        return years.reduce((a, b) =>
          Math.abs(b - prev) < Math.abs(a - prev) ? b : a
        );
      }
      return years[Math.floor(years.length / 2)];
    });
  }, [selectedCountry, availableYearsByCountry]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedCountry, destinationYear);
  }, [selectedCountry, destinationYear, onSelectionChange]);

  const handleGo = () => {
    if (!selectedCountry || !destinationYear) return;
    // Write to localStorage
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
              onSelectCountry={setSelectedCountry}
              availableYearsByCountry={availableYearsByCountry}
            />
          </div>
          <div className="anim-slide-up" style={{ animationDelay: "0.1s" }}>
            <TimeCircuit
              selectedCountry={selectedCountry}
              destinationYear={destinationYear}
              onYearChange={setDestinationYear}
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
              onSelectCountry={setSelectedCountry}
              availableYearsByCountry={availableYearsByCountry}
            />
          </div>
          <div className="anim-slide-up" style={{ animationDelay: "0.1s" }}>
            <TimeCircuit
              selectedCountry={selectedCountry}
              destinationYear={destinationYear}
              onYearChange={setDestinationYear}
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
