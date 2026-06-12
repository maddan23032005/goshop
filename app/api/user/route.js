import { currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST() {
    try {
        const user = await currentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user already exists in database
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!existingUser) {
            // Create new user in database
            await prisma.user.create({
                data: {
                    id: user.id,
                    name: user.fullName || user.firstName || 'User',
                    email: user.emailAddresses[0].emailAddress,
                    image: user.imageUrl,
                }
            })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('User sync error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
