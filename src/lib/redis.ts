import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const KEY = "trip-count";

export async function incrementTrips(): Promise<number> {
  return redis.incr(KEY);
}

export async function getTripCount(): Promise<number> {
  const count = await redis.get<number>(KEY);
  return count ?? 0;
}
