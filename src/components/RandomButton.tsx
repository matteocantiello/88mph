"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Metadata, getAvailableYears } from "@/lib/data";
import { COUNTRIES } from "@/lib/utils";

interface RandomButtonProps {
  metadata: Metadata;
  compact?: boolean;
}

export default function RandomButton({ metadata, compact = false }: RandomButtonProps) {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  const teleport = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    const countries = Object.keys(COUNTRIES);
    const country = countries[Math.floor(Math.random() * countries.length)];
    const years = getAvailableYears(metadata, country);
    if (years.length === 0) {
      setSpinning(false);
      return;
    }
    const year = years[Math.floor(Math.random() * years.length)];

    setTimeout(() => {
      router.push(`/${country}/${year}`);
      setSpinning(false);
    }, 1400);
  }, [metadata, router, spinning]);

  return (
    <button
      onClick={teleport}
      disabled={spinning}
      className={`group relative inline-flex items-center rounded-full font-body font-bold tracking-wide transition-all duration-500 ${
        compact
          ? `gap-2 px-4 py-2 text-xs ${
              spinning
                ? "bg-accent/10 text-accent border border-accent/30 scale-95"
                : "bg-white/[0.04] text-foreground/50 border border-white/[0.08] hover:border-accent/30 hover:text-accent hover:bg-accent/[0.06]"
            }`
          : `gap-2 px-6 py-3 text-sm sm:gap-3 sm:px-8 sm:py-4 sm:text-base ${
              spinning
                ? "bg-accent/20 text-accent border-2 border-accent/40 scale-95"
                : "bg-accent text-background border-2 border-accent hover:bg-accent/90 hover:shadow-[0_0_50px_-5px] hover:shadow-accent/40 hover:scale-105"
            }`
      }`}
    >
      {/* Vinyl disc icon */}
      <span className={`inline-block ${compact ? "text-sm" : "text-lg"} transition-transform duration-500 ${spinning ? "vinyl-spin" : "group-hover:rotate-90"}`}>
        &#x25C9;
      </span>
      <span>{spinning ? "Teleporting..." : compact ? "Random" : "Random Era"}</span>

      {/* Subtle shimmer on hover */}
      <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </span>
    </button>
  );
}
