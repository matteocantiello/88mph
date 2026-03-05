export interface Track {
  rank: number;
  title: string;
  artist: string;
  albumArt?: string;
  spotifyUri?: string;
  previewUrl?: string;
  spotifyUrl?: string;
  youtubeId?: string;
  artistCountry?: string;
}

export interface ChartData {
  country: string;
  year: number;
  tracks: Track[];
  context?: string;
}

export interface MetadataEntry {
  country: string;
  year: number;
  available: boolean;
}

export interface Metadata {
  charts: MetadataEntry[];
}

export async function getChartData(
  country: string,
  year: number
): Promise<ChartData | null> {
  try {
    const data = await import(`../../data/charts/${country}/${year}.json`);
    return data.default as ChartData;
  } catch {
    return null;
  }
}

export async function getMetadata(): Promise<Metadata> {
  try {
    const data = await import("../../data/metadata.json");
    return data.default as Metadata;
  } catch {
    return { charts: [] };
  }
}

export function getAvailableYears(
  metadata: Metadata,
  country: string
): number[] {
  return metadata.charts
    .filter((e) => e.country === country && e.available)
    .map((e) => e.year)
    .sort((a, b) => a - b);
}

export function getAdjacentYears(
  metadata: Metadata,
  country: string,
  currentYear: number
): { prev: number | null; next: number | null } {
  const years = getAvailableYears(metadata, country);
  const idx = years.indexOf(currentYear);
  return {
    prev: idx > 0 ? years[idx - 1] : null,
    next: idx < years.length - 1 ? years[idx + 1] : null,
  };
}
