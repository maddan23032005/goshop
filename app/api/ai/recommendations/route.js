import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { generateEmbedding, generateDocumentEmbeddings, cosineSimilarity } from '@/lib/embeddings'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')
        const type = searchParams.get('type') || 'similar'

        const user = await currentUser()

        // Type 1 — Similar products (for product page)
        if (type === 'similar' && productId) {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                select: {
                    name: true,
                    category: true,
                    description: true,
                    price: true,
                }
            })

            if (!product) return NextResponse.json([])

            const allProducts = await prisma.product.findMany({
                where: {
                    inStock: true,
                    id: { not: productId },
                },
                include: {
                    rating: true,
                    store: {
                        select: { name: true, username: true }
                    }
                },
                take: 30,
            })

            if (allProducts.length === 0) return NextResponse.json([])

            // Use embeddings for similarity
            const queryText = `${product.name} ${product.category} ${product.description}`
            const productTexts = allProducts.map(p =>
                `${p.name} ${p.category} ${p.description}`
            )

            try {
                const [queryEmbedding, productEmbeddings] = await Promise.all([
                    generateEmbedding(queryText),
                    generateDocumentEmbeddings(productTexts),
                ])

                const results = allProducts
                    .map((p, i) => ({
                        ...p,
                        score: cosineSimilarity(queryEmbedding, productEmbeddings[i])
                    }))
                    .sort((a, b) => b.score - a.score)
                    .filter(p => p.score > 0.3)
                    .slice(0, 4)

                return NextResponse.json(results)
            } catch (error) {
                // Fallback to category-based
                const fallback = allProducts
                    .filter(p => p.category === product.category)
                    .slice(0, 4)
                return NextResponse.json(fallback)
            }
        }

        // Type 2 — Personalized (for homepage)
        if (type === 'personalized' && user) {
            const orders = await prisma.order.findMany({
                where: { userId: user.id },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    category: true,
                                    name: true,
                                    price: true,
                                }
                            }
                        }
                    }
                },
                take: 10,
            })

            // Get categories user buys most
            const categoryCount = {}
            orders.forEach(order => {
                order.orderItems.forEach(item => {
                    const cat = item.product.category
                    if (cat) {
                        categoryCount[cat] = (categoryCount[cat] || 0) + 1
                    }
                })
            })

            const topCategories = Object.entries(categoryCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([cat]) => cat)

            // Get bought product IDs to exclude
            const boughtProductIds = orders.flatMap(o =>
                o.orderItems.map(i => i.productId)
            )

            if (topCategories.length > 0) {
                const recommended = await prisma.product.findMany({
                    where: {
                        inStock: true,
                        category: { in: topCategories },
                        id: { notIn: boughtProductIds },
                    },
                    include: {
                        rating: true,
                        store: {
                            select: { name: true, username: true }
                        }
                    },
                    take: 8,
                    orderBy: { createdAt: 'desc' },
                })

                return NextResponse.json({
                    type: 'personalized',
                    products: recommended,
                    reason: `Based on your interest in ${topCategories.join(', ')}`
                })
            }
        }

        // Type 3 — Trending (fallback or for guests)
        const trending = await prisma.product.findMany({
            where: { inStock: true },
            include: {
                rating: true,
                store: {
                    select: { name: true, username: true }
                },
                orderItems: {
                    select: { quantity: true }
                }
            },
            take: 20,
        })

        // Sort by order count
        const sorted = trending
            .map(p => ({
                ...p,
                totalSold: p.orderItems.reduce((sum, i) => sum + i.quantity, 0)
            }))
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 8)

        return NextResponse.json({
            type: 'trending',
            products: sorted,
            reason: 'Trending products'
        })

    } catch (error) {
        console.error('Recommendations error:', error)
        return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
    }
}
