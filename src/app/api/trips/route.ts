import { NextResponse } from "next/server";
import { getTripCount, incrementTrips } from "@/lib/redis";

export async function GET() {
  const count = await getTripCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await incrementTrips();
  return NextResponse.json({ count });
}
