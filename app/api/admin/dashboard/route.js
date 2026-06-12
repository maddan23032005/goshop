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

        const [products, orders, stores] = await Promise.all([
            prisma.product.count(),
            prisma.order.findMany({
                select: { total: true, createdAt: true, isPaid: true }
            }),
            prisma.store.count(),
        ])

        const revenue = orders
            .filter(o => o.isPaid)
            .reduce((sum, o) => sum + o.total, 0)

        return NextResponse.json({
            products,
            revenue: revenue.toFixed(2),
            orders: orders.length,
            stores,
            allOrders: orders,
        })

    } catch (error) {
        console.error('Admin dashboard error:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
    }
}
