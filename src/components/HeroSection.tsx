"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { getCountryName, COUNTRIES } from "@/lib/utils";
import { Metadata } from "@/lib/data";
import RandomButton from "./RandomButton";
import TimeTravelBrowser from "./TimeTravelBrowser";

// All country names for the scramble pool
const ALL_COUNTRY_NAMES = Object.keys(COUNTRIES).map((c) => getCountryName(c));

/**
 * Slot-machine style inline text that scrambles through random values
 * before settling on the final text, with smooth width transitions.
 */
function SlotMachineText({
  text,
  scrambling,
  pool,
  className,
}: {
  text: string;
  scrambling: boolean;
  pool: string[];
  className?: string;
}) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const hiddenRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [displayText, setDisplayText] = useState(text);
  const scrambleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // When scrambling starts, cycle through random pool values
  useEffect(() => {
    if (scrambling && pool.length > 0) {
      // Start fast, showing random values
      let tick = 0;
      scrambleRef.current = setInterval(() => {
        const rand = pool[Math.floor(Math.random() * pool.length)];
        setDisplayText(rand);
        tick++;
        // Slow down after a few ticks by clearing and restarting slower
        if (tick > 6 && scrambleRef.current) {
          clearInterval(scrambleRef.current);
          scrambleRef.current = null;
        }
      }, 60);

      return () => {
        if (scrambleRef.current) {
          clearInterval(scrambleRef.current);
          scrambleRef.current = null;
        }
      };
    }
  }, [scrambling, pool]);

  // When scrambling stops, settle on the real text
  useEffect(() => {
    if (!scrambling) {
      setDisplayText(text);
    }
  }, [scrambling, text]);

  // Measure width of displayed text
  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth);
    }
  }, [displayText]);

  // Also measure on initial render with real text via hidden span
  useEffect(() => {
    if (hiddenRef.current && width === undefined) {
      setWidth(hiddenRef.current.offsetWidth);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      className="inline-block overflow-hidden align-bottom"
      style={{
        width: width !== undefined ? `${width}px` : "auto",
        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <span
        ref={measureRef}
        className={`inline-block whitespace-nowrap transition-opacity duration-200 ${className ?? ""}`}
        style={{
          opacity: scrambling ? 0.4 : 1,
          filter: scrambling ? "blur(1px)" : "none",
          transition: "opacity 0.2s ease, filter 0.2s ease",
        }}
      >
        {displayText}
      </span>
      {/* Hidden measurer for initial width */}
      <span
        ref={hiddenRef}
        className="absolute invisible whitespace-nowrap"
        aria-hidden
      >
        {text}
      </span>
    </span>
  );
}

interface HeroSectionProps {
  metadata: Metadata;
  availableYearsByCountry: Record<string, number[]>;
}

export default function HeroSection({
  metadata,
  availableYearsByCountry,
}: HeroSectionProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [scrambling, setScrambling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);

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

  // Pool of year strings for scramble effect
  const yearPool = useMemo(
    () => Array.from(new Set(allPairs.map((p) => String(p.year)))),
    [allPairs]
  );

  const pickRandom = useCallback(() => {
    if (allPairs.length === 0 || userInteractedRef.current) return;
    const pair = allPairs[Math.floor(Math.random() * allPairs.length)];

    // Start scramble
    setScrambling(true);

    // After scramble duration, settle on final values
    setTimeout(() => {
      setSelectedCountry(pair.country);
      setSelectedYear(pair.year);
      setScrambling(false);
    }, 500);
  }, [allPairs]);

  // Start rotating on mount
  useEffect(() => {
    pickRandom();
    intervalRef.current = setInterval(pickRandom, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pickRandom]);

  // Stop rotation when user interacts
  const stopRotation = useCallback(() => {
    userInteractedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScrambling(false);
  }, []);

  const handleCountryChange = useCallback(
    (country: string | null) => {
      stopRotation();
      setSelectedCountry(country);
      if (country) {
        const years = availableYearsByCountry[country] || [];
        if (years.length > 0) {
          setSelectedYear((prev) => {
            if (prev && years.includes(prev)) return prev;
            if (prev) {
              return years.reduce((a, b) =>
                Math.abs(b - prev) < Math.abs(a - prev) ? b : a
              );
            }
            return years[Math.floor(years.length / 2)];
          });
        } else {
          setSelectedYear(null);
        }
      } else {
        setSelectedYear(null);
      }
    },
    [stopRotation, availableYearsByCountry]
  );

  const handleYearChange = useCallback(
    (year: number | null) => {
      stopRotation();
      setSelectedYear(year);
    },
    [stopRotation]
  );

  const rawName = selectedCountry ? getCountryName(selectedCountry) : null;
  const needsThe = rawName && /^(United|Netherlands|Philippines)/i.test(rawName);
  const countryLabel = rawName
    ? (needsThe ? "the " : "") + rawName
    : "the world";

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
          What was{" "}
          <SlotMachineText
            text={countryLabel}
            scrambling={scrambling}
            pool={ALL_COUNTRY_NAMES}
            className={rawName ? "text-amber-400/90" : ""}
          />{" "}
          listening to
          {selectedYear ? (
            <>
              {" in "}
              <SlotMachineText
                text={String(selectedYear)}
                scrambling={scrambling}
                pool={yearPool}
                className="text-emerald-400/80"
              />
            </>
          ) : null}
          ?
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
          country={selectedCountry}
          year={selectedYear}
          onCountryChange={handleCountryChange}
          onYearChange={handleYearChange}
        />
      </div>
    </>
  );
}
