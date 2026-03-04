import { getMetadata, getChartData, getAvailableYears, ChartData } from "@/lib/data";
import { COUNTRIES } from "@/lib/utils";
import RandomButton from "@/components/RandomButton";
import TimeTravelBrowser from "@/components/TimeTravelBrowser";

export default async function HomePage() {
  const metadata = await getMetadata();

  // Compute available years by country from metadata (no chart JSON loading needed)
  const availableYearsByCountry: Record<string, number[]> = {};
  let totalCharts = 0;
  for (const countryCode of Object.keys(COUNTRIES)) {
    const years = getAvailableYears(metadata, countryCode);
    availableYearsByCountry[countryCode] = years;
    totalCharts += years.length;
  }

  // Load only the 3 spotlight charts
  const allEntries = metadata.charts.filter((e) => e.available);
  const spotlightEntries = pickSpotlightEntries(allEntries);
  const spotlights: ChartData[] = [];
  for (const entry of spotlightEntries) {
    const chart = await getChartData(entry.country, entry.year);
    if (chart) spotlights.push(chart);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[180px] opacity-[0.04] bg-accent" />

        <div className="relative max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-6 md:pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-10 lg:gap-16 items-start">
            {/* Left: Title + CTA */}
            <div className="anim-slide-up">
              <p className="font-body text-[10px] uppercase tracking-[0.35em] text-accent/50 mb-5 flex items-center gap-2">
                <span className="w-8 h-px bg-accent/30" />
                The past, on shuffle.
              </p>
              <h1 className="led-hero text-5xl sm:text-7xl md:text-[7rem] lg:text-[8.5rem] leading-[0.82] mb-5">
                8<span className="-ml-[0.08em]">8</span>mph
              </h1>
              <p className="font-body text-foreground/30 text-base md:text-lg max-w-md leading-relaxed mb-8">
                No algorithm. No &lsquo;you might also like.&rsquo; Just what the world was
                actually listening to — whether you were there or not.
              </p>
              <div className="flex items-center gap-5">
                <RandomButton metadata={metadata} />
                <span className="text-foreground/12 text-sm font-body">
                  or explore below
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-8 mt-10 pt-8 border-t border-white/[0.04]">
                <div>
                  <span className="font-display text-3xl text-accent/80">{totalCharts}</span>
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/20 mt-1">Charts</p>
                </div>
                <div>
                  <span className="font-display text-3xl text-accent/80">19</span>
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/20 mt-1">Countries</p>
                </div>
                <div>
                  <span className="font-display text-3xl text-accent/80">1940</span>
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/20 mt-1">Earliest</p>
                </div>
              </div>
            </div>

            {/* Right: Spotlight Charts */}
            <div className="anim-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="space-y-3">
                {spotlights.map((chart, i) => (
                  <SpotlightCard key={`${chart.country}-${chart.year}`} chart={chart} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Region Browser */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="divider-animated" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <TimeTravelBrowser
            availableYearsByCountry={availableYearsByCountry}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-white/[0.04]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg text-foreground/15">88mph</p>
            <p className="font-body text-[11px] text-foreground/10 mt-1">
              Previews powered by Spotify. Data is illustrative.
            </p>
          </div>
          <p className="font-body text-[11px] text-foreground/10">
            {Object.keys(COUNTRIES).length} countries &middot; {totalCharts} charts
          </p>
        </div>
      </footer>
    </main>
  );
}

/* Spotlight card shown in the hero */
import Link from "next/link";
import { getCountryFlag, getCountryName } from "@/lib/utils";
import { getThemeForYear } from "@/lib/themes";

function SpotlightCard({ chart, index }: { chart: ChartData; index: number }) {
  const theme = getThemeForYear(chart.year);
  const isFirst = index === 0;

  return (
    <Link
      href={`/${chart.country}/${chart.year}`}
      className={`spotlight-card group block rounded-2xl overflow-hidden border border-white/[0.05] relative transition-all duration-500 hover:border-white/[0.1] ${
        isFirst ? "p-4 md:p-6 lg:p-7" : "p-5"
      }`}
      style={{ background: theme.gradient }}
    >
      {/* Accent glow */}
      <div
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-15 group-hover:opacity-25 transition-opacity duration-700"
        style={{ background: theme.accent }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={isFirst ? "text-xl" : "text-base"}>{getCountryFlag(chart.country)}</span>
            <span
              className="text-[10px] font-body font-medium uppercase tracking-[0.15em] opacity-40"
              style={{ color: theme.foreground }}
            >
              {getCountryName(chart.country)}
            </span>
          </div>
          <span
            className={`font-display leading-none opacity-80 ${isFirst ? "text-4xl md:text-5xl" : "text-3xl"}`}
            style={{ color: theme.accent }}
          >
            {chart.year}
          </span>
        </div>

        {/* Track list */}
        <div className={isFirst ? "space-y-0" : "space-y-0"}>
          {chart.tracks.slice(0, 3).map((track) => (
            <div
              key={track.rank}
              className="flex items-baseline gap-3 py-[5px] border-b last:border-b-0"
              style={{ borderColor: `${theme.foreground}08` }}
            >
              <span
                className="font-display text-xs w-4 shrink-0 text-right tabular-nums opacity-25"
                style={{ color: theme.foreground }}
              >
                {track.rank}
              </span>
              <span
                className="text-[13px] font-body font-medium truncate flex-1"
                style={{ color: theme.foreground, opacity: 0.85 }}
              >
                {track.title}
              </span>
              <span
                className="text-[11px] font-body opacity-35 truncate shrink-0 max-w-[140px] text-right"
                style={{ color: theme.foreground }}
              >
                {track.artist}
              </span>
            </div>
          ))}
        </div>

        {/* View hint */}
        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[11px] font-body font-medium tracking-wide" style={{ color: theme.accent }}>
            View full chart
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: theme.accent }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function pickSpotlightEntries(entries: { country: string; year: number }[]): { country: string; year: number }[] {
  const eraBuckets: [number, number][] = [
    [1940, 1980],
    [1981, 2005],
    [2006, 2030],
  ];

  const picks: { country: string; year: number }[] = [];
  const usedCountries = new Set<string>();

  for (const [lo, hi] of eraBuckets) {
    const candidates = entries.filter(
      (c) => c.year >= lo && c.year <= hi && !usedCountries.has(c.country)
    );
    // Fisher-Yates shuffle
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const pick = candidates[0];
    if (pick) {
      picks.push(pick);
      usedCountries.add(pick.country);
    }
  }

  return picks;
}
