'use client'
import ProductDetails from '@/components/ProductDetails'
import ProductDescription from '@/components/ProductDescription'
import AlsoBought from '@/components/AlsoBought'
import Recommendations from '@/components/Recommendations'
import Loading from '@/components/Loading'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProductPageClient() {
    const { productId } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/product/${productId}`)
                const data = await res.json()
                setProduct(data)
            } catch (error) {
                console.error('Failed to fetch product:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [productId])

    if (loading) return <Loading />

    if (!product) return (
        <div className='min-h-screen flex items-center justify-center text-slate-400'>
            Product not found
        </div>
    )

    return (
        <div className='max-w-7xl mx-auto px-6 py-10'>
            <ProductDetails product={product} />
            <ProductDescription product={product} />
            <AlsoBought productId={product.id} />
            <Recommendations
                productId={product.id}
                type='similar'
            />
        </div>
    )
}

