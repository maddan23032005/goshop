import { redis } from './redis'

export const rateLimit = async (identifier, limit = 10, window = 60) => {
    const key = `rate_limit:${identifier}`

    try {
        const requests = await redis.incr(key)

        if (requests === 1) {
            await redis.expire(key, window)
        }

        if (requests > limit) {
            return { success: false, remaining: 0 }
        }

        return { success: true, remaining: limit - requests }
    } catch (error) {
        // If Redis fails, allow the request
        return { success: true, remaining: limit }
    }
}
