import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { ChatGroq } from '@langchain/groq'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import {
    searchProductsTool,
    getOrderStatusTool,
    getProductDetailsTool,
    getRecommendationsTool,
    getStoreInfoTool,
} from '@/lib/agent/tools'

const tools = [
    searchProductsTool,
    getOrderStatusTool,
    getProductDetailsTool,
    getRecommendationsTool,
    getStoreInfoTool,
]

export async function POST(request) {
    try {
        const user = await currentUser()
        const { messages, userMessage } = await request.json()

        // Initialize Groq with tools
        const llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0.7,
        }).bindTools(tools)

        const systemPrompt = `You are GoShop AI Agent — an intelligent shopping assistant with access to real-time store data.

You have access to these tools:
- search_products: Find products by name, category, or price
- get_order_status: Check user's order history and status
- get_product_details: Get detailed info about a specific product
- get_recommendations: Get personalized product recommendations
- get_store_info: Get information about a specific store

Current user ID: ${user?.id || 'anonymous'}
User name: ${user?.firstName || 'Guest'}

BEHAVIOR:
- Always use tools to get real data before responding
- For product searches, always call search_products first
- For order questions, always call get_order_status
- Be conversational and helpful
- Format product results nicely with prices
- Suggest adding products to cart when relevant
- Keep responses concise and actionable`

        // Build message history
        const messageHistory = [
            new SystemMessage(systemPrompt),
            ...messages.slice(-6).map(m =>
                m.role === 'user'
                    ? new HumanMessage(m.content)
                    : new AIMessage(m.content)
            ),
            new HumanMessage(userMessage)
        ]

        // First LLM call — may include tool calls
        let response = await llm.invoke(messageHistory)

        // Handle tool calls
        if (response.tool_calls && response.tool_calls.length > 0) {
            const toolResults = []

            for (const toolCall of response.tool_calls) {
                const tool = tools.find(t => t.name === toolCall.name)
                if (tool) {
                    try {
                        const result = await tool.invoke(toolCall.args)
                        toolResults.push({
                            role: 'tool',
                            content: result,
                            tool_call_id: toolCall.id,
                        })
                    } catch (error) {
                        toolResults.push({
                            role: 'tool',
                            content: 'Tool execution failed',
                            tool_call_id: toolCall.id,
                        })
                    }
                }
            }

            // Second LLM call with tool results
            const finalResponse = await llm.invoke([
                ...messageHistory,
                response,
                ...toolResults.map(r => ({
                    role: 'tool',
                    content: r.content,
                    tool_call_id: r.tool_call_id,
                }))
            ])

            return NextResponse.json({
                message: finalResponse.content,
                toolsUsed: response.tool_calls.map(t => t.name),
            })
        }

        return NextResponse.json({
            message: response.content,
            toolsUsed: [],
        })

    } catch (error) {
        console.error('Agent error:', error)
        return NextResponse.json(
            { error: 'Agent failed: ' + error.message },
            { status: 500 }
        )
    }
}
