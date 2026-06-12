import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { sendStoreApprovalEmail } from '@/lib/email'

const ADMIN_ID = process.env.ADMIN_ID

export async function GET() {
    try {
        const user = await currentUser()
        if (!user || user.id !== ADMIN_ID) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const stores = await prisma.store.findMany({
            include: {
                user: {
                    select: { name: true, email: true, image: true }
                },
                _count: {
                    select: { Product: true, Order: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(stores)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        const user = await currentUser()
        if (!user || user.id !== ADMIN_ID) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { storeId, status, isActive } = await request.json()

        const store = await prisma.store.update({
            where: { id: storeId },
            data: { status, isActive },
            include: {
                user: {
                    select: { email: true, name: true }
                }
            }
        })

        // Send approval email
        if (status === 'approved') {
            try {
                await sendStoreApprovalEmail({
                    to: store.user.email,
                    storeName: store.name,
                })
            } catch (emailError) {
                console.error('Email failed:', emailError)
            }
        }

        return NextResponse.json(store)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
    }
}
