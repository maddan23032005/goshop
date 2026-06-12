import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
    try {
        const { name, category, mrp, price } = await request.json()

        const response = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional e-commerce product copywriter. 
Write compelling, accurate product descriptions that:
- Are 3-4 sentences long
- Highlight key features and benefits
- Use persuasive but honest language
- Are SEO friendly
- Don't use made-up specifications
Return ONLY the description text, nothing else.`
                },
                {
                    role: 'user',
                    content: `Write a product description for:
Product Name: ${name}
Category: ${category}
Original Price: $${mrp}
Selling Price: $${price}

Write a compelling description for this product.`
                }
            ],
            max_tokens: 200,
            temperature: 0.8,
        })

        const description = response.choices[0].message.content

        return NextResponse.json({ description })

    } catch (error) {
        console.error('Description generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate description' },
            { status: 500 }
        )
    }
}
