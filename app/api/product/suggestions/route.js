import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''

        if (query.length < 2) {
            return NextResponse.json([])
        }

        const products = await prisma.product.findMany({
            where: {
                inStock: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } },
                ]
            },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
                category: true,
            },
            take: 5,
        })

        return NextResponse.json(products)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
    }
}
