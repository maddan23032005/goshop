import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { code } = await request.json()

        const coupon = await prisma.coupon.findUnique({
            where: { code }
        })

        if (!coupon) return NextResponse.json({ error: 'Invalid coupon' }, { status: 404 })

        if (new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'Coupon expired' }, { status: 400 })
        }

        return NextResponse.json(coupon)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
    }
}
