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
  se: { name: "Sweden", flag: "🇸🇪" },
  no: { name: "Norway", flag: "🇳🇴" },
  nl: { name: "Netherlands", flag: "🇳🇱" },
  ru: { name: "Russia", flag: "🇷🇺" },
  cn: { name: "China", flag: "🇨🇳" },
  ng: { name: "Nigeria", flag: "🇳🇬" },
  za: { name: "South Africa", flag: "🇿🇦" },
  ca: { name: "Canada", flag: "🇨🇦" },
  eg: { name: "Egypt", flag: "🇪🇬" },
  gh: { name: "Ghana", flag: "🇬🇭" },
  ke: { name: "Kenya", flag: "🇰🇪" },
  ar: { name: "Argentina", flag: "🇦🇷" },
  co: { name: "Colombia", flag: "🇨🇴" },
  cl: { name: "Chile", flag: "🇨🇱" },
  tr: { name: "Turkey", flag: "🇹🇷" },
  ph: { name: "Philippines", flag: "🇵🇭" },
  id: { name: "Indonesia", flag: "🇮🇩" },
  il: { name: "Israel", flag: "🇮🇱" },
  th: { name: "Thailand", flag: "🇹🇭" },
  my: { name: "Malaysia", flag: "🇲🇾" },
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

export interface Region {
  name: string;
  countries: string[];
}

export const REGIONS: Region[] = [
  { name: "Americas", countries: ["us", "ca", "br", "mx", "ar", "co", "cl"] },
  { name: "Oceania", countries: ["au"] },
  { name: "Europe", countries: ["uk", "fr", "de", "it", "es", "se", "no", "nl"] },
  { name: "Asia", countries: ["jp", "kr", "in", "cn", "ph", "id", "th", "my"] },
  { name: "Eurasia", countries: ["ru", "tr"] },
  { name: "Middle East", countries: ["eg", "il"] },
  { name: "Africa", countries: ["ng", "za", "gh", "ke"] },
];
