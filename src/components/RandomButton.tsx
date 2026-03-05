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
      className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-body font-bold text-base tracking-wide transition-all duration-500 ${
        spinning
          ? "bg-accent/20 text-accent border-2 border-accent/40 scale-95"
          : "bg-accent text-background border-2 border-accent hover:bg-accent/90 hover:shadow-[0_0_50px_-5px] hover:shadow-accent/40 hover:scale-105"
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
