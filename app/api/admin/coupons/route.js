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

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(coupons)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user || user.id !== ADMIN_ID) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = body

        const existing = await prisma.coupon.findUnique({ where: { code } })
        if (existing) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
        }

        const coupon = await prisma.coupon.create({
            data: {
                code,
                description,
                discount,
                forNewUser,
                forMember,
                isPublic,
                expiresAt: new Date(expiresAt),
            }
        })

        return NextResponse.json(coupon)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const user = await currentUser()
        if (!user || user.id !== ADMIN_ID) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')

        await prisma.coupon.delete({ where: { code } })

        return NextResponse.json({ success: true })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
    }
}
