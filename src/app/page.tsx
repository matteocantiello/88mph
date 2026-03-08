import { getMetadata, getChartData, getAvailableYears, ChartData } from "@/lib/data";
import { COUNTRIES } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import TripCounter from "@/components/TripCounter";

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
      <header className="relative overflow-x-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 postcard-hero pointer-events-none">
          <Image
            src="/og.webp"
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

        <div className="relative max-w-7xl mx-auto px-6 pt-6 md:pt-8 pb-6 md:pb-10">
          {/* Top bar: logo */}
          <div className="anim-fade mb-8 md:mb-12">
            <span className="led-hero text-3xl md:text-4xl leading-none">
              8<span className="-ml-[0.04em]">8</span>mph
            </span>
          </div>

          {/* Hero headline + Map + Time Circuit */}
          <HeroSection
            metadata={metadata}
            availableYearsByCountry={availableYearsByCountry}
          />
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
            <p className="font-body text-[11px] text-foreground/10 mt-1 flex items-center gap-1.5">
              Created by{" "}
              <a href="https://matteocantiello.com/" target="_blank" rel="noopener noreferrer" className="text-foreground/25 hover:text-accent transition-colors">
                @kantyellow
              </a>
              <a href="https://soundcloud.com/etrurian" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-[#ff5500] transition-colors ml-1" aria-label="SoundCloud">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.05-.1-.1-.1m-.9 1.05c-.059 0-.1.04-.109.1l-.175 1.1.175 1.08c.01.06.05.098.109.098.057 0 .1-.04.108-.098l.2-1.08-.2-1.1c-.008-.06-.05-.1-.108-.1m1.83-.98c-.064 0-.11.045-.12.1l-.217 2.034.218 1.965c.01.06.055.1.119.1.063 0 .11-.04.12-.1l.248-1.965-.249-2.034c-.01-.06-.056-.1-.12-.1m.93-.39c-.073 0-.121.045-.131.1l-.2 2.424.2 2.295c.01.065.058.1.131.1.072 0 .12-.035.131-.1l.228-2.295-.228-2.424c-.011-.06-.059-.1-.131-.1m.928-.16c-.081 0-.131.039-.141.1l-.186 2.584.186 2.445c.01.07.06.1.141.1s.13-.03.141-.1l.209-2.445-.209-2.584c-.011-.066-.06-.1-.141-.1m.93-.13c-.09 0-.14.04-.15.1l-.17 2.714.17 2.565c.01.07.06.1.15.1.09 0 .14-.03.15-.1l.19-2.565-.19-2.714c-.01-.065-.06-.1-.15-.1m.96-.1c-.1 0-.15.04-.16.1l-.15 2.814.15 2.635c.01.075.06.11.16.11.098 0 .15-.035.16-.11l.17-2.635-.17-2.814c-.01-.065-.062-.1-.16-.1m.973-.03c-.109 0-.16.04-.168.11l-.139 2.844.139 2.665c.008.075.06.11.168.11.108 0 .16-.035.17-.11l.155-2.665-.155-2.844c-.01-.07-.062-.11-.17-.11m1.01-.05c-.117 0-.168.04-.176.12l-.123 2.884.123 2.695c.008.08.059.12.176.12.115 0 .168-.04.176-.12l.14-2.695-.14-2.884c-.008-.08-.061-.12-.176-.12m1.024.12c-.125 0-.176.04-.184.12l-.11 2.764.11 2.725c.008.085.059.12.184.12.124 0 .176-.035.184-.12l.125-2.725-.125-2.764c-.008-.08-.06-.12-.184-.12m4.15-1.465c-.2 0-.395.025-.585.074-.12-1.35-1.275-2.404-2.67-2.404-.35 0-.69.065-1 .18-.12.045-.16.09-.16.18v4.95c0 .095.07.17.16.18h4.255c.87 0 1.575-.705 1.575-1.575s-.705-1.585-1.575-1.585" />
                </svg>
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TripCounter />
            <span className="w-px h-3 bg-foreground/10" />
            <p className="font-body text-[11px] text-foreground/10">
              {Object.keys(COUNTRIES).length} countries &middot; {totalCharts} charts
            </p>
            <span className="w-px h-3 bg-foreground/10" />
            <Link
              href="/suggest"
              className="font-body text-[11px] text-foreground/25 hover:text-accent transition-colors"
            >
              Suggest a chart
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* Spotlight card shown in the hero */
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
