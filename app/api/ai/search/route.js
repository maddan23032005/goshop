import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { generateEmbedding, generateDocumentEmbeddings, cosineSimilarity } from '@/lib/embeddings'

export async function POST(request) {
    try {
        const { query } = await request.json()

        if (!query || query.length < 2) {
            return NextResponse.json([])
        }

        // Get all products
        const products = await prisma.product.findMany({
            where: { inStock: true },
            include: {
                rating: true,
                store: {
                    select: { name: true, username: true, logo: true }
                }
            },
            take: 50, // Limit for free tier
        })

        if (products.length === 0) {
            return NextResponse.json([])
        }

        // Create document texts for embedding
        const productTexts = products.map(p =>
            `${p.name} ${p.category} ${p.description}`
        )

        // Generate embeddings in parallel
        const [queryEmbedding, productEmbeddings] = await Promise.all([
            generateEmbedding(query),
            generateDocumentEmbeddings(productTexts),
        ])

        // Calculate similarity scores
        const productsWithScores = products.map((product, index) => ({
            ...product,
            score: cosineSimilarity(queryEmbedding, productEmbeddings[index])
        }))

        // Sort by similarity and return top results
        const results = productsWithScores
            .sort((a, b) => b.score - a.score)
            .filter(p => p.score > 0.3) // Minimum similarity threshold
            .slice(0, 12)

        return NextResponse.json(results)

    } catch (error) {
        console.error('Semantic search error:', error)
        return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
        )
    }
}
