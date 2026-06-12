import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

// Clear all product list caches on mutation
const clearProductCache = async () => {
    try {
        const keys = await redis.keys('products:*')
        if (keys.length > 0) {
            await Promise.all(keys.map(key => redis.del(key)))
        }
    } catch (error) {
        console.error('Cache clear error:', error)
    }
}

// GET seller's own products
export async function GET() {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const store = await prisma.store.findUnique({
            where: { userId: user.id }
        })

        if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            include: { rating: true },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(products)

    } catch (error) {
        console.error('GET store products error:', error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}

// POST add new product
export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const store = await prisma.store.findUnique({
            where: { userId: user.id }
        })

        if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        if (!store.isActive) return NextResponse.json({ error: 'Store not approved yet' }, { status: 403 })

        const body = await request.json()
        const { name, description, mrp, price, category, images } = body

        const product = await prisma.product.create({
            data: {
                name,
                description,
                mrp: parseFloat(mrp),
                price: parseFloat(price),
                category,
                images,
                storeId: store.id,
            }
        })

        await clearProductCache()
        return NextResponse.json(product)

    } catch (error) {
        console.error('POST product error:', error)
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
}

// PUT update product (toggle stock)
export async function PUT(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { productId, inStock } = body

        const store = await prisma.store.findUnique({
            where: { userId: user.id }
        })

        if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

        const product = await prisma.product.update({
            where: { id: productId, storeId: store.id },
            data: { inStock }
        })

        await clearProductCache()
        return NextResponse.json(product)

    } catch (error) {
        console.error('PUT product error:', error)
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

// DELETE product
export async function DELETE(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        const store = await prisma.store.findUnique({
            where: { userId: user.id }
        })

        if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

        await prisma.product.delete({
            where: { id: productId, storeId: store.id }
        })

        await clearProductCache()
        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('DELETE product error:', error)
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}
