"use client";

import { useState } from "react";
import Link from "next/link";
import { ChartData, Metadata, getAvailableYears } from "@/lib/data";
import { COUNTRIES, Region } from "@/lib/utils";
import { getThemeForYear } from "@/lib/themes";

interface CountryBrowserProps {
  regions: Region[];
  chartsByCountry: Record<string, ChartData[]>;
  metadata: Metadata;
}

export default function CountryBrowser({
  regions,
  chartsByCountry,
  metadata,
}: CountryBrowserProps) {
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>(regions[0].name);

  const currentRegion = regions.find((r) => r.name === activeRegion) || regions[0];
  const selectedCountry = activeCountry || currentRegion.countries[0];
  const charts = chartsByCountry[selectedCountry] || [];

  return (
    <div>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display text-3xl md:text-4xl text-foreground/80">
          Browse by Country
        </h2>
        <span className="font-body text-[11px] text-foreground/15 tracking-wide">
          {Object.keys(COUNTRIES).length} countries
        </span>
      </div>

      {/* Region tabs */}
      <div className="flex flex-wrap gap-1 mb-6">
        {regions.map((region) => (
          <button
            key={region.name}
            onClick={() => {
              setActiveRegion(region.name);
              setActiveCountry(null);
            }}
            className={`px-4 py-2 rounded-lg font-body text-xs font-medium tracking-wide transition-all duration-300 ${
              activeRegion === region.name
                ? "bg-accent/10 text-accent border border-accent/20"
                : "text-foreground/25 border border-transparent hover:text-foreground/50 hover:bg-white/[0.02]"
            }`}
          >
            {region.name}
            <span className="ml-1.5 opacity-50">{region.countries.length}</span>
          </button>
        ))}
      </div>

      {/* Country pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {currentRegion.countries.map((code) => {
          const isActive = selectedCountry === code;
          const years = getAvailableYears(metadata, code);
          return (
            <button
              key={code}
              onClick={() => setActiveCountry(code)}
              className={`country-pill flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm transition-all duration-300 ${
                isActive
                  ? "bg-white/[0.06] text-foreground border border-white/[0.08] shadow-lg shadow-black/20"
                  : "text-foreground/35 border border-transparent hover:text-foreground/60 hover:bg-white/[0.02]"
              }`}
            >
              <span className="text-base">{COUNTRIES[code]?.flag}</span>
              <span className="font-medium">{COUNTRIES[code]?.name}</span>
              <span className={`text-[10px] ml-1 ${isActive ? "text-accent/60" : "opacity-40"}`}>
                {years.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart grid for selected country */}
      <div className="country-charts-grid">
        {/* Country header with timeline */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{COUNTRIES[selectedCountry]?.flag}</span>
          <div>
            <h3 className="font-display text-2xl text-foreground/80">
              {COUNTRIES[selectedCountry]?.name}
            </h3>
            <p className="font-body text-[11px] text-foreground/20 tracking-wide">
              {charts.length} charts &middot;{" "}
              {charts.length > 0
                ? `${charts[0].year} \u2013 ${charts[charts.length - 1].year}`
                : "No charts"}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {charts.map((chart, i) => (
            <CountryChartCard key={chart.year} chart={chart} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CountryChartCard({ chart, index }: { chart: ChartData; index: number }) {
  const theme = getThemeForYear(chart.year);

  return (
    <Link
      href={`/${chart.country}/${chart.year}`}
      className="era-card group block rounded-xl overflow-hidden border border-white/[0.04] relative"
      style={{
        background: theme.gradient,
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Glow */}
      <div
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: theme.accent }}
      />

      <div className="relative p-5">
        {/* Year */}
        <div className="flex items-center justify-between mb-3">
          <h4
            className="font-display text-3xl leading-none"
            style={{ color: theme.accent }}
          >
            {chart.year}
          </h4>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-0 group-hover:opacity-60 transition-opacity duration-300"
            style={{ color: theme.accent }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        {/* Context teaser */}
        {chart.context && (
          <p
            className="text-[11px] font-body leading-relaxed mb-3 line-clamp-2 opacity-35"
            style={{ color: theme.foreground }}
          >
            {chart.context}
          </p>
        )}

        {/* Top songs */}
        <div>
          {chart.tracks.slice(0, 5).map((track) => (
            <div
              key={track.rank}
              className="flex items-baseline gap-2.5 py-[4px] border-b last:border-b-0"
              style={{ borderColor: `${theme.foreground}06` }}
            >
              <span
                className="font-display text-[10px] w-3.5 shrink-0 text-right tabular-nums opacity-20"
                style={{ color: theme.foreground }}
              >
                {track.rank}
              </span>
              <div className="min-w-0 flex-1">
                <span
                  className="text-[12px] font-body font-medium truncate block leading-snug"
                  style={{ color: theme.foreground, opacity: 0.8 }}
                >
                  {track.title}
                </span>
                <span
                  className="text-[10px] font-body opacity-30 truncate block"
                  style={{ color: theme.foreground }}
                >
                  {track.artist}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* +N more */}
        {chart.tracks.length > 5 && (
          <p
            className="text-[10px] font-body mt-2 opacity-20"
            style={{ color: theme.foreground }}
          >
            +{chart.tracks.length - 5} more
          </p>
        )}
      </div>
    </Link>
  );
}
