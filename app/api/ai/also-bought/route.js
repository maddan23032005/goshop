import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) return NextResponse.json([])

        // Find orders that contain this product
        const ordersWithProduct = await prisma.orderItem.findMany({
            where: { productId },
            select: { orderId: true },
            take: 50,
        })

        const orderIds = ordersWithProduct.map(o => o.orderId)

        if (orderIds.length === 0) return NextResponse.json([])

        // Find other products in those orders
        const alsoBought = await prisma.orderItem.findMany({
            where: {
                orderId: { in: orderIds },
                productId: { not: productId },
            },
            include: {
                product: {
                    include: {
                        rating: true,
                        store: {
                            select: { name: true, username: true }
                        }
                    }
                }
            },
            take: 20,
        })

        // Count frequency
        const productCount = {}
        alsoBought.forEach(item => {
            const id = item.productId
            productCount[id] = (productCount[id] || 0) + 1
        })

        // Get unique products sorted by frequency
        const seen = new Set()
        const uniqueProducts = alsoBought
            .filter(item => {
                if (seen.has(item.productId)) return false
                seen.add(item.productId)
                return item.product.inStock
            })
            .sort((a, b) =>
                (productCount[b.productId] || 0) - (productCount[a.productId] || 0)
            )
            .slice(0, 4)
            .map(item => item.product)

        return NextResponse.json(uniqueProducts)

    } catch (error) {
        console.error('Also bought error:', error)
        return NextResponse.json([])
    }
}
