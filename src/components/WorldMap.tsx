"use client";

import { memo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { COUNTRIES } from "@/lib/utils";

interface WorldMapProps {
  selectedCountry: string | null;
  onSelectCountry: (code: string) => void;
  availableYearsByCountry: Record<string, number[]>;
}

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map ISO_A2 codes used in the topology → our internal country codes
// The topology uses ISO 3166-1 numeric codes, so we map from ISO_N3
const ISO_N3_TO_CODE: Record<string, string> = {
  "840": "us", // United States
  "826": "uk", // United Kingdom
  "250": "fr", // France
  "276": "de", // Germany
  "076": "br", // Brazil
  "392": "jp", // Japan
  "036": "au", // Australia
  "380": "it", // Italy
  "356": "in", // India
  "410": "kr", // South Korea
  "484": "mx", // Mexico
  "724": "es", // Spain
  "752": "se", // Sweden
  "578": "no", // Norway
  "528": "nl", // Netherlands
  "643": "ru", // Russia
  "156": "cn", // China
  "566": "ng", // Nigeria
  "710": "za", // South Africa
};

// Map our codes to ISO 3166-1 alpha-2 for flag CDN (flagcdn.com)
const CODE_TO_FLAG_ISO: Record<string, string> = {
  us: "us",
  uk: "gb",
  fr: "fr",
  de: "de",
  br: "br",
  jp: "jp",
  au: "au",
  it: "it",
  in: "in",
  kr: "kr",
  mx: "mx",
  es: "es",
  se: "se",
  no: "no",
  nl: "nl",
  ru: "ru",
  cn: "cn",
  ng: "ng",
  za: "za",
};

function WorldMap({
  selectedCountry,
  onSelectCountry,
  availableYearsByCountry,
}: WorldMapProps) {
  const getCountryCode = useCallback((geo: { id?: string; properties?: { ISO_A2?: string } }) => {
    // world-atlas uses numeric IDs
    const id = geo.id || "";
    return ISO_N3_TO_CODE[id] || null;
  }, []);

  return (
    <div className="rounded-xl bg-[#0c0b0a]/80 backdrop-blur-sm border border-white/[0.04] p-2 md:p-3">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160, center: [10, 5] }}
        width={800}
        height={450}
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          {/* Flag patterns for each country */}
          {Object.entries(CODE_TO_FLAG_ISO).map(([code, iso]) => (
            <pattern
              key={code}
              id={`flag-${code}`}
              patternUnits="objectBoundingBox"
              width="1"
              height="1"
              patternContentUnits="objectBoundingBox"
            >
              <image
                href={`https://flagcdn.com/w640/${iso}.png`}
                width="1"
                height="1"
                preserveAspectRatio="none"
              />
            </pattern>
          ))}
        </defs>

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = getCountryCode(geo);
              const isOurCountry = code !== null;
              const hasCharts = isOurCountry && (availableYearsByCountry[code]?.length ?? 0) > 0;
              const isSelected = code === selectedCountry;
              const isActive = isSelected;

              // Determine fill
              let fill = "rgba(255,255,255,0.07)";
              let stroke = "rgba(255,255,255,0.12)";
              let strokeWidth = 0.5;

              if (hasCharts && isActive) {
                fill = `url(#flag-${code})`;
                stroke = "var(--accent)";
                strokeWidth = 1.5;
              } else if (hasCharts) {
                fill = "rgba(232,168,73,0.12)";
                stroke = "rgba(232,168,73,0.25)";
                strokeWidth = 0.75;
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  onClick={
                    hasCharts
                      ? () => onSelectCountry(code)
                      : undefined
                  }
                  style={{
                    default: {
                      outline: "none",
                      cursor: hasCharts ? "pointer" : "default",
                      transition: "fill 0.2s ease, stroke 0.2s ease",
                      paintOrder: "stroke",
                    },
                    hover: {
                      outline: "none",
                      cursor: hasCharts ? "pointer" : "default",
                      paintOrder: "stroke",
                      fill: hasCharts ? `url(#flag-${code})` : "rgba(255,255,255,0.09)",
                      stroke: hasCharts ? "var(--accent)" : "rgba(255,255,255,0.15)",
                      strokeWidth: hasCharts ? 1.5 : 0.5,
                    },
                    pressed: {
                      outline: "none",
                      paintOrder: "stroke",
                      fill: hasCharts ? `url(#flag-${code})` : "rgba(255,255,255,0.09)",
                      stroke: hasCharts ? "var(--accent)" : "rgba(255,255,255,0.15)",
                    },
                  }}
                  tabIndex={hasCharts ? 0 : -1}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Empty state guidance */}
      {!selectedCountry && (
        <p className="text-center font-body text-sm text-foreground/25 mt-2">
          Click a highlighted country to begin
        </p>
      )}

      {/* Selected country label below map */}
      {selectedCountry && COUNTRIES[selectedCountry] && (
        <div className="flex items-center justify-center gap-2.5 mt-2 anim-fade">
          <span className="text-2xl">{COUNTRIES[selectedCountry].flag}</span>
          <span className="font-body text-base text-foreground/70 font-medium">
            {COUNTRIES[selectedCountry].name}
          </span>
          <span className="font-body text-xs text-accent/50 ml-1">
            {(availableYearsByCountry[selectedCountry] || []).length} charts
          </span>
        </div>
      )}

    </div>
  );
}

export default memo(WorldMap);
