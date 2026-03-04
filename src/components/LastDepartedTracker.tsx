"use client";

import { useEffect } from "react";

interface LastDepartedTrackerProps {
  country: string;
  year: number;
}

const LS_KEY = "88mph-last-departed";

export default function LastDepartedTracker({ country, year }: LastDepartedTrackerProps) {
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ country, year, date: new Date().toISOString() })
      );
    } catch {
      // ignore
    }
  }, [country, year]);

  return null;
}
