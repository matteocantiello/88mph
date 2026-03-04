import { getMetadata, getChartData, getAvailableYears, ChartData } from "@/lib/data";
import { COUNTRIES } from "@/lib/utils";
import FeaturedCard from "@/components/FeaturedCard";
import RandomButton from "@/components/RandomButton";

export default async function HomePage() {
  const metadata = await getMetadata();

  // Load all available charts for the landing page
  const allCharts: ChartData[] = [];
  for (const countryCode of Object.keys(COUNTRIES)) {
    const years = getAvailableYears(metadata, countryCode);
    for (const year of years) {
      const chart = await getChartData(countryCode, year);
      if (chart) allCharts.push(chart);
    }
  }

  // Sort: newest first, but interleave countries
  allCharts.sort((a, b) => b.year - a.year);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/[0.02] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-12 md:pb-16">
          {/* Logo / Title */}
          <div className="anim-slide-up">
            <p className="font-body text-[11px] uppercase tracking-[0.3em] text-accent/60 mb-4">
              Musical Time Machine
            </p>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground leading-[0.85] mb-6">
              88mph
            </h1>
            <p className="font-body text-foreground/35 text-lg md:text-xl max-w-lg leading-relaxed">
              Travel through decades of music. Discover the songs that defined
              every era, from the big band swing of the 1940s to the streaming
              age.
            </p>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-4 mt-8 anim-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <RandomButton metadata={metadata} />
            <span className="text-foreground/15 text-sm font-body">
              or explore below
            </span>
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="divider-animated" />
      </div>

      {/* Featured Charts Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl text-foreground/80">
            Browse Eras
          </h2>
          <span className="font-body text-xs text-foreground/20 tracking-wide">
            {allCharts.length} charts available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCharts.map((chart, i) => (
            <FeaturedCard
              key={`${chart.country}-${chart.year}`}
              chart={chart}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-foreground/20">88mph</p>
            <p className="font-body text-xs text-foreground/10 mt-1">
              Previews powered by Spotify. Data is illustrative.
            </p>
          </div>
          <div className="font-body text-xs text-foreground/10">
            USA &middot; UK &middot; More countries soon
          </div>
        </div>
      </footer>
    </main>
  );
}
