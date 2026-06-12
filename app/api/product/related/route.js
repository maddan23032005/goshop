import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const productId = searchParams.get('productId')

        const products = await prisma.product.findMany({
            where: {
                category,
                id: { not: productId },
                inStock: true,
            },
            include: { rating: true },
            take: 4,
        })

        return NextResponse.json(products)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
