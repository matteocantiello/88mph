"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { getCountryName, COUNTRIES } from "@/lib/utils";
import { Metadata } from "@/lib/data";
import RandomButton from "./RandomButton";
import TimeTravelBrowser from "./TimeTravelBrowser";

const ALL_COUNTRY_NAMES = Object.keys(COUNTRIES).map((c) => getCountryName(c));
const REEL_ITEMS = 8;

// Prepend "the" for country labels used in the drum
function formatCountryLabel(name: string): string {
  if (/^(United|Netherlands|Philippines)/i.test(name)) return "the " + name;
  return name;
}

// All labels with "the" prefix where needed, for the pool
const ALL_COUNTRY_LABELS = ALL_COUNTRY_NAMES.map(formatCountryLabel);

// Font scale factor: shorter names stay at 1, long ones shrink slightly
function fontScale(text: string): number {
  if (text.length <= 8) return 1;
  if (text.length <= 14) return 0.85;
  return 0.72;
}

/**
 * Fixed-width drum that vertically scrolls through values.
 * Width is constant (set via CSS), text is centered and scaled to fit.
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
  drumWidth: string; // CSS width like "8em"
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [reel, setReel] = useState<string[]>([value]);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const prevValueRef = useRef(value);

  const [lineHeight, setLineHeight] = useState(0);
  useEffect(() => {
    if (containerRef.current) {
      const h = containerRef.current.parentElement?.offsetHeight;
      if (h) {
        setLineHeight(h);
      } else {
        const style = getComputedStyle(containerRef.current);
        setLineHeight(parseFloat(style.fontSize) * 1.1 || 48);
      }
    }
  }, []);

  // Build reel on spin
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

  // Settle
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
      className="inline-block overflow-hidden align-bottom text-center"
      style={{
        width: drumWidth,
        height: lineHeight > 0 ? `${lineHeight}px` : "1.1em",
        verticalAlign: "bottom",
        borderBottom: "2px solid rgba(255,255,255,0.06)",
        borderRadius: "2px",
      }}
    >
      <span
        className="flex flex-col items-center"
        style={{
          transform: `translateY(-${offset * (lineHeight || 0)}px)`,
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
              height: lineHeight > 0 ? `${lineHeight}px` : "1.1em",
              lineHeight: lineHeight > 0 ? `${lineHeight}px` : "1.1",
              fontSize: `${fontScale(item)}em`,
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

  const pickRandom = useCallback(() => {
    if (allPairs.length === 0 || userInteractedRef.current) return;
    const pair = allPairs[Math.floor(Math.random() * allPairs.length)];

    setSelectedCountry(pair.country);
    setSelectedYear(pair.year);
    setSpinning(true);

    setTimeout(() => {
      setSpinning(false);
    }, 800);
  }, [allPairs]);

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
        <h1 className="font-display text-[1.45rem] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground/90 mb-10 whitespace-nowrap">
          What was{" "}
          <SlotDrum
            value={countryLabel}
            spinning={spinning}
            pool={ALL_COUNTRY_LABELS}
            className="text-amber-400/90"
            drumWidth="7.5em"
          />{" "}
          listening to in{" "}
          <SlotDrum
            value={selectedYear ? String(selectedYear) : "----"}
            spinning={spinning}
            pool={yearPool}
            className="text-emerald-400/80"
            drumWidth="2.8em"
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
