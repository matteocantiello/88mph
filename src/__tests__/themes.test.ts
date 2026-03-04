import { getThemeForYear, applyTheme } from "@/lib/themes";

describe("getThemeForYear", () => {
  it("returns a theme for any valid year", () => {
    const years = [1940, 1955, 1968, 1975, 1985, 1995, 2005, 2015, 2020];
    for (const year of years) {
      const theme = getThemeForYear(year);
      expect(theme).toBeDefined();
      expect(theme.name).toBeTruthy();
      expect(theme.background).toMatch(/^#[0-9a-f]{6}$/);
      expect(theme.foreground).toMatch(/^#[0-9a-f]{6}$/);
      expect(theme.accent).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("returns consistent themes for the same year", () => {
    const a = getThemeForYear(1985);
    const b = getThemeForYear(1985);
    expect(a).toEqual(b);
  });

  it("clamps to earliest theme for very old years", () => {
    const theme = getThemeForYear(1900);
    expect(theme).toBeDefined();
    expect(theme.background).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("clamps to latest theme for future years", () => {
    const theme = getThemeForYear(2030);
    expect(theme).toBeDefined();
    expect(theme.background).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("interpolates between decades", () => {
    const t1970 = getThemeForYear(1970);
    const t1975 = getThemeForYear(1975);
    const t1980 = getThemeForYear(1980);
    // 1975 should be different from both endpoints
    expect(t1975.accent).not.toBe(t1970.accent);
    expect(t1975.accent).not.toBe(t1980.accent);
  });
});

describe("applyTheme", () => {
  it("returns CSS custom property object", () => {
    const theme = getThemeForYear(2000);
    const vars = applyTheme(theme);
    expect(vars["--background"]).toBe(theme.background);
    expect(vars["--foreground"]).toBe(theme.foreground);
    expect(vars["--accent"]).toBe(theme.accent);
    expect(vars["--accent-dim"]).toBe(theme.accentDim);
    expect(vars["--surface"]).toBe(theme.surface);
  });
});
