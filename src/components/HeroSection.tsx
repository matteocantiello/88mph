"use client";

import { useState, useCallback } from "react";
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

  const handleSelectionChange = useCallback(
    (country: string | null, year: number | null) => {
      setDisplayCountry(country);
      setDisplayYear(year);
    },
    []
  );

  const countryName = displayCountry ? getCountryName(displayCountry) : null;

  return (
    <>
      {/* Hero headline + CTA */}
      <div className="anim-slide-up text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-accent/50 mb-5 flex items-center justify-center gap-2">
          <span className="w-8 h-px bg-accent/30" />
          The past. On shuffle.
          <span className="w-8 h-px bg-accent/30" />
        </p>
        <h1 className="font-display text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground/90 mb-10">
          {countryName && displayYear ? (
            <>
              What was{" "}
              <span className="led-hero inline text-[1em] leading-[inherit]">
                {countryName}
              </span>{" "}
              listening to in{" "}
              <span className="led-digit led-green inline text-[1em] leading-[inherit]">
                {displayYear}
              </span>
              ?
            </>
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
