import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { redis, CACHE_TIMES } from '@/lib/redis'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const category = searchParams.get('category') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')
        const skip = (page - 1) * limit

        // Cache key
        const cacheKey = `products:${search}:${category}:${page}:${limit}`

        // Check cache first
        try {
            const cached = await redis.get(cacheKey)
            if (cached) {
                return NextResponse.json(cached)
            }
        } catch (error) {
            console.error('Redis error:', error)
        }

        const where = {
            inStock: true,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ]
            }),
            ...(category && { category }),
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    rating: true,
                    store: {
                        select: {
                            name: true,
                            username: true,
                            logo: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.product.count({ where })
        ])

        const result = {
            products,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }

        // Save to cache
        try {
            await redis.set(cacheKey, result, { ex: CACHE_TIMES.PRODUCTS })
        } catch (error) {
            console.error('Redis set error:', error)
        }

        return NextResponse.json(result)

    } catch (error) {
        console.error('GET products error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}
