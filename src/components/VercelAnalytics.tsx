"use client";

import { useEffect } from "react";

export default function VercelAnalytics() {
  useEffect(() => {
    import("@vercel/analytics").then((mod) => mod.inject());
  }, []);
  return null;
}
