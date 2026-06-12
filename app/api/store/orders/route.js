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

        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: { name: true, images: true, price: true }
                        }
                    }
                },
                user: {
                    select: { name: true, email: true, image: true }
                },
                address: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(orders)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { orderId, status } = await request.json()

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        })

        return NextResponse.json(order)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }
}
