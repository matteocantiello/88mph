"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { getCountryName, COUNTRIES } from "@/lib/utils";
import { Metadata } from "@/lib/data";
import RandomButton from "./RandomButton";
import TimeTravelBrowser from "./TimeTravelBrowser";

const ALL_COUNTRY_NAMES = Object.keys(COUNTRIES).map((c) => getCountryName(c));
const REEL_ITEMS = 8; // number of random items before final value

/**
 * Vertical slot-machine reel. Builds a strip of [random, random, ..., final]
 * and scrolls through it with a decelerating CSS transition.
 */
function SlotReel({
  value,
  spinning,
  pool,
  className,
}: {
  value: string;
  spinning: boolean;
  pool: string[];
  className?: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [reel, setReel] = useState<string[]>([value]);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const prevValueRef = useRef(value);

  // Build the reel when spinning starts with a new value
  useEffect(() => {
    if (spinning) {
      // Build reel: current displayed value + random items + final value
      const items: string[] = [prevValueRef.current];
      for (let i = 0; i < REEL_ITEMS; i++) {
        items.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      items.push(value);
      setReel(items);
      setOffset(0);
      setAnimate(false);

      // Kick off the scroll on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
          setOffset(items.length - 1);
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  // When settling, update displayed value
  useEffect(() => {
    if (!spinning) {
      prevValueRef.current = value;
      // Collapse reel to just the final value (no animation)
      const timer = setTimeout(() => {
        setReel([value]);
        setOffset(0);
        setAnimate(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [spinning, value]);

  // Measure width — track the widest item in the reel for smooth container sizing
  const measureRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth);
    }
  }, [reel, offset, value]);

  // Height of one line (measured from container)
  const [lineHeight, setLineHeight] = useState(0);
  useEffect(() => {
    if (containerRef.current) {
      const style = getComputedStyle(containerRef.current);
      setLineHeight(parseFloat(style.lineHeight) || containerRef.current.offsetHeight || 48);
    }
  }, [reel]);

  return (
    <span
      ref={containerRef}
      className="inline-block overflow-hidden align-bottom"
      style={{
        width: width !== undefined ? `${width}px` : "auto",
        height: lineHeight > 0 ? `${lineHeight}px` : "1.1em",
        transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        verticalAlign: "bottom",
      }}
    >
      <span
        className="inline-flex flex-col"
        style={{
          transform: `translateY(-${offset * lineHeight}px)`,
          transition: animate
            ? `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)`
            : "none",
        }}
      >
        {reel.map((item, i) => {
          const isFinal = i === reel.length - 1 || reel.length === 1;
          return (
            <span
              key={`${i}-${item}`}
              ref={isFinal ? measureRef : undefined}
              className={`inline-block whitespace-nowrap ${className ?? ""}`}
              style={{
                height: lineHeight > 0 ? `${lineHeight}px` : "1.1em",
                lineHeight: lineHeight > 0 ? `${lineHeight}px` : "1.1",
              }}
            >
              {item}
            </span>
          );
        })}
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

    // Set the target values and start spinning
    setSelectedCountry(pair.country);
    setSelectedYear(pair.year);
    setSpinning(true);

    // Stop spinning after animation completes
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
          <SlotReel
            value={countryLabel}
            spinning={spinning}
            pool={ALL_COUNTRY_NAMES}
            className={rawName ? "text-amber-400/90" : ""}
          />{" "}
          listening to
          {selectedYear ? (
            <>
              {" in "}
              <SlotReel
                value={String(selectedYear)}
                spinning={spinning}
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
