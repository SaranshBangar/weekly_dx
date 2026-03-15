import { createClient } from "redis";

const globalForRedis = global as unknown as { redisClient: ReturnType<typeof createClient> };

export const redis =
  globalForRedis.redisClient ||
  createClient({
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD || "",
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

redis.on("error", (err) => console.log("Redis Client Error", err));

if (process.env.NODE_ENV !== "production") globalForRedis.redisClient = redis;

export async function getRedisClient() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}
