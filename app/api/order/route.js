import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function GET() {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: { name: true, images: true, price: true }
                        }
                    }
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

export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { items, addressId, paymentMethod, total, storeId, coupon } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in order' }, { status: 400 })
        }
        if (!addressId) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 })
        }

        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        if (!dbUser) {
            await prisma.user.create({
                data: {
                    id: user.id,
                    name: user.fullName || 'User',
                    email: user.emailAddresses[0].emailAddress,
                    image: user.imageUrl,
                }
            })
        }

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                storeId,
                addressId,
                paymentMethod,
                total: parseFloat(total),
                isPaid: paymentMethod === 'STRIPE',
                isCouponUsed: !!(coupon?.code),
                coupon: coupon || {},
                orderItems: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: parseFloat(item.price),
                    }))
                }
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: { name: true, images: true }
                        }
                    }
                },
                address: true,
            }
        })

        // Send confirmation email
        try {
            await sendOrderConfirmationEmail({
                to: user.emailAddresses[0].emailAddress,
                orderDetails: order,
            })
        } catch (emailError) {
            console.error('Email failed:', emailError)
        }

        return NextResponse.json(order)

    } catch (error) {
        console.error('POST order error:', error)
        return NextResponse.json({
            error: 'Failed to create order',
            details: error.message
        }, { status: 500 })
    }
}
