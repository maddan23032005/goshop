import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const addresses = await prisma.address.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(addresses)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { name, email, street, city, state, zip, country, phone } = body

        const address = await prisma.address.create({
            data: {
                userId: user.id,
                name, email, street,
                city, state, zip,
                country, phone,
            }
        })

        return NextResponse.json(address)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const addressId = searchParams.get('addressId')

        await prisma.address.delete({
            where: { id: addressId, userId: user.id }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
    }
}
