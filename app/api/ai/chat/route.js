import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { rateLimit } from '@/lib/rateLimit'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
    try {
        const { messages } = await request.json()
        const user = await currentUser()

        // Rate limiting: 20 requests per minute per user
        const identifier = user?.id || 'anonymous'
        const rateLimitResult = await rateLimit(identifier, 20, 60)
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment.' },
                { status: 429 }
            )
        }

        // Build system prompt based on context
        let systemPrompt = `You are GoShop AI Assistant — a helpful, friendly shopping assistant for GoShop, a multi-vendor e-commerce platform.

You can help customers with:
- Finding products and recommendations
- Order status and tracking
- Store information
- Shopping advice and gift ideas
- General platform support

Always be concise, helpful and friendly. When recommending products, suggest they search on the /shop page.
If asked about order status, tell them to check /orders page.
Format responses in short paragraphs — no long walls of text.
Current date: ${new Date().toDateString()}`

        // If user is logged in, add their context
        if (user) {
            try {
                const [orders, dbUser] = await Promise.all([
                    prisma.order.findMany({
                        where: { userId: user.id },
                        include: {
                            orderItems: {
                                include: {
                                    product: {
                                        select: { name: true, category: true }
                                    }
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    }),
                    prisma.user.findUnique({
                        where: { id: user.id },
                        select: { name: true }
                    })
                ])

                if (dbUser) {
                    systemPrompt += `\n\nCustomer Info:
Name: ${dbUser.name}
Recent Orders: ${orders.length} orders
${orders.map(o => `- Order ${o.id.slice(0, 8)}: ${o.status} — ${o.orderItems.map(i => i.product.name).join(', ')}`).join('\n')}`
                }
            } catch (error) {
                console.error('Failed to fetch user context:', error)
            }
        }

        const response = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            max_tokens: 500,
            temperature: 0.7,
        })

        return NextResponse.json({
            message: response.choices[0].message.content
        })

    } catch (error) {
        console.error('Chat error:', error)
        return NextResponse.json(
            { error: 'Failed to get response' },
            { status: 500 }
        )
    }
}
