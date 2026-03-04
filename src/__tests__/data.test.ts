import { getAvailableYears, getAdjacentYears, Metadata } from "@/lib/data";

const mockMetadata: Metadata = {
  charts: [
    { country: "us", year: 1940, available: true },
    { country: "us", year: 1960, available: true },
    { country: "us", year: 1980, available: true },
    { country: "us", year: 2000, available: true },
    { country: "uk", year: 1965, available: true },
    { country: "uk", year: 1985, available: true },
    { country: "it", year: 1947, available: true },
    { country: "it", year: 2020, available: false },
  ],
};

describe("getAvailableYears", () => {
  it("returns sorted years for a country", () => {
    expect(getAvailableYears(mockMetadata, "us")).toEqual([1940, 1960, 1980, 2000]);
  });

  it("only returns available charts", () => {
    expect(getAvailableYears(mockMetadata, "it")).toEqual([1947]);
  });

  it("returns empty array for unknown country", () => {
    expect(getAvailableYears(mockMetadata, "xx")).toEqual([]);
  });
});

describe("getAdjacentYears", () => {
  it("returns prev and next years", () => {
    const { prev, next } = getAdjacentYears(mockMetadata, "us", 1960);
    expect(prev).toBe(1940);
    expect(next).toBe(1980);
  });

  it("returns null for first year prev", () => {
    const { prev, next } = getAdjacentYears(mockMetadata, "us", 1940);
    expect(prev).toBeNull();
    expect(next).toBe(1960);
  });

  it("returns null for last year next", () => {
    const { prev, next } = getAdjacentYears(mockMetadata, "us", 2000);
    expect(prev).toBe(1980);
    expect(next).toBeNull();
  });

  it("returns nulls for single-year country", () => {
    const { prev, next } = getAdjacentYears(mockMetadata, "it", 1947);
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });
});
