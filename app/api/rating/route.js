import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { productId, orderId, rating, review } = await request.json()

        // Check if user actually bought this product
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: user.id,
                orderItems: {
                    some: { productId }
                }
            }
        })

        if (!order) {
            return NextResponse.json(
                { error: 'You can only review products you have purchased' },
                { status: 403 }
            )
        }

        // Check if already reviewed
        const existing = await prisma.rating.findUnique({
            where: {
                userId_productId_orderId: {
                    userId: user.id,
                    productId,
                    orderId,
                }
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'You have already reviewed this product' },
                { status: 400 }
            )
        }

        const newRating = await prisma.rating.create({
            data: {
                userId: user.id,
                productId,
                orderId,
                rating,
                review,
            }
        })

        return NextResponse.json(newRating)

    } catch (error) {
        console.error('Rating error:', error)
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }
}
