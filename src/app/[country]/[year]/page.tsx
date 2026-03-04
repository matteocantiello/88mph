import { notFound } from "next/navigation";
import Link from "next/link";
import { getChartData, getMetadata, getAdjacentYears } from "@/lib/data";
import { getCountryName, getCountryFlag, isValidCountry, isValidYear } from "@/lib/utils";
import { getThemeForYear, applyTheme } from "@/lib/themes";
import ChartList from "@/components/ChartList";
import EraContext from "@/components/EraContext";
import TimeSelector from "@/components/TimeSelector";
import LastDepartedTracker from "@/components/LastDepartedTracker";

interface PageProps {
  params: { country: string; year: string };
}

export default async function ChartPage({ params }: PageProps) {
  const country = params.country;
  const year = parseInt(params.year, 10);

  if (!isValidCountry(country) || !isValidYear(year)) {
    notFound();
  }

  const [chart, metadata] = await Promise.all([
    getChartData(country, year),
    getMetadata(),
  ]);

  if (!chart) {
    notFound();
  }

  const theme = getThemeForYear(year);
  const themeVars = applyTheme(theme);
  const { prev, next } = getAdjacentYears(metadata, country, year);

  return (
    <div style={themeVars as React.CSSProperties}>
      <LastDepartedTracker country={country} year={year} />
      <main className="min-h-screen bg-background text-foreground transition-colors duration-700">
        {/* Top nav */}
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-body text-sm text-foreground/30 hover:text-foreground/60 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="font-display text-base">88mph</span>
          </Link>

          {/* Prev / Next */}
          <div className="flex items-center gap-3">
            {prev ? (
              <Link
                href={`/${country}/${prev}`}
                className="flex items-center gap-1.5 font-body text-sm text-foreground/25 hover:text-accent transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                {prev}
              </Link>
            ) : (
              <span />
            )}
            <span className="w-px h-4 bg-foreground/10" />
            {next ? (
              <Link
                href={`/${country}/${next}`}
                className="flex items-center gap-1.5 font-body text-sm text-foreground/25 hover:text-accent transition-colors"
              >
                {next}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>

        {/* Hero */}
        <header className="relative max-w-5xl mx-auto px-6 pt-8 md:pt-14 pb-10">
          {/* Ambient glow */}
          <div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.07] pointer-events-none"
            style={{ background: theme.accent }}
          />

          <div className="relative">
            {/* Country + label */}
            <div className="flex items-center gap-2.5 mb-6 anim-slide-up">
              <span className="text-2xl leading-none">{getCountryFlag(country)}</span>
              <span className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground/30 font-medium">
                {getCountryName(country)} &middot; Top 10
              </span>
            </div>

            {/* Year — massive editorial display */}
            <div className="anim-slide-up" style={{ animationDelay: "0.05s" }}>
              <h1 className="year-hero font-display text-accent select-none" style={{ opacity: 0.85 }}>
                {year}
              </h1>
            </div>

            {/* Context blurb */}
            {chart.context && (
              <div className="mt-8 md:mt-10 anim-slide-up" style={{ animationDelay: "0.15s" }}>
                <EraContext context={chart.context} />
              </div>
            )}
          </div>
        </header>

        {/* Divider */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="divider-animated" />
        </div>

        {/* Chart */}
        <section className="max-w-5xl mx-auto px-6 py-8 md:py-10">
          <ChartList
            tracks={chart.tracks}
            country={country}
            countryName={getCountryName(country)}
            year={year}
          />
        </section>

        {/* Timeline */}
        <section className="max-w-5xl mx-auto px-6 pb-32 pt-4">
          <div className="pt-8 border-t border-white/[0.04]">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground/20 mb-4">
              Jump to year
            </p>
            <TimeSelector
              metadata={metadata}
              initialCountry={country}
              initialYear={year}
              compact
            />
          </div>
        </section>
      </main>
    </div>
  );
}
