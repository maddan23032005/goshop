import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Tool 1 — Search Products
export const searchProductsTool = tool(
    async ({ query, category, maxPrice }) => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    inStock: true,
                    ...(query && {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } },
                        ]
                    }),
                    ...(category && { category }),
                    ...(maxPrice && { price: { lte: maxPrice } }),
                },
                include: {
                    rating: true,
                    store: {
                        select: { name: true, username: true }
                    }
                },
                take: 5,
            })

            if (products.length === 0) {
                return 'No products found matching your criteria.'
            }

            return JSON.stringify(products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                store: p.store?.name,
                rating: p.rating?.length > 0
                    ? (p.rating.reduce((a, b) => a + b.rating, 0) / p.rating.length).toFixed(1)
                    : 'No ratings',
                inStock: p.inStock,
            })))
        } catch (error) {
            return 'Failed to search products'
        }
    },
    {
        name: 'search_products',
        description: 'Search for products in the GoShop store. Use this when user wants to find or browse products.',
        schema: z.object({
            query: z.string().optional().describe('Search query for product name or description'),
            category: z.string().optional().describe('Product category filter'),
            maxPrice: z.number().optional().describe('Maximum price filter'),
        })
    }
)

// Tool 2 — Get Order Status
export const getOrderStatusTool = tool(
    async ({ userId }) => {
        try {
            const orders = await prisma.order.findMany({
                where: { userId },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: { name: true }
                            }
                        }
                    },
                    address: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 3,
            })

            if (orders.length === 0) {
                return 'No orders found for this user.'
            }

            return JSON.stringify(orders.map(o => ({
                id: o.id.slice(0, 8),
                status: o.status,
                total: o.total,
                date: new Date(o.createdAt).toDateString(),
                items: o.orderItems.map(i => i.product.name),
                paymentMethod: o.paymentMethod,
                isPaid: o.isPaid,
            })))
        } catch (error) {
            return 'Failed to fetch orders'
        }
    },
    {
        name: 'get_order_status',
        description: 'Get the order status and history for a user. Use when user asks about their orders.',
        schema: z.object({
            userId: z.string().describe('The user ID to fetch orders for'),
        })
    }
)

// Tool 3 — Get Product Details
export const getProductDetailsTool = tool(
    async ({ productId }) => {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: {
                    rating: true,
                    store: {
                        select: { name: true, username: true }
                    }
                }
            })

            if (!product) return 'Product not found'

            return JSON.stringify({
                id: product.id,
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                category: product.category,
                description: product.description,
                inStock: product.inStock,
                store: product.store?.name,
                rating: product.rating?.length > 0
                    ? (product.rating.reduce((a, b) => a + b.rating, 0) / product.rating.length).toFixed(1)
                    : 'No ratings',
                reviews: product.rating?.length || 0,
            })
        } catch (error) {
            return 'Failed to fetch product details'
        }
    },
    {
        name: 'get_product_details',
        description: 'Get detailed information about a specific product by ID.',
        schema: z.object({
            productId: z.string().describe('The product ID to fetch details for'),
        })
    }
)

// Tool 4 — Get Recommendations
export const getRecommendationsTool = tool(
    async ({ userId, category }) => {
        try {
            // Get user's past purchases
            const pastOrders = await prisma.order.findMany({
                where: { userId },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: { category: true }
                            }
                        }
                    }
                },
                take: 5,
            })

            // Get categories user has bought from
            const boughtCategories = pastOrders
                .flatMap(o => o.orderItems.map(i => i.product.category))
                .filter(Boolean)

            const targetCategory = category ||
                (boughtCategories.length > 0
                    ? boughtCategories[0]
                    : null)

            const products = await prisma.product.findMany({
                where: {
                    inStock: true,
                    ...(targetCategory && { category: targetCategory }),
                },
                include: { rating: true },
                take: 4,
                orderBy: { createdAt: 'desc' },
            })

            return JSON.stringify(products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
            })))
        } catch (error) {
            return 'Failed to get recommendations'
        }
    },
    {
        name: 'get_recommendations',
        description: 'Get personalized product recommendations for a user based on their purchase history.',
        schema: z.object({
            userId: z.string().describe('User ID to get recommendations for'),
            category: z.string().optional().describe('Optional category to filter recommendations'),
        })
    }
)

// Tool 5 — Get Store Info
export const getStoreInfoTool = tool(
    async ({ username }) => {
        try {
            const store = await prisma.store.findUnique({
                where: { username },
                include: {
                    Product: {
                        where: { inStock: true },
                        take: 5,
                        select: { name: true, price: true }
                    },
                    _count: {
                        select: { Product: true, Order: true }
                    }
                }
            })

            if (!store) return 'Store not found'

            return JSON.stringify({
                name: store.name,
                username: store.username,
                description: store.description,
                products: store._count.Product,
                orders: store._count.Order,
                topProducts: store.Product,
            })
        } catch (error) {
            return 'Failed to fetch store info'
        }
    },
    {
        name: 'get_store_info',
        description: 'Get information about a specific store by username.',
        schema: z.object({
            username: z.string().describe('Store username to fetch info for'),
        })
    }
)
