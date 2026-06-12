import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// GET current user's store
export async function GET() {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const store = await prisma.store.findUnique({
            where: { userId: user.id },
            include: {
                Product: true,
                Order: true,
            }
        })

        return NextResponse.json(store)

    } catch (error) {
        console.error('GET store error:', error)
        return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 })
    }
}

// POST create new store
export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Check if user already has a store
        const existingStore = await prisma.store.findUnique({
            where: { userId: user.id }
        })

        if (existingStore) {
            return NextResponse.json(
                { error: 'You already have a store' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { name, username, email, contact, address, description, logo } = body

        // Check if username is taken
        const usernameTaken = await prisma.store.findUnique({
            where: { username }
        })

        if (usernameTaken) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 400 }
            )
        }

        const store = await prisma.store.create({
            data: {
                userId: user.id,
                name,
                username,
                email,
                contact,
                address,
                description,
                logo,
                status: 'pending',
                isActive: false,
            }
        })

        return NextResponse.json(store)

    } catch (error) {
        console.error('POST store error:', error)
        return NextResponse.json({ error: 'Failed to create store' }, { status: 500 })
    }
}
