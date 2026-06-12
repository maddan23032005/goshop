import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { redis, CACHE_TIMES } from '@/lib/redis'

export async function GET(request, { params }) {
    try {
        const { productId } = await params

        // Check cache
        const cacheKey = `product:${productId}`
        try {
            const cached = await redis.get(cacheKey)
            if (cached) return NextResponse.json(cached)
        } catch (error) {
            console.error('Redis error:', error)
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                rating: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                            }
                        }
                    }
                },
                store: {
                    select: {
                        name: true,
                        username: true,
                        logo: true,
                        description: true,
                    }
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Save to cache
        try {
            await redis.set(cacheKey, product, { ex: CACHE_TIMES.PRODUCT })
        } catch (error) {
            console.error('Redis set error:', error)
        }

        return NextResponse.json(product)

    } catch (error) {
        console.error('GET product error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}
