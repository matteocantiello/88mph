"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { getCountryName, COUNTRIES } from "@/lib/utils";
import { Metadata } from "@/lib/data";
import RandomButton from "./RandomButton";
import TimeTravelBrowser from "./TimeTravelBrowser";

const REEL_ITEMS = 8;

// Short display names for the drum
const DRUM_NAMES: Record<string, string> = {
  "United States": "the US",
  "United Kingdom": "the UK",
  "Netherlands": "Holland",
  "South Korea": "S. Korea",
  "South Africa": "S. Africa",
};

function drumLabel(name: string): string {
  return DRUM_NAMES[name] || name;
}

const ALL_DRUM_LABELS = Object.keys(COUNTRIES).map((c) =>
  drumLabel(getCountryName(c))
);

function drumFontScale(text: string): number {
  if (text.length <= 6) return 1;
  if (text.length <= 7) return 0.88;
  if (text.length <= 9) return 0.85;
  return 0.7;
}

/**
 * 3D rotating drum. Items are placed around a cylinder using CSS 3D transforms.
 * The cylinder rotates to show each item through a viewport window.
 */
function Drum3D({
  value,
  target,
  spinning,
  pool,
  className,
  drumWidth,
}: {
  value: string;
  target?: string;
  spinning: boolean;
  pool: string[];
  className?: string;
  drumWidth: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [reel, setReel] = useState<string[]>([value]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const prevValueRef = useRef(value);

  // Slot height and cylinder radius
  const [slotH, setSlotH] = useState(0);
  useEffect(() => {
    if (containerRef.current) {
      const fs = parseFloat(getComputedStyle(containerRef.current).fontSize);
      setSlotH(Math.ceil(fs * 1.35));
    }
  }, []);

  // Cylinder radius: r = h / (2 * sin(PI / n))
  const itemCount = reel.length;
  const angleStep = itemCount > 1 ? 360 / itemCount : 0;
  const radius =
    itemCount > 1 && slotH > 0
      ? slotH / (2 * Math.sin(Math.PI / itemCount))
      : 0;

  const landingValue = target ?? value;

  useEffect(() => {
    if (spinning) {
      const items: string[] = [prevValueRef.current];
      for (let i = 0; i < REEL_ITEMS; i++) {
        items.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      items.push(landingValue);
      setReel(items);
      setCurrentIndex(0);
      setAnimate(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
          setCurrentIndex(items.length - 1);
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
        setCurrentIndex(0);
        setAnimate(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [spinning, value]);

  const rotationAngle = -currentIndex * angleStep;

  return (
    <span
      ref={containerRef}
      className="inline-block overflow-hidden text-center"
      style={{
        width: drumWidth,
        height: slotH > 0 ? `${slotH}px` : "1.35em",
        verticalAlign: "baseline",
        marginBottom: "-0.35em",
        perspective: slotH > 0 ? `${slotH * 4}px` : "200px",
      }}
    >
      <span
        className="flex flex-col items-center"
        style={{
          transformStyle: itemCount > 1 ? "preserve-3d" : undefined,
          transform:
            itemCount > 1
              ? `translateZ(-${radius}px) rotateX(${rotationAngle}deg)`
              : undefined,
          transition: animate
            ? "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
            : "none",
          position: "relative",
          height: slotH > 0 ? `${slotH}px` : "1.35em",
        }}
      >
        {reel.map((item, i) => (
          <span
            key={`${i}-${item}`}
            className={`whitespace-nowrap ${className ?? ""}`}
            style={{
              position: itemCount > 1 ? "absolute" : "relative",
              height: slotH > 0 ? `${slotH}px` : "1.35em",
              lineHeight: slotH > 0 ? `${slotH}px` : "1.35",
              fontSize: `${drumFontScale(item)}em`,
              width: "100%",
              backfaceVisibility: "hidden",
              transform:
                itemCount > 1
                  ? `rotateX(${i * angleStep}deg) translateZ(${radius}px)`
                  : undefined,
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
  const [targetCountryLabel, setTargetCountryLabel] = useState<string>("");
  const [targetYearLabel, setTargetYearLabel] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);
  const targetRef = useRef<{ country: string; year: number } | null>(null);
  const shuffleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const landingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinningRef = useRef(false);

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

  const countryPool = useMemo(
    () =>
      Object.keys(availableYearsByCountry).filter(
        (c) => (availableYearsByCountry[c]?.length ?? 0) > 0
      ),
    [availableYearsByCountry]
  );

  const pickRandom = useCallback(() => {
    if (allPairs.length === 0 || userInteractedRef.current || spinningRef.current) return;
    const pair = allPairs[Math.floor(Math.random() * allPairs.length)];

    targetRef.current = pair;
    setTargetCountryLabel(drumLabel(getCountryName(pair.country)));
    setTargetYearLabel(String(pair.year));
    spinningRef.current = true;
    setSpinning(true);

    // Clean up any previous timers
    if (shuffleRef.current) {
      clearInterval(shuffleRef.current);
      shuffleRef.current = null;
    }
    if (landingTimerRef.current) {
      clearTimeout(landingTimerRef.current);
      landingTimerRef.current = null;
    }

    let tick = 0;
    shuffleRef.current = setInterval(() => {
      const randCountry =
        countryPool[Math.floor(Math.random() * countryPool.length)];
      const randYears = availableYearsByCountry[randCountry] || [];
      const randYear =
        randYears[Math.floor(Math.random() * randYears.length)];
      setSelectedCountry(randCountry);
      setSelectedYear(randYear);
      tick++;
      if (tick >= 6 && shuffleRef.current) {
        clearInterval(shuffleRef.current);
        shuffleRef.current = null;
      }
    }, 80);

    landingTimerRef.current = setTimeout(() => {
      if (shuffleRef.current) {
        clearInterval(shuffleRef.current);
        shuffleRef.current = null;
      }
      setSelectedCountry(pair.country);
      setSelectedYear(pair.year);
      spinningRef.current = false;
      setSpinning(false);
      landingTimerRef.current = null;
    }, 850);
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
    if (landingTimerRef.current) {
      clearTimeout(landingTimerRef.current);
      landingTimerRef.current = null;
    }
    spinningRef.current = false;
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
  const countryLabel = rawName ? drumLabel(rawName) : "";

  return (
    <>
      {/* Hero headline + CTA */}
      <div className="anim-slide-up text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-accent/50 mb-5 flex items-center justify-center gap-2">
          <span className="w-8 h-px bg-accent/30" />
          The past. On shuffle.
          <span className="w-8 h-px bg-accent/30" />
        </p>
        <h1 className="font-display text-[1.45rem] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.8] sm:leading-[1.3] tracking-tight text-foreground/90 mb-10">
          <span className="whitespace-nowrap">What was{" "}
          <Drum3D
            value={countryLabel}
            target={targetCountryLabel}
            spinning={spinning}
            pool={ALL_DRUM_LABELS}
            className="text-amber-400/90"
            drumWidth="2.6em"
          /></span>{" "}
          <span className="whitespace-nowrap">listening to in{" "}
          <Drum3D
            value={selectedYear ? String(selectedYear) : ""}
            target={targetYearLabel}
            spinning={spinning}
            pool={yearPool}
            className="text-[#39ff14]/80"
            drumWidth="1.8em"
          />{" "}
          ?</span>
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
