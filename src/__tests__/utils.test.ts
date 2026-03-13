import {
  COUNTRIES,
  REGIONS,
  getCountryName,
  getCountryFlag,
  isValidYear,
  isValidCountry,
  formatOrdinal,
} from "@/lib/utils";

describe("COUNTRIES", () => {
  it("has 32 countries", () => {
    expect(Object.keys(COUNTRIES)).toHaveLength(32);
  });

  it("each country has a name and flag", () => {
    for (const [code, info] of Object.entries(COUNTRIES)) {
      expect(info.name).toBeTruthy();
      expect(info.flag).toBeTruthy();
      expect(code).toMatch(/^[a-z]{2}$/);
    }
  });
});

describe("REGIONS", () => {
  it("covers all countries", () => {
    const regionCountries = REGIONS.flatMap((r) => r.countries);
    const allCountryCodes = Object.keys(COUNTRIES);
    expect(regionCountries.sort()).toEqual(allCountryCodes.sort());
  });

  it("has no duplicate countries across regions", () => {
    const all = REGIONS.flatMap((r) => r.countries);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("getCountryName", () => {
  it("returns name for known country", () => {
    expect(getCountryName("us")).toBe("United States");
    expect(getCountryName("jp")).toBe("Japan");
  });

  it("returns uppercase code for unknown country", () => {
    expect(getCountryName("xx")).toBe("XX");
  });
});

describe("getCountryFlag", () => {
  it("returns flag for known country", () => {
    expect(getCountryFlag("it")).toBeTruthy();
  });

  it("returns empty string for unknown country", () => {
    expect(getCountryFlag("xx")).toBe("");
  });
});

describe("isValidYear", () => {
  it("accepts years in range", () => {
    expect(isValidYear(1940)).toBe(true);
    expect(isValidYear(2020)).toBe(true);
    expect(isValidYear(1930)).toBe(true);
    expect(isValidYear(2026)).toBe(true);
  });

  it("rejects out-of-range years", () => {
    expect(isValidYear(1929)).toBe(false);
    expect(isValidYear(2027)).toBe(false);
  });

  it("rejects non-integers", () => {
    expect(isValidYear(1999.5)).toBe(false);
  });
});

describe("isValidCountry", () => {
  it("accepts known country codes", () => {
    expect(isValidCountry("us")).toBe(true);
    expect(isValidCountry("ng")).toBe(true);
  });

  it("rejects unknown codes", () => {
    expect(isValidCountry("xx")).toBe(false);
  });
});

describe("formatOrdinal", () => {
  it("formats ordinals correctly", () => {
    expect(formatOrdinal(1)).toBe("1st");
    expect(formatOrdinal(2)).toBe("2nd");
    expect(formatOrdinal(3)).toBe("3rd");
    expect(formatOrdinal(4)).toBe("4th");
    expect(formatOrdinal(11)).toBe("11th");
    expect(formatOrdinal(21)).toBe("21st");
  });
});
