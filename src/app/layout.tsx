import type { Metadata } from "next";
import { Instrument_Serif, Outfit, Share_Tech_Mono } from "next/font/google";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import MiniPlayer from "@/components/MiniPlayer";
import VideoPanel from "@/components/VideoPanel";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-led",
  display: "swap",
});

export const metadata: Metadata = {
  title: "88mph — What was the world listening to?",
  description:
    "No algorithm. No 'you might also like.' Just what the world was actually listening to — whether you were there or not.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "88mph",
    description: "What was the world listening to?",
    siteName: "88mph",
    type: "website",
    images: [{ url: "https://88mph.fm/og.webp", width: 1280, height: 736 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "88mph",
    description: "What was the world listening to?",
    images: ["https://88mph.fm/og.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${outfit.variable} ${shareTechMono.variable} font-body antialiased`}
      >
        <PlayerProvider>
          <div className="film-grain">
            {children}
          </div>
          <VideoPanel />
          <MiniPlayer />
        </PlayerProvider>
        <SpeedInsights />
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
