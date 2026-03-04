"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Metadata, getAvailableYears } from "@/lib/data";
import { COUNTRIES } from "@/lib/utils";

interface RandomButtonProps {
  metadata: Metadata;
}

export default function RandomButton({ metadata }: RandomButtonProps) {
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
      className={`group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full font-body font-semibold text-sm tracking-wide transition-all duration-500 ${
        spinning
          ? "bg-accent/10 text-accent border border-accent/30 scale-95"
          : "bg-surface-raised/80 text-foreground/60 border border-white/[0.06] hover:border-accent/30 hover:text-accent hover:bg-accent/[0.06] hover:shadow-[0_0_40px_-10px] hover:shadow-accent/20"
      }`}
    >
      {/* Vinyl disc icon */}
      <span className={`inline-block text-lg transition-transform duration-500 ${spinning ? "vinyl-spin" : "group-hover:rotate-90"}`}>
        &#x25C9;
      </span>
      <span>{spinning ? "Teleporting..." : "Random Era"}</span>

      {/* Subtle shimmer on hover */}
      <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </span>
    </button>
  );
}
