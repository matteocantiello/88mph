import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const GITHUB_PAT = process.env.GITHUB_SUGGEST_PAT;
const REPO = "matteocantiello/88mph";

const VALID_TYPES = [
  "New chart (add a year to an existing country)",
  "New country (add a country not yet covered)",
  "Correction (fix errors in an existing chart)",
];

export async function POST(request: NextRequest) {
  if (!GITHUB_PAT) {
    return NextResponse.json(
      { error: "Suggestion submissions are temporarily unavailable." },
      { status: 503 }
    );
  }

  // Rate limit: 3 submissions per IP per 10 minutes
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(`suggest:${ip}`, {
    maxRequests: 3,
    windowMs: 10 * 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: if this hidden field is filled, it's a bot
  if (body.website) {
    // Silently accept but don't create the issue
    return NextResponse.json({ success: true });
  }

  const { type, country, year, songs, source, context } = body;

  // Validate required fields
  const errors: string[] = [];
  if (!type || !VALID_TYPES.includes(type)) {
    errors.push("Invalid submission type.");
  }
  if (!country || typeof country !== "string" || country.length > 100) {
    errors.push("Country is required.");
  }
  if (!year || !/^\d{4}$/.test(String(year).trim())) {
    errors.push("Year must be a 4-digit number.");
  }
  if (!songs || typeof songs !== "string" || songs.trim().length < 10) {
    errors.push("Please provide at least a few songs.");
  }
  if (!source || typeof source !== "string" || source.trim().length < 5) {
    errors.push("A source URL is required.");
  }

  // Validate field lengths to prevent abuse
  if (songs && songs.length > 5000) errors.push("Songs field is too long.");
  if (source && source.length > 1000) errors.push("Source field is too long.");
  if (context && context.length > 3000) errors.push("Context field is too long.");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  // Build the issue body to match the GitHub issue template format
  const issueBody = [
    "### Type",
    "",
    type,
    "",
    "### Country",
    "",
    country,
    "",
    "### Year",
    "",
    String(year).trim(),
    "",
    "### Top 10 Songs",
    "",
    songs.trim(),
    "",
    "### Source URL",
    "",
    source.trim(),
    "",
    "### Additional context",
    "",
    context?.trim() || "_No response_",
    "",
    "### Data quality",
    "",
    "- [X] This data comes from a verifiable, published source (not generated or guessed)",
    "- [X] I have checked that this chart does not already exist on the site",
    "",
    "---",
    "_Submitted via the 88mph website._",
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `[Chart]: ${country} ${String(year).trim()}`,
          body: issueBody,
          labels: ["chart-suggestion"],
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("GitHub API error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to submit suggestion. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("GitHub API error:", err);
    return NextResponse.json(
      { error: "Failed to submit suggestion. Please try again." },
      { status: 502 }
    );
  }
}
