import type { Metadata } from "next";
import { Instrument_Serif, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { PlayerProvider } from "@/contexts/PlayerContext";
import MiniPlayer from "@/components/MiniPlayer";
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

export const metadata: Metadata = {
  title: "88mph — Musical Time Machine",
  description:
    "Travel through decades of music. Select a country and year to discover the top 10 songs that defined an era.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${outfit.variable} font-body antialiased`}
      >
        <PlayerProvider>
          <div className="film-grain">
            {children}
          </div>
          <MiniPlayer />
        </PlayerProvider>
        <Analytics />
      </body>
    </html>
  );
}
