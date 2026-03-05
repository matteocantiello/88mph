import { getMetadata, getChartData, getAvailableYears, ChartData } from "@/lib/data";
import { COUNTRIES } from "@/lib/utils";
import Image from "next/image";
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

  // Load 3 spotlight charts (only Spotify-enriched ones)
  const allEntries = metadata.charts.filter((e) => e.available);
  const spotlights = await pickSpotlightCharts(allEntries);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 postcard-hero pointer-events-none">
          <Image
            src="/hero.webp"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, #0c0b0a70 0%, #0c0b0a40 20%, #0c0b0a99 50%, #0c0b0aee 75%, #0c0b0a 100%)`,
            }}
          />
        </div>
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-6 md:pb-10">
          {/* Title + tagline */}
          <div className="anim-slide-up text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-accent/50 mb-5 flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-accent/30" />
              The past, on shuffle.
              <span className="w-8 h-px bg-accent/30" />
            </p>
            <h1 className="led-hero text-5xl sm:text-7xl md:text-[7rem] lg:text-[8.5rem] leading-[0.82] mb-5">
              8<span className="-ml-[0.08em]">8</span>mph
            </h1>
            <p className="font-body text-foreground/40 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-8">
              No algorithm. No &lsquo;you might also like.&rsquo; Just what the world was
              actually listening to — whether you were there or not.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <RandomButton metadata={metadata} />
              <span className="text-foreground/20 text-sm font-body hidden sm:inline">or</span>
              <span className="text-foreground/30 text-sm font-body">
                Pick a destination below ↓
              </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-8 md:gap-12 pt-6 border-t border-white/[0.06]">
              <div className="text-center">
                <span className="font-display text-2xl md:text-3xl text-accent/80">{totalCharts}</span>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/25 mt-1">Charts</p>
              </div>
              <div className="text-center">
                <span className="font-display text-2xl md:text-3xl text-accent/80">19</span>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/25 mt-1">Countries</p>
              </div>
              <div className="text-center">
                <span className="font-display text-2xl md:text-3xl text-accent/80">1940</span>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/25 mt-1">Earliest</p>
              </div>
            </div>
          </div>

          {/* Full-width Map + Time Circuit */}
          <div className="anim-slide-up" style={{ animationDelay: "0.1s" }}>
            <TimeTravelBrowser
              availableYearsByCountry={availableYearsByCountry}
              hideHeader
            />
          </div>
        </div>
      </header>

      {/* Spotlight Charts */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="divider-animated" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-foreground/80">
              Now Playing Somewhere
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spotlights.map((chart, i) => (
              <SpotlightCard key={`${chart.country}-${chart.year}`} chart={chart} index={i} />
            ))}
          </div>
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

function SpotlightCard({ chart }: { chart: ChartData; index: number }) {
  const theme = getThemeForYear(chart.year);

  return (
    <Link
      href={`/${chart.country}/${chart.year}`}
      className="spotlight-card group block rounded-2xl overflow-hidden border border-white/[0.05] relative transition-all duration-500 hover:border-white/[0.1] p-5"
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
            <span className="text-base">{getCountryFlag(chart.country)}</span>
            <span
              className="text-[10px] font-body font-medium uppercase tracking-[0.15em] opacity-40"
              style={{ color: theme.foreground }}
            >
              {getCountryName(chart.country)}
            </span>
          </div>
          <span
            className="font-display text-3xl leading-none opacity-80"
            style={{ color: theme.accent }}
          >
            {chart.year}
          </span>
        </div>

        {/* Track list */}
        <div>
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
                className="text-[11px] font-body opacity-35 truncate shrink-0 max-w-[140px] text-right hidden sm:block"
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

function hasSpotifyData(chart: ChartData): boolean {
  return chart.tracks.some((t) => !!t.spotifyUri || !!t.previewUrl);
}

async function pickSpotlightCharts(entries: { country: string; year: number }[]): Promise<ChartData[]> {
  const eraBuckets: [number, number][] = [
    [1940, 1980],
    [1981, 2005],
    [2006, 2030],
  ];

  const picks: ChartData[] = [];
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
    // Try candidates until we find one with Spotify data
    for (const candidate of candidates) {
      const chart = await getChartData(candidate.country, candidate.year);
      if (chart && hasSpotifyData(chart)) {
        picks.push(chart);
        usedCountries.add(candidate.country);
        break;
      }
    }
  }

  return picks;
}
