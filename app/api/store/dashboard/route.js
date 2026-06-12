import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const store = await prisma.store.findUnique({
            where: { userId: user.id }
        })

        if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

        // Get all data in parallel
        const [products, orders, ratings] = await Promise.all([
            prisma.product.findMany({
                where: { storeId: store.id }
            }),
            prisma.order.findMany({
                where: { storeId: store.id }
            }),
            prisma.rating.findMany({
                where: { product: { storeId: store.id } },
                include: {
                    user: {
                        select: { name: true, image: true }
                    },
                    product: {
                        select: { name: true, category: true, id: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        ])

        const totalEarnings = orders
            .filter(o => o.isPaid)
            .reduce((sum, o) => sum + o.total, 0)

        return NextResponse.json({
            totalProducts: products.length,
            totalEarnings: totalEarnings.toFixed(2),
            totalOrders: orders.length,
            ratings,
        })

    } catch (error) {
        console.error('Dashboard error:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
    }
}
