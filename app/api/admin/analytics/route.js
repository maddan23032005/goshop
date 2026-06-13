import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ADMIN_ID = process.env.ADMIN_ID

export async function GET() {
    try {
        const user = await currentUser()
        if (!user || user.id !== ADMIN_ID) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const [
            totalOrders,
            totalProducts,
            totalStores,
            totalUsers,
            recentOrders,
            ordersByStatus,
            revenueByDay,
            topProducts,
            categoryStats,
            newUsersThisWeek,
        ] = await Promise.all([
            // Total orders
            prisma.order.count(),

            // Total products
            prisma.product.count(),

            // Total stores
            prisma.store.count(),

            // Total users
            prisma.user.count(),

            // Recent orders last 30 days
            prisma.order.findMany({
                where: { createdAt: { gte: last30Days } },
                select: {
                    total: true,
                    createdAt: true,
                    isPaid: true,
                    status: true,
                },
                orderBy: { createdAt: 'asc' },
            }),

            // Orders by status
            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true },
            }),

            // Revenue by day last 7 days
            prisma.order.findMany({
                where: {
                    createdAt: { gte: last7Days },
                    isPaid: true,
                },
                select: {
                    total: true,
                    createdAt: true,
                },
            }),

            // Top selling products
            prisma.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true },
                _count: { productId: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5,
            }),

            // Products by category
            prisma.product.groupBy({
                by: ['category'],
                _count: { category: true },
                orderBy: { _count: { category: 'desc' } },
            }),

            // New users this week
            prisma.user.count({
                where: { createdAt: { gte: last7Days } },
            }),
        ])

        // Process revenue by day
        const revenueMap = {}
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            revenueMap[key] = 0
        }

        revenueByDay.forEach(order => {
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

        // Process orders by day
        const ordersMap = {}
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            ordersMap[key] = 0
        }

        recentOrders.forEach(order => {
            const key = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric'
            })
            if (ordersMap[key] !== undefined) {
                ordersMap[key]++
            }
        })

        const ordersChartData = Object.entries(ordersMap).map(([date, orders]) => ({
            date,
            orders,
        }))

        // Get top product details
        const topProductDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true, price: true, images: true, category: true }
                })
                return {
                    ...product,
                    totalSold: item._sum.quantity || 0,
                    totalOrders: item._count.productId,
                }
            })
        )

        // Calculate total revenue
        const totalRevenue = recentOrders
            .filter(o => o.isPaid)
            .reduce((sum, o) => sum + o.total, 0)

        return NextResponse.json({
            stats: {
                totalOrders,
                totalProducts,
                totalStores,
                totalUsers,
                totalRevenue: totalRevenue.toFixed(2),
                newUsersThisWeek,
            },
            revenueChartData,
            ordersChartData,
            ordersByStatus: ordersByStatus.map(s => ({
                status: s.status.replace('_', ' '),
                count: s._count.status,
            })),
            topProducts: topProductDetails,
            categoryStats: categoryStats.map(c => ({
                category: c.category,
                count: c._count.category,
            })),
        })

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
