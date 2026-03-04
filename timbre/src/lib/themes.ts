export interface DecadeTheme {
  name: string;
  background: string;
  foreground: string;
  accent: string;
  accentDim: string;
  surface: string;
  gradient: string;
}

const themes: Record<number, DecadeTheme> = {
  1930: {
    name: "Dust Bowl Sepia",
    background: "#1a1611",
    foreground: "#e8dcc8",
    accent: "#c4956a",
    accentDim: "#8b6914",
    surface: "#2a2218",
    gradient: "linear-gradient(135deg, #1a1611 0%, #2d2011 100%)",
  },
  1940: {
    name: "Wartime Bronze",
    background: "#171410",
    foreground: "#e5d9c3",
    accent: "#b8860b",
    accentDim: "#7a5a0a",
    surface: "#252015",
    gradient: "linear-gradient(135deg, #171410 0%, #2a1f0e 100%)",
  },
  1950: {
    name: "Diner Chrome",
    background: "#0f1419",
    foreground: "#e0e8f0",
    accent: "#4ecdc4",
    accentDim: "#2a7a74",
    surface: "#1a2230",
    gradient: "linear-gradient(135deg, #0f1419 0%, #0d2137 100%)",
  },
  1960: {
    name: "Psychedelic Haze",
    background: "#140e1a",
    foreground: "#e8dff0",
    accent: "#e056a0",
    accentDim: "#8b3366",
    surface: "#221830",
    gradient: "linear-gradient(135deg, #140e1a 0%, #2a1040 100%)",
  },
  1970: {
    name: "Burnt Orange",
    background: "#1a1410",
    foreground: "#f0e0c8",
    accent: "#e07830",
    accentDim: "#9a5020",
    surface: "#2a2018",
    gradient: "linear-gradient(135deg, #1a1410 0%, #301a08 100%)",
  },
  1980: {
    name: "Neon Noir",
    background: "#0a0a14",
    foreground: "#e0e0f8",
    accent: "#ff2d95",
    accentDim: "#a01858",
    surface: "#14142a",
    gradient: "linear-gradient(135deg, #0a0a14 0%, #1a0a2e 100%)",
  },
  1990: {
    name: "Grunge Slate",
    background: "#121416",
    foreground: "#d8dce0",
    accent: "#6eb5ff",
    accentDim: "#3a6ea0",
    surface: "#1e2228",
    gradient: "linear-gradient(135deg, #121416 0%, #0e1a28 100%)",
  },
  2000: {
    name: "Y2K Silver",
    background: "#101218",
    foreground: "#e0e4f0",
    accent: "#7c4dff",
    accentDim: "#4a2ea0",
    surface: "#1a1e2e",
    gradient: "linear-gradient(135deg, #101218 0%, #18103a 100%)",
  },
  2010: {
    name: "Minimal Gold",
    background: "#111111",
    foreground: "#f0f0f0",
    accent: "#ffd700",
    accentDim: "#a08a00",
    surface: "#1c1c1c",
    gradient: "linear-gradient(135deg, #111111 0%, #1a1a0a 100%)",
  },
  2020: {
    name: "Gen-Z Coral",
    background: "#0e1010",
    foreground: "#f2f0ee",
    accent: "#ff6b6b",
    accentDim: "#a04040",
    surface: "#1a1c1c",
    gradient: "linear-gradient(135deg, #0e1010 0%, #1e0e0e 100%)",
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function getThemeForYear(year: number): DecadeTheme {
  const decades = Object.keys(themes)
    .map(Number)
    .sort((a, b) => a - b);

  if (year <= decades[0]) return themes[decades[0]];
  if (year >= decades[decades.length - 1]) return themes[decades[decades.length - 1]];

  let lower = decades[0];
  let upper = decades[decades.length - 1];

  for (let i = 0; i < decades.length - 1; i++) {
    if (year >= decades[i] && year < decades[i + 1]) {
      lower = decades[i];
      upper = decades[i + 1];
      break;
    }
  }

  const t = (year - lower) / (upper - lower);
  const a = themes[lower];
  const b = themes[upper];

  return {
    name: t < 0.5 ? a.name : b.name,
    background: lerpColor(a.background, b.background, t),
    foreground: lerpColor(a.foreground, b.foreground, t),
    accent: lerpColor(a.accent, b.accent, t),
    accentDim: lerpColor(a.accentDim, b.accentDim, t),
    surface: lerpColor(a.surface, b.surface, t),
    gradient: t < 0.5 ? a.gradient : b.gradient,
  };
}

export function applyTheme(theme: DecadeTheme): Record<string, string> {
  return {
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--accent": theme.accent,
    "--accent-dim": theme.accentDim,
    "--surface": theme.surface,
  };
}
