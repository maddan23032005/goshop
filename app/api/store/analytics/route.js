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

        const now = new Date()
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const [orders, products, ratings] = await Promise.all([
            prisma.order.findMany({
                where: { storeId: store.id },
                select: {
                    total: true,
                    createdAt: true,
                    isPaid: true,
                    status: true,
                },
                orderBy: { createdAt: 'asc' },
            }),

            prisma.product.findMany({
                where: { storeId: store.id },
                include: {
                    rating: true,
                    orderItems: {
                        select: { quantity: true }
                    }
                }
            }),

            prisma.rating.findMany({
                where: { product: { storeId: store.id } },
                select: { rating: true, createdAt: true }
            }),
        ])

        // Revenue by day last 7 days
        const revenueMap = {}
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            revenueMap[key] = 0
        }

        orders
            .filter(o => o.isPaid && new Date(o.createdAt) >= last7Days)
            .forEach(order => {
                const key = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric'
                })
                if (revenueMap[key] !== undefined) {
                    revenueMap[key] += order.total
                }
            })

        const revenueChartData = Object.entries(revenueMap).map(([date, revenue]) => ({
            date,
            revenue: parseFloat(revenue.toFixed(2)),
        }))

        // Top products by sales
        const topProducts = products
            .map(p => ({
                name: p.name,
                category: p.category,
                price: p.price,
                image: p.images[0],
                totalSold: p.orderItems.reduce((sum, i) => sum + i.quantity, 0),
                avgRating: p.rating.length > 0
                    ? (p.rating.reduce((sum, r) => sum + r.rating, 0) / p.rating.length).toFixed(1)
                    : 0,
            }))
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 5)

        const totalRevenue = orders
            .filter(o => o.isPaid)
            .reduce((sum, o) => sum + o.total, 0)

        const avgRating = ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : 0

        return NextResponse.json({
            stats: {
                totalOrders: orders.length,
                totalProducts: products.length,
                totalRevenue: totalRevenue.toFixed(2),
                avgRating,
                recentOrders: orders.filter(o =>
                    new Date(o.createdAt) >= last30Days
                ).length,
            },
            revenueChartData,
            topProducts,
            ordersByStatus: [
                { status: 'Order Placed', count: orders.filter(o => o.status === 'ORDER_PLACED').length },
                { status: 'Processing', count: orders.filter(o => o.status === 'PROCESSING').length },
                { status: 'Shipped', count: orders.filter(o => o.status === 'SHIPPED').length },
                { status: 'Delivered', count: orders.filter(o => o.status === 'DELIVERED').length },
            ]
        })

    } catch (error) {
        console.error('Store analytics error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
