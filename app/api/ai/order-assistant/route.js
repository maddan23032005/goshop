import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { CohereClient } from 'cohere-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })

export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Please login to use order assistant' }, { status: 401 })
        }

        const { query, messages } = await request.json()

        // Fetch user's complete order history
        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                category: true,
                                price: true,
                                images: true,
                            }
                        }
                    }
                },
                address: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        // Build knowledge base from orders
        const orderDocs = orders.map(order => ({
            id: order.id,
            text: `Order ID: ${order.id}
Status: ${order.status}
Date: ${new Date(order.createdAt).toDateString()}
Total: $${order.total}
Payment: ${order.paymentMethod}
Items: ${order.orderItems.map(i => `${i.product.name} (x${i.quantity}) - $${i.price}`).join(', ')}
Delivery Address: ${order.address ? `${order.address.name}, ${order.address.city}, ${order.address.state}` : 'N/A'}
Paid: ${order.isPaid ? 'Yes' : 'No (COD)'}`
        }))

        // Also fetch products for recommendations
        const products = await prisma.product.findMany({
            where: { inStock: true },
            select: {
                id: true,
                name: true,
                category: true,
                price: true,
                description: true,
            },
            take: 30,
        })

        const productDocs = products.map(p => ({
            id: p.id,
            text: `Product: ${p.name}
Category: ${p.category}
Price: $${p.price}
Description: ${p.description}`
        }))

        const allDocs = [...orderDocs, ...productDocs]

        // Use Cohere reranking to find most relevant docs
        let relevantContext = ''

        if (allDocs.length > 0) {
            try {
                const reranked = await cohere.rerank({
                    query,
                    documents: allDocs.map(d => d.text),
                    model: 'rerank-english-v3.0',
                    topN: 5,
                })

                relevantContext = reranked.results
                    .map(r => allDocs[r.index].text)
                    .join('\n\n---\n\n')
            } catch (error) {
                // Fallback — use all order docs
                relevantContext = orderDocs.map(d => d.text).join('\n\n---\n\n')
            }
        }

        // Build system prompt with retrieved context
        const systemPrompt = `You are GoShop Order Assistant — a personal shopping assistant with access to the customer's order history and available products.

CUSTOMER CONTEXT:
${relevantContext || 'No order history found.'}

INSTRUCTIONS:
- Answer questions about their specific orders accurately
- For order status questions, refer to the order data above
- For product recommendations, suggest from the available products
- Be conversational and helpful
- Keep responses concise
- If asked about a specific order, refer to the exact order ID and details
- Format order IDs as short version (first 8 chars)
- Always be empathetic and helpful`

        const response = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
                { role: 'user', content: query }
            ],
            max_tokens: 400,
            temperature: 0.5,
        })

        return NextResponse.json({
            message: response.choices[0].message.content
        })

    } catch (error) {
        console.error('RAG assistant error:', error)
        return NextResponse.json(
            { error: 'Failed to get response' },
            { status: 500 }
        )
    }
}
