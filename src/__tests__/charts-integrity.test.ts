import * as fs from "fs";
import * as path from "path";

const chartsDir = path.join(__dirname, "../../data/charts");
const metadataPath = path.join(__dirname, "../../data/metadata.json");

interface Track {
  rank: number;
  title: string;
  artist: string;
  albumArt?: string;
  previewUrl?: string | null;
  spotifyUri?: string;
  spotifyUrl?: string;
}

interface ChartData {
  country: string;
  year: number;
  context?: string;
  tracks: Track[];
}

interface MetadataEntry {
  country: string;
  year: number;
  available: boolean;
}

function getAllChartFiles(): { country: string; year: string; filePath: string }[] {
  const files: { country: string; year: string; filePath: string }[] = [];
  const countries = fs.readdirSync(chartsDir);
  for (const country of countries) {
    const countryDir = path.join(chartsDir, country);
    if (!fs.statSync(countryDir).isDirectory()) continue;
    const yearFiles = fs.readdirSync(countryDir).filter((f) => f.endsWith(".json"));
    for (const file of yearFiles) {
      files.push({
        country,
        year: file.replace(".json", ""),
        filePath: path.join(countryDir, file),
      });
    }
  }
  return files;
}

describe("Chart data integrity", () => {
  const chartFiles = getAllChartFiles();

  it("has chart files on disk", () => {
    expect(chartFiles.length).toBeGreaterThan(0);
  });

  it.each(chartFiles)("$country/$year.json is valid JSON with required fields", ({ country, year, filePath }) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data: ChartData = JSON.parse(raw);

    expect(data.country).toBe(country);
    expect(data.year).toBe(parseInt(year, 10));
    expect(Array.isArray(data.tracks)).toBe(true);
    expect(data.tracks.length).toBeGreaterThanOrEqual(1);
    expect(data.tracks.length).toBeLessThanOrEqual(10);
  });

  it.each(chartFiles)("$country/$year.json tracks have rank, title, artist", ({ filePath }) => {
    const data: ChartData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const track of data.tracks) {
      expect(typeof track.rank).toBe("number");
      expect(track.rank).toBeGreaterThanOrEqual(1);
      expect(track.rank).toBeLessThanOrEqual(10);
      expect(typeof track.title).toBe("string");
      expect(track.title.length).toBeGreaterThan(0);
      expect(typeof track.artist).toBe("string");
      expect(track.artist.length).toBeGreaterThan(0);
    }
  });

  it.each(chartFiles)("$country/$year.json has unique ranks", ({ filePath }) => {
    const data: ChartData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const ranks = data.tracks.map((t) => t.rank);
    expect(new Set(ranks).size).toBe(ranks.length);
  });

  it.each(chartFiles)("$country/$year.json ranks are sequential from 1", ({ filePath }) => {
    const data: ChartData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const ranks = data.tracks.map((t) => t.rank).sort((a, b) => a - b);
    for (let i = 0; i < ranks.length; i++) {
      expect(ranks[i]).toBe(i + 1);
    }
  });

  it.each(chartFiles)("$country/$year.json Spotify fields are valid when present", ({ filePath }) => {
    const data: ChartData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const urlPattern = /^https?:\/\/.+/;

    for (const track of data.tracks) {
      if (track.albumArt !== undefined && track.albumArt !== null) {
        expect(track.albumArt).toMatch(urlPattern);
      }
      if (track.previewUrl !== undefined && track.previewUrl !== null) {
        expect(track.previewUrl).toMatch(urlPattern);
      }
      if (track.spotifyUri !== undefined) {
        expect(track.spotifyUri).toMatch(/^spotify:track:.+/);
      }
      if (track.spotifyUrl !== undefined && track.spotifyUrl !== null) {
        expect(track.spotifyUrl).toMatch(urlPattern);
      }
    }
  });
});

describe("Metadata consistency", () => {
  const metadata: { charts: MetadataEntry[] } = JSON.parse(
    fs.readFileSync(metadataPath, "utf-8")
  );
  const chartFiles = getAllChartFiles();

  it("every metadata entry has a matching chart file", () => {
    for (const entry of metadata.charts) {
      if (!entry.available) continue;
      const match = chartFiles.find(
        (f) => f.country === entry.country && f.year === String(entry.year)
      );
      expect(match).toBeDefined();
    }
  });

  it("every chart file has a metadata entry", () => {
    for (const file of chartFiles) {
      const match = metadata.charts.find(
        (e) => e.country === file.country && e.year === parseInt(file.year, 10)
      );
      expect(match).toBeDefined();
    }
  });

  it("has no duplicate entries", () => {
    const keys = metadata.charts.map((e) => `${e.country}-${e.year}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
