import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEmbedding, generateDocumentEmbeddings, cosineSimilarity } from '@/lib/embeddings'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
    try {
        const formData = await request.formData()
        const file = formData.get('image')

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        // Convert image to base64
        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const mimeType = file.type

        // Use Groq vision to analyze the image
        const visionResponse = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64}`
                            }
                        },
                        {
                            type: 'text',
                            text: `Analyze this product image and provide:
1. Product type/name
2. Category (Electronics/Clothing/Home & Kitchen/Beauty & Health/Toys & Games/Sports & Outdoors/Books & Media/Food & Drink/Others)
3. Key features (color, material, style)
4. Search keywords

Respond in this exact format:
PRODUCT: [product name]
CATEGORY: [category]
FEATURES: [features]
KEYWORDS: [comma separated keywords]`
                        }
                    ]
                }
            ],
            max_tokens: 200,
        })

        const analysis = visionResponse.choices[0].message.content

        // Extract search query from analysis
        const keywordsMatch = analysis.match(/KEYWORDS:\s*(.+)/i)
        const productMatch = analysis.match(/PRODUCT:\s*(.+)/i)
        const categoryMatch = analysis.match(/CATEGORY:\s*(.+)/i)

        const searchQuery = [
            productMatch?.[1] || '',
            categoryMatch?.[1] || '',
            keywordsMatch?.[1] || '',
        ].join(' ')

        // Get all products
        const products = await prisma.product.findMany({
            where: { inStock: true },
            include: {
                rating: true,
                store: {
                    select: { name: true, username: true, logo: true }
                }
            },
            take: 50,
        })

        if (products.length === 0) {
            return NextResponse.json({
                analysis,
                products: [],
                searchQuery
            })
        }

        // Semantic search using embeddings
        const productTexts = products.map(p =>
            `${p.name} ${p.category} ${p.description}`
        )

        const [queryEmbedding, productEmbeddings] = await Promise.all([
            generateEmbedding(searchQuery),
            generateDocumentEmbeddings(productTexts),
        ])

        const productsWithScores = products.map((product, index) => ({
            ...product,
            score: cosineSimilarity(queryEmbedding, productEmbeddings[index])
        }))

        const results = productsWithScores
            .sort((a, b) => b.score - a.score)
            .filter(p => p.score > 0.2)
            .slice(0, 8)

        return NextResponse.json({
            analysis,
            searchQuery,
            products: results
        })

    } catch (error) {
        console.error('Image search error:', error)
        return NextResponse.json(
            { error: 'Image search failed' },
            { status: 500 }
        )
    }
}
