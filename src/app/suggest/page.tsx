"use client";

import { useState } from "react";
import Link from "next/link";

const COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "uk", name: "United Kingdom" },
  { code: "fr", name: "France" },
  { code: "de", name: "Germany" },
  { code: "br", name: "Brazil" },
  { code: "jp", name: "Japan" },
  { code: "au", name: "Australia" },
  { code: "it", name: "Italy" },
  { code: "in", name: "India" },
  { code: "kr", name: "South Korea" },
  { code: "mx", name: "Mexico" },
  { code: "es", name: "Spain" },
  { code: "se", name: "Sweden" },
  { code: "no", name: "Norway" },
  { code: "nl", name: "Netherlands" },
  { code: "ru", name: "Russia" },
  { code: "cn", name: "China" },
  { code: "ng", name: "Nigeria" },
  { code: "za", name: "South Africa" },
  { code: "ca", name: "Canada" },
];

const TYPES = [
  "New chart (add a year to an existing country)",
  "New country (add a country not yet covered)",
  "Correction (fix errors in an existing chart)",
];

const SONG_PLACEHOLDER = `1. "Song Title" - Artist Name
2. "Song Title" - Artist Name
3. "Song Title" - Artist Name
4. "Song Title" - Artist Name
5. "Song Title" - Artist Name
6. "Song Title" - Artist Name
7. "Song Title" - Artist Name
8. "Song Title" - Artist Name
9. "Song Title" - Artist Name
10. "Song Title" - Artist Name`;

export default function SuggestPage() {
  const [type, setType] = useState(TYPES[0]);
  const [country, setCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [year, setYear] = useState("");
  const [songs, setSongs] = useState("");
  const [source, setSource] = useState("");
  const [context, setContext] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isNewCountry = type === TYPES[1];
  const countryDisplay = isNewCountry
    ? customCountry
    : country
      ? `${COUNTRIES.find((c) => c.code === country)?.name} (${country})`
      : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          country: countryDisplay,
          year,
          songs,
          source,
          context: context || undefined,
          website, // honeypot
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <Link href="/" className="led-hero text-2xl leading-none inline-block mb-12">
            8<span className="-ml-[0.04em]">8</span>mph
          </Link>
          <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-10">
            <div className="text-4xl mb-4">&#10003;</div>
            <h1 className="font-display text-2xl text-foreground/90 mb-3">
              Suggestion received
            </h1>
            <p className="font-body text-sm text-foreground/40 mb-8">
              Your chart suggestion has been submitted. A maintainer will review it and, if verified, add it to the site.
            </p>
            <Link
              href="/"
              className="inline-block font-body text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Back to 88mph
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-6 py-12 md:py-20">
        <Link href="/" className="led-hero text-2xl leading-none inline-block mb-10">
          8<span className="-ml-[0.04em]">8</span>mph
        </Link>

        <h1 className="font-display text-3xl md:text-4xl text-foreground/90 mb-2">
          Suggest a chart
        </h1>
        <p className="font-body text-sm text-foreground/30 mb-10">
          Help us expand the collection. All data must come from verifiable, published sources.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot — invisible to humans */}
          <div className="absolute -left-[9999px]" aria-hidden="true" tabIndex={-1}>
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Type */}
          <fieldset>
            <legend className="font-body text-xs uppercase tracking-wider text-foreground/40 mb-2">
              Type
            </legend>
            <div className="space-y-2">
              {TYPES.map((t) => (
                <label key={t} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="accent-[var(--accent)]"
                  />
                  <span className="font-body text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors">
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Country */}
          <div>
            <label className="font-body text-xs uppercase tracking-wider text-foreground/40 mb-2 block">
              Country
            </label>
            {isNewCountry ? (
              <input
                type="text"
                value={customCountry}
                onChange={(e) => setCustomCountry(e.target.value)}
                placeholder="e.g. Argentina (ar)"
                required
                className="w-full bg-surface border border-white/[0.06] rounded-lg px-4 py-2.5 font-body text-sm text-foreground/80 placeholder:text-foreground/20 focus:outline-none focus:border-accent/40 transition-colors"
              />
            ) : (
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full bg-surface border border-white/[0.06] rounded-lg px-4 py-2.5 font-body text-sm text-foreground/80 focus:outline-none focus:border-accent/40 transition-colors"
              >
                <option value="" disabled>
                  Select a country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="font-body text-xs uppercase tracking-wider text-foreground/40 mb-2 block">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 1990"
              min="1940"
              max="2026"
              required
              className="w-full bg-surface border border-white/[0.06] rounded-lg px-4 py-2.5 font-body text-sm text-foreground/80 placeholder:text-foreground/20 focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* Songs */}
          <div>
            <label className="font-body text-xs uppercase tracking-wider text-foreground/40 mb-2 block">
              Top 10 Songs
            </label>
            <textarea
              value={songs}
              onChange={(e) => setSongs(e.target.value)}
              placeholder={SONG_PLACEHOLDER}
              required
              rows={12}
              className="w-full bg-surface border border-white/[0.06] rounded-lg px-4 py-2.5 font-body text-sm text-foreground/80 placeholder:text-foreground/20 focus:outline-none focus:border-accent/40 transition-colors font-mono"
            />
            <p className="font-body text-[11px] text-foreground/20 mt-1">
              For corrections, only list the entries that need fixing.
            </p>
          </div>

          {/* Source URL */}
          <div>
            <label className="font-body text-xs uppercase tracking-wider text-foreground/40 mb-2 block">
              Source URL
            </label>
            <input
              type="url"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. https://en.wikipedia.org/wiki/Billboard_Year-End_Hot_100_singles_of_1990"
              required
              className="w-full bg-surface border border-white/[0.06] rounded-lg px-4 py-2.5 font-body text-sm text-foreground/80 placeholder:text-foreground/20 focus:outline-none focus:border-accent/40 transition-colors"
            />
            <p className="font-body text-[11px] text-foreground/20 mt-1">
              Official chart source, Wikipedia article, or published year-end list.
            </p>
          </div>

          {/* Context (optional) */}
          <div>
            <label className="font-body text-xs uppercase tracking-wider text-foreground/40 mb-2 block">
              Additional context <span className="text-foreground/15">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Cultural context, notes on data quality, or alternative sources"
              rows={3}
              className="w-full bg-surface border border-white/[0.06] rounded-lg px-4 py-2.5 font-body text-sm text-foreground/80 placeholder:text-foreground/20 focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* Error */}
          {status === "error" && errorMsg && (
            <div className="font-body text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/40 text-background font-body text-sm font-medium py-3 rounded-lg transition-colors"
          >
            {status === "submitting" ? "Submitting..." : "Submit suggestion"}
          </button>

          <p className="font-body text-[11px] text-foreground/15 text-center">
            All submissions are verified against sources before being added.
          </p>
        </form>
      </div>
    </main>
  );
}
