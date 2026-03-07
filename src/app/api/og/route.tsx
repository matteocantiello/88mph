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
  const format = searchParams.get("format");
  const isLandscape = format === "landscape";

  // Load postcard image if available, convert to JPEG data URL for Satori
  // Use lower resolution to keep final image small and fast (WhatsApp has ~4s timeout)
  let postcardDataUrl: string | null = null;
  const postcardPath = path.join(process.cwd(), "public", "postcards", `${country}_${year}.webp`);
  if (fs.existsSync(postcardPath)) {
    try {
      const w = isLandscape ? 600 : 540;
      const h = isLandscape ? 315 : 310;
      const jpegBuffer = await sharp(postcardPath)
        .resize(w, h, { fit: "cover" })
        .jpeg({ quality: 60 })
        .toBuffer();
      postcardDataUrl = `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;
    } catch {
      // Fall back to gradient-only
    }
  }

  const fonts = [
    {
      name: "Instrument Serif",
      data: instrumentSerifData,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Outfit",
      data: outfitData,
      style: "normal" as const,
      weight: 600 as const,
    },
  ];

  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=31536000, immutable",
  };

  if (isLandscape) {
    const pngResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, ${theme.surface} 0%, ${theme.background} 40%, ${theme.background} 100%)`,
            fontFamily: "Outfit",
            color: theme.foreground,
            position: "relative",
          }}
        >
          {/* Postcard background */}
          {postcardDataUrl && (
            <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              <img
                src={postcardDataUrl}
                alt=""
                width={1200}
                height={630}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(to right, ${theme.background} 0%, ${theme.background}cc 35%, ${theme.background}88 60%, ${theme.background}44 100%), linear-gradient(to bottom, ${theme.background}40 0%, ${theme.background}bb 100%)`,
                }}
              />
            </div>
          )}

          {/* Content — left-aligned */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 56px",
              position: "relative",
              width: "55%",
            }}
          >
            {/* Branding */}
            <span
              style={{
                fontFamily: "Instrument Serif",
                fontSize: 24,
                color: theme.foreground,
                opacity: 0.4,
                marginBottom: "16px",
              }}
            >
              88mph
            </span>

            {/* Year */}
            <div
              style={{
                display: "flex",
                fontFamily: "Instrument Serif",
                fontSize: 100,
                color: theme.accent,
                lineHeight: 1,
                marginBottom: "8px",
              }}
            >
              {year}
            </div>

            {/* Country + label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: 22 }}>{flag}</span>
              <span
                style={{
                  fontSize: 18,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  color: theme.foreground,
                  opacity: 0.6,
                }}
              >
                {countryName}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: theme.foreground,
                  opacity: 0.3,
                  marginLeft: "4px",
                }}
              >
                Year-End Top 10
              </span>
            </div>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                width: "80%",
                height: "2px",
                background: `linear-gradient(to right, ${theme.accent}60, transparent)`,
                marginBottom: "16px",
              }}
            />

            {/* Top 5 tracks */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {chart.tracks.slice(0, 5).map((track) => (
                <div
                  key={track.rank}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      color: theme.accent,
                      opacity: 0.5,
                      width: "28px",
                      textAlign: "right",
                      flexShrink: 0,
                      fontFamily: "Instrument Serif",
                    }}
                  >
                    {track.rank}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: theme.foreground,
                      lineHeight: 1.3,
                    }}
                  >
                    {track.title.length > 28 ? track.title.slice(0, 28) + "..." : track.title}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: theme.foreground,
                      opacity: 0.4,
                    }}
                  >
                    {track.artist.length > 25 ? track.artist.slice(0, 25) + "..." : track.artist}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom-right branding */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: "20px",
              right: "28px",
            }}
          >
            <span
              style={{
                fontFamily: "Instrument Serif",
                fontSize: 18,
                color: theme.foreground,
                opacity: 0.2,
              }}
            >
              88mph.fm
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );

    // Convert PNG to JPEG for smaller file size (WhatsApp has ~4s timeout and prefers small images)
    const pngBuffer = Buffer.from(await pngResponse.arrayBuffer());
    const jpegBuffer = await sharp(pngBuffer)
      .jpeg({ quality: 80 })
      .toBuffer();

    return new Response(new Uint8Array(jpegBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        ...cacheHeaders,
      },
    });
  }

  // Portrait format (default) — for download
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
            alignItems: "flex-start",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1.2 }}>{flag}</span>
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
      fonts,
      headers: cacheHeaders,
    }
  );
}
