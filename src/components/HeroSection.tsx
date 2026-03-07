"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { getCountryName } from "@/lib/utils";
import { Metadata } from "@/lib/data";
import RandomButton from "./RandomButton";
import TimeTravelBrowser from "./TimeTravelBrowser";

interface HeroSectionProps {
  metadata: Metadata;
  availableYearsByCountry: Record<string, number[]>;
}

export default function HeroSection({
  metadata,
  availableYearsByCountry,
}: HeroSectionProps) {
  const [displayCountry, setDisplayCountry] = useState<string | null>(null);
  const [displayYear, setDisplayYear] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build flat list of all country/year pairs for rotation
  const allPairs = useMemo(() => {
    const pairs: { country: string; year: number }[] = [];
    for (const [country, years] of Object.entries(availableYearsByCountry)) {
      for (const year of years) {
        pairs.push({ country, year });
      }
    }
    return pairs;
  }, [availableYearsByCountry]);

  const pickRandom = useCallback(() => {
    if (allPairs.length === 0) return;
    const pair = allPairs[Math.floor(Math.random() * allPairs.length)];
    setFading(true);
    setTimeout(() => {
      setDisplayCountry(pair.country);
      setDisplayYear(pair.year);
      setFading(false);
    }, 300);
  }, [allPairs]);

  // Start rotating on mount
  useEffect(() => {
    pickRandom();
    intervalRef.current = setInterval(pickRandom, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pickRandom]);

  const handleSelectionChange = useCallback(
    (country: string | null, year: number | null) => {
      setDisplayCountry(country);
      setDisplayYear(year);
    },
    []
  );

  const rawName = displayCountry ? getCountryName(displayCountry) : null;
  const needsThe = rawName && /^(United|Netherlands|Philippines)/i.test(rawName);
  const countryName = rawName;

  return (
    <>
      {/* Hero headline + CTA */}
      <div className="anim-slide-up text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-accent/50 mb-5 flex items-center justify-center gap-2">
          <span className="w-8 h-px bg-accent/30" />
          The past. On shuffle.
          <span className="w-8 h-px bg-accent/30" />
        </p>
        <h1 className="font-display text-[1.45rem] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground/90 mb-10 whitespace-nowrap">
          {countryName && displayYear ? (
            <span
              className="transition-opacity duration-300"
              style={{ opacity: fading ? 0 : 1 }}
            >
              What was{" "}
              {needsThe && "the "}
              <span className="text-amber-400/90">
                {countryName}
              </span>{" "}
              listening to in{" "}
              <span className="text-emerald-400/80">
                {displayYear}
              </span>
              ?
            </span>
          ) : (
            "What was the world listening to?"
          )}
        </h1>
        <div className="flex items-center justify-center">
          <RandomButton metadata={metadata} />
        </div>
      </div>

      {/* Full-width Map + Time Circuit */}
      <div className="anim-slide-up" style={{ animationDelay: "0.1s" }}>
        <TimeTravelBrowser
          availableYearsByCountry={availableYearsByCountry}
          hideHeader
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </>
  );
}
