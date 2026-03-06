import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import { getChartData, getMetadata, getAdjacentYears } from "@/lib/data";
import { getCountryName, getCountryFlag, isValidCountry, isValidYear } from "@/lib/utils";
import { getThemeForYear, applyTheme } from "@/lib/themes";
import ChartList from "@/components/ChartList";
import EraContext from "@/components/EraContext";
import TimeSelector from "@/components/TimeSelector";
import LastDepartedTracker from "@/components/LastDepartedTracker";
import RandomButton from "@/components/RandomButton";

interface PageProps {
  params: { country: string; year: string };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://88mph.fm";

export async function generateStaticParams() {
  const metadata = await getMetadata();
  return metadata.charts
    .filter((e) => e.available)
    .map((e) => ({ country: e.country, year: String(e.year) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const country = params.country;
  const year = parseInt(params.year, 10);
  if (!isValidCountry(country) || !isValidYear(year)) return {};

  const name = getCountryName(country);
  const flag = getCountryFlag(country);
  const title = `${flag} ${name} ${year} — Top 10 | 88mph`;
  const description = `What was ${name} listening to in ${year}? Discover the year-end top 10 chart.`;

  // Use postcard as OG image if it exists, otherwise hero
  const postcardFile = `${country}_${year}.webp`;
  const postcardPath = path.join(process.cwd(), "public", "postcards", postcardFile);
  const ogImage = fs.existsSync(postcardPath)
    ? `${SITE_URL}/postcards/${postcardFile}`
    : `${SITE_URL}/og.webp`;

  return {
    title,
    description,
    openGraph: {
      title: `${name} ${year} — Top 10`,
      description,
      siteName: "88mph",
      images: [{ url: ogImage, width: 1280, height: 736 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} ${year} — Top 10`,
      description,
      images: [ogImage],
    },
  };
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

  // Check if a postcard image exists for this chart
  const postcardFilename = `${country}_${year}.webp`;
  const postcardPath = path.join(process.cwd(), "public", "postcards", postcardFilename);
  const hasPostcard = fs.existsSync(postcardPath);

  return (
    <div style={themeVars as React.CSSProperties}>
      <LastDepartedTracker country={country} year={year} />
      <main className="min-h-screen bg-background text-foreground transition-colors duration-700">
        {/* Top nav */}
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between relative z-10">
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
        <header className="relative overflow-hidden">
          {/* Postcard background image */}
          {hasPostcard && (
            <div className="absolute inset-0 postcard-hero pointer-events-none">
              <Image
                src={`/postcards/${postcardFilename}`}
                alt=""
                fill
                priority
                className="object-cover object-center"
                sizes="100vw"
              />
              {/* Gradient mask: fades image to background */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, ${theme.background}90 0%, ${theme.background}40 30%, ${theme.background}cc 70%, ${theme.background} 100%), linear-gradient(to right, ${theme.background}dd 0%, transparent 20%, transparent 80%, ${theme.background}dd 100%)`,
                }}
              />
            </div>
          )}

          {/* Ambient glow (visible even without postcard) */}
          <div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.07] pointer-events-none"
            style={{ background: theme.accent }}
          />

          <div className="relative max-w-5xl mx-auto px-6 pt-8 md:pt-14 pb-10">
            {/* Country + label */}
            <div className="flex items-center gap-2.5 mb-6 anim-slide-up">
              <span className="text-2xl leading-none">{getCountryFlag(country)}</span>
              <span className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground/30 font-medium">
                {getCountryName(country)} &middot; {year} Year-End Top 10
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

        {/* Timeline + Random */}
        <section className="max-w-5xl mx-auto px-6 pb-24 pt-4">
          <div className="pt-8 border-t border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground/20">
                Jump to year
              </p>
              <RandomButton metadata={metadata} compact />
            </div>
            <TimeSelector
              metadata={metadata}
              initialCountry={country}
              initialYear={year}
              compact
            />
            <div className="mt-6 text-right">
              <a
                href={`https://github.com/matteocantiello/88mph/issues/new?template=suggest-chart.yml&title=${encodeURIComponent(`[Chart]: ${getCountryName(country)} ${year}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-[11px] text-foreground/20 hover:text-accent transition-colors"
              >
                Suggest a correction
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
