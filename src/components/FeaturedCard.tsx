"use client";

import Link from "next/link";
import { ChartData } from "@/lib/data";
import { getCountryFlag, getCountryName } from "@/lib/utils";
import { getThemeForYear, applyTheme } from "@/lib/themes";

interface FeaturedCardProps {
  chart: ChartData;
  index: number;
}

export default function FeaturedCard({ chart, index }: FeaturedCardProps) {
  const theme = getThemeForYear(chart.year);
  const vars = applyTheme(theme);

  return (
    <Link
      href={`/${chart.country}/${chart.year}`}
      className="era-card group block rounded-2xl overflow-hidden border border-white/[0.04] relative"
      style={{
        ...vars as React.CSSProperties,
        animationDelay: `${index * 80}ms`,
        background: theme.gradient,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
        style={{ background: theme.accent }}
      />

      <div className="relative p-6 pb-5">
        {/* Header: Country pill + Year */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{getCountryFlag(chart.country)}</span>
            <span
              className="text-[11px] font-body font-medium uppercase tracking-[0.15em] opacity-50"
              style={{ color: theme.foreground }}
            >
              {getCountryName(chart.country)}
            </span>
          </div>
          <span
            className="font-display text-5xl md:text-6xl leading-none opacity-[0.12] select-none"
            style={{ color: theme.accent }}
          >
            {chart.year}
          </span>
        </div>

        {/* Year display */}
        <h3
          className="font-display text-4xl md:text-5xl mb-4 leading-none"
          style={{ color: theme.accent }}
        >
          {chart.year}
        </h3>

        {/* Context teaser */}
        {chart.context && (
          <p
            className="text-[13px] font-body leading-relaxed mb-5 line-clamp-2 opacity-50"
            style={{ color: theme.foreground }}
          >
            {chart.context}
          </p>
        )}

        {/* Top 5 songs */}
        <div className="space-y-0">
          {chart.tracks.slice(0, 5).map((track) => (
            <div
              key={track.rank}
              className="flex items-baseline gap-3 py-[6px] border-b last:border-b-0"
              style={{ borderColor: `${theme.foreground}08` }}
            >
              <span
                className="font-display text-sm w-5 shrink-0 text-right tabular-nums opacity-30"
                style={{ color: theme.foreground }}
              >
                {track.rank}
              </span>
              <div className="min-w-0 flex-1">
                <span
                  className="text-sm font-body font-medium truncate block"
                  style={{ color: theme.foreground }}
                >
                  {track.title}
                </span>
              </div>
              <span
                className="text-xs font-body opacity-40 truncate shrink-0 max-w-[120px] text-right"
                style={{ color: theme.foreground }}
              >
                {track.artist}
              </span>
            </div>
          ))}
        </div>

        {/* "View all" hint */}
        <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className="text-xs font-body font-medium tracking-wide"
            style={{ color: theme.accent }}
          >
            View full chart
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: theme.accent }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
