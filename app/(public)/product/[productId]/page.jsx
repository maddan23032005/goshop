import { prisma } from '@/lib/prisma'
import ProductPageClient from './ProductPageClient'

// Generate metadata for each product
export async function generateMetadata({ params }) {
    try {
        const { productId } = await params
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                name: true,
                description: true,
                images: true,
                price: true,
                category: true,
            }
        })

        if (!product) {
            return { title: 'Product Not Found' }
        }

        return {
            title: product.name,
            description: product.description?.slice(0, 160),
            keywords: [product.name, product.category, 'buy online', 'gocart'],
            openGraph: {
                title: product.name,
                description: product.description?.slice(0, 160),
                images: [
                    {
                        url: product.images[0],
                        width: 800,
                        height: 800,
                        alt: product.name,
                    }
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: product.name,
                description: product.description?.slice(0, 160),
                images: [product.images[0]],
            }
        }
    } catch (error) {
        return { title: 'GoCart Product' }
    }
}

export default function ProductPage({ params }) {
    return <ProductPageClient params={params} />
}