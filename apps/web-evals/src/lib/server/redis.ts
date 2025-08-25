import { type RedisClientType, createClient } from "redis"

let redis: RedisClientType | null = null

export async function redisClient() {
	if (!redis) {
		redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" })
		// Use type assertion for the event handler
		;(redis as any).on("error", (error: any) => console.error("Redis error:", error))
		await redis.connect()
	}

	return redis
}
