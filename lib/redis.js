import { Redis } from '@upstash/redis'

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const CACHE_TIMES = {
    PRODUCTS: 60 * 5,      // 5 minutes
    PRODUCT: 60 * 10,      // 10 minutes
    STORE: 60 * 10,        // 10 minutes
    SUGGESTIONS: 60 * 60,  // 1 hour
}
