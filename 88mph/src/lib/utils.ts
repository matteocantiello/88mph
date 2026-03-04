export const COUNTRIES: Record<string, { name: string; flag: string }> = {
  us: { name: "United States", flag: "🇺🇸" },
  uk: { name: "United Kingdom", flag: "🇬🇧" },
  fr: { name: "France", flag: "🇫🇷" },
  de: { name: "Germany", flag: "🇩🇪" },
  br: { name: "Brazil", flag: "🇧🇷" },
  jp: { name: "Japan", flag: "🇯🇵" },
  au: { name: "Australia", flag: "🇦🇺" },
  it: { name: "Italy", flag: "🇮🇹" },
  in: { name: "India", flag: "🇮🇳" },
  kr: { name: "South Korea", flag: "🇰🇷" },
  mx: { name: "Mexico", flag: "🇲🇽" },
  es: { name: "Spain", flag: "🇪🇸" },
};

export function getCountryName(code: string): string {
  return COUNTRIES[code]?.name ?? code.toUpperCase();
}

export function getCountryFlag(code: string): string {
  return COUNTRIES[code]?.flag ?? "";
}

export function isValidYear(year: number): boolean {
  return year >= 1930 && year <= 2026 && Number.isInteger(year);
}

export function isValidCountry(code: string): boolean {
  return code in COUNTRIES;
}

export function formatOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
