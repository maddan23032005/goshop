import { prisma } from '@/lib/prisma'

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Static pages
    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/image-search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ]

    // Dynamic product pages
    try {
        const products = await prisma.product.findMany({
            where: { inStock: true },
            select: { id: true, updatedAt: true },
        })

        const productPages = products.map(product => ({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
        }))

        // Dynamic store pages
        const stores = await prisma.store.findMany({
            where: { isActive: true },
            select: { username: true, updatedAt: true },
        })

        const storePages = stores.map(store => ({
            url: `${baseUrl}/shop/${store.username}`,
            lastModified: store.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7,
        }))

        return [...staticPages, ...productPages, ...storePages]

    } catch (error) {
        return staticPages
    }
}
