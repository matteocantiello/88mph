import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getChartData } from "@/lib/data";
import { getCountryName, getCountryFlag, isValidCountry, isValidYear } from "@/lib/utils";
import { getThemeForYear } from "@/lib/themes";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";

const instrumentSerifData = fs.readFileSync(
  path.join(process.cwd(), "src/assets/fonts/InstrumentSerif-Regular.ttf")
);
const outfitData = fs.readFileSync(
  path.join(process.cwd(), "src/assets/fonts/Outfit-SemiBold.ttf")
);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const country = searchParams.get("country");
  const yearStr = searchParams.get("year");

  if (!country || !yearStr) {
    return new Response("Missing country or year", { status: 400 });
  }

  const year = parseInt(yearStr, 10);
  if (!isValidCountry(country) || !isValidYear(year)) {
    return new Response("Invalid country or year", { status: 400 });
  }

  const chart = await getChartData(country, year);
  if (!chart) {
    return new Response("Chart not found", { status: 404 });
  }

  const theme = getThemeForYear(year);
  const countryName = getCountryName(country);
  const flag = getCountryFlag(country);

  // Load postcard image if available, convert to PNG data URL for Satori
  let postcardDataUrl: string | null = null;
  const postcardPath = path.join(process.cwd(), "public", "postcards", `${country}_${year}.webp`);
  if (fs.existsSync(postcardPath)) {
    try {
      const pngBuffer = await sharp(postcardPath)
        .resize(1080, 620, { fit: "cover" })
        .png({ quality: 70 })
        .toBuffer();
      postcardDataUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch {
      // Fall back to gradient-only
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: `linear-gradient(170deg, ${theme.surface} 0%, ${theme.background} 35%, ${theme.background} 100%)`,
          padding: "60px 56px 48px",
          justifyContent: "space-between",
          fontFamily: "Outfit",
          color: theme.foreground,
          position: "relative",
        }}
      >
        {/* Postcard background image */}
        {postcardDataUrl && (
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: "620px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={postcardDataUrl}
              alt=""
              width={1080}
              height={620}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
            {/* Gradient overlay to fade into background */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(to bottom, ${theme.background}70 0%, ${theme.background}30 25%, ${theme.background}bb 60%, ${theme.background} 100%)`,
              }}
            />
          </div>
        )}
        {/* Top branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 36,
              color: theme.foreground,
              opacity: 0.4,
            }}
          >
            88mph
          </span>
        </div>

        {/* Year */}
        <div
          style={{
            display: "flex",
            fontFamily: "Instrument Serif",
            fontSize: 180,
            color: theme.accent,
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          {year}
        </div>

        {/* Country — below year for readability over postcard */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <span style={{ fontSize: 36 }}>{flag}</span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: 24,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                color: theme.foreground,
                opacity: 0.6,
              }}
            >
              {countryName}
            </span>
            <span
              style={{
                fontSize: 20,
                letterSpacing: "0.08em",
                color: theme.foreground,
                opacity: 0.35,
              }}
            >
              Year-End Top 10
            </span>
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "2px",
            background: `linear-gradient(to right, ${theme.accent}60, transparent)`,
            marginBottom: "40px",
          }}
        />

        {/* Track list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
          }}
        >
          {chart.tracks.slice(0, 10).map((track) => (
            <div
              key={track.rank}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "24px",
              }}
            >
              <span
                style={{
                  fontSize: 34,
                  color: theme.accent,
                  opacity: 0.5,
                  width: "56px",
                  textAlign: "right",
                  flexShrink: 0,
                  fontFamily: "Instrument Serif",
                }}
              >
                {track.rank}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 600,
                    color: theme.foreground,
                    lineHeight: 1.2,
                  }}
                >
                  {track.title.length > 32
                    ? track.title.slice(0, 32) + "..."
                    : track.title}
                </span>
                <span
                  style={{
                    fontSize: 26,
                    color: theme.foreground,
                    opacity: 0.45,
                    lineHeight: 1.2,
                  }}
                >
                  {track.artist.length > 40
                    ? track.artist.slice(0, 40) + "..."
                    : track.artist}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 28,
              color: theme.foreground,
              opacity: 0.25,
            }}
          >
            88mph.fm
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        {
          name: "Instrument Serif",
          data: instrumentSerifData,
          style: "normal",
          weight: 400,
        },
        {
          name: "Outfit",
          data: outfitData,
          style: "normal",
          weight: 600,
        },
      ],
      headers: {
        "Cache-Control": "public, s-maxage=31536000, immutable",
      },
    }
  );
}
