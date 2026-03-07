"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { getCountryName, COUNTRIES } from "@/lib/utils";
import { Metadata } from "@/lib/data";
import RandomButton from "./RandomButton";
import TimeTravelBrowser from "./TimeTravelBrowser";

const ALL_COUNTRY_NAMES = Object.keys(COUNTRIES).map((c) => getCountryName(c));
const REEL_ITEMS = 8;

function formatCountryLabel(name: string): string {
  if (/^(United|Netherlands|Philippines)/i.test(name)) return "the " + name;
  return name;
}

const ALL_COUNTRY_LABELS = ALL_COUNTRY_NAMES.map(formatCountryLabel);

/**
 * Fixed-width vertical slot drum. Items scroll vertically with deceleration.
 * Uses a generous slot height (1.3em) to avoid clipping descenders.
 */
function SlotDrum({
  value,
  spinning,
  pool,
  className,
  drumWidth,
}: {
  value: string;
  spinning: boolean;
  pool: string[];
  className?: string;
  drumWidth: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [reel, setReel] = useState<string[]>([value]);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const prevValueRef = useRef(value);

  // Slot height in px — measured from font size
  const [slotH, setSlotH] = useState(0);
  useEffect(() => {
    if (containerRef.current) {
      const fs = parseFloat(getComputedStyle(containerRef.current).fontSize);
      setSlotH(Math.ceil(fs * 1.3));
    }
  }, []);

  useEffect(() => {
    if (spinning) {
      const items: string[] = [prevValueRef.current];
      for (let i = 0; i < REEL_ITEMS; i++) {
        items.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      items.push(value);
      setReel(items);
      setOffset(0);
      setAnimate(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
          setOffset(items.length - 1);
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  useEffect(() => {
    if (!spinning) {
      prevValueRef.current = value;
      const timer = setTimeout(() => {
        setReel([value]);
        setOffset(0);
        setAnimate(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [spinning, value]);

  return (
    <span
      ref={containerRef}
      className="inline-block overflow-hidden text-center"
      style={{
        width: drumWidth,
        height: slotH > 0 ? `${slotH}px` : "1.3em",
        verticalAlign: "baseline",
        position: "relative",
        top: "0.05em",
      }}
    >
      <span
        className="flex flex-col items-center"
        style={{
          transform: `translateY(-${offset * slotH}px)`,
          transition: animate
            ? "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)"
            : "none",
        }}
      >
        {reel.map((item, i) => (
          <span
            key={`${i}-${item}`}
            className={`block whitespace-nowrap ${className ?? ""}`}
            style={{
              height: slotH > 0 ? `${slotH}px` : "1.3em",
              lineHeight: slotH > 0 ? `${slotH}px` : "1.3",
            }}
          >
            {item}
          </span>
        ))}
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
  const [spinning, setSpinning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);
  const targetRef = useRef<{ country: string; year: number } | null>(null);
  const shuffleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allPairs = useMemo(() => {
    const pairs: { country: string; year: number }[] = [];
    for (const [country, years] of Object.entries(availableYearsByCountry)) {
      for (const year of years) {
        pairs.push({ country, year });
      }
    }
    return pairs;
  }, [availableYearsByCountry]);

  const yearPool = useMemo(
    () => Array.from(new Set(allPairs.map((p) => String(p.year)))),
    [allPairs]
  );

  // Countries with charts for map shuffling
  const countryPool = useMemo(
    () => Object.keys(availableYearsByCountry).filter(
      (c) => (availableYearsByCountry[c]?.length ?? 0) > 0
    ),
    [availableYearsByCountry]
  );

  const pickRandom = useCallback(() => {
    if (allPairs.length === 0 || userInteractedRef.current) return;
    const pair = allPairs[Math.floor(Math.random() * allPairs.length)];

    // Store the final target
    targetRef.current = pair;

    // Start drum spin (headline)
    setSpinning(true);

    // Shuffle map/circuit through random countries+years during spin
    let tick = 0;
    shuffleRef.current = setInterval(() => {
      const randCountry = countryPool[Math.floor(Math.random() * countryPool.length)];
      const randYears = availableYearsByCountry[randCountry] || [];
      const randYear = randYears[Math.floor(Math.random() * randYears.length)];
      setSelectedCountry(randCountry);
      setSelectedYear(randYear);
      tick++;
      if (tick >= 6 && shuffleRef.current) {
        clearInterval(shuffleRef.current);
        shuffleRef.current = null;
      }
    }, 80);

    // Settle on final value
    setTimeout(() => {
      if (shuffleRef.current) {
        clearInterval(shuffleRef.current);
        shuffleRef.current = null;
      }
      setSelectedCountry(pair.country);
      setSelectedYear(pair.year);
      setSpinning(false);
    }, 700);
  }, [allPairs, countryPool, availableYearsByCountry]);

  useEffect(() => {
    pickRandom();
    intervalRef.current = setInterval(pickRandom, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pickRandom]);

  const stopRotation = useCallback(() => {
    userInteractedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (shuffleRef.current) {
      clearInterval(shuffleRef.current);
      shuffleRef.current = null;
    }
    // Settle on target if mid-spin
    if (targetRef.current) {
      setSelectedCountry(targetRef.current.country);
      setSelectedYear(targetRef.current.year);
    }
    setSpinning(false);
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
  const countryLabel = rawName ? formatCountryLabel(rawName) : "the world";

  return (
    <>
      {/* Hero headline + CTA */}
      <div className="anim-slide-up text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-accent/50 mb-5 flex items-center justify-center gap-2">
          <span className="w-8 h-px bg-accent/30" />
          The past. On shuffle.
          <span className="w-8 h-px bg-accent/30" />
        </p>
        <h1 className="font-display text-[1.45rem] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.3] tracking-tight text-foreground/90 mb-10 whitespace-nowrap">
          What was{" "}
          <SlotDrum
            value={countryLabel}
            spinning={spinning}
            pool={ALL_COUNTRY_LABELS}
            className="text-amber-400/90"
            drumWidth="5.5em"
          />{" "}
          listening to in{" "}
          <SlotDrum
            value={selectedYear ? String(selectedYear) : "----"}
            spinning={spinning}
            pool={yearPool}
            className="text-emerald-400/80"
            drumWidth="2.6em"
          />
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
