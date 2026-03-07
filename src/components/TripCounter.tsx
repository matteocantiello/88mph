"use client";

import { useEffect, useState } from "react";

export default function TripCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  if (count === null) return null;

  return (
    <span className="font-body text-[11px] text-foreground/10 tabular-nums">
      <span className="text-amber-400/90">{count.toLocaleString()}</span> time trips taken
    </span>
  );
}
