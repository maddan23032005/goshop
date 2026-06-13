'use client'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import Loading from './Loading'
import { SparklesIcon } from 'lucide-react'

const Recommendations = ({ productId, type = 'trending' }) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const params = new URLSearchParams()
                params.append('type', type)
                if (productId) params.append('productId', productId)

                const res = await fetch(`/api/ai/recommendations?${params.toString()}`)
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error('Failed to fetch recommendations:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchRecommendations()
    }, [productId, type])

    if (loading) return <Loading />

    const products = Array.isArray(data) ? data : data?.products
    const reason = data?.reason

    if (!products || products.length === 0) return null

    return (
        <div className='my-16'>
            <div className='flex items-center gap-2 mb-2'>
                <SparklesIcon size={18} className='text-purple-500' />
                <h2 className='text-xl font-medium text-slate-700'>
                    {type === 'personalized'
                        ? 'Recommended for You'
                        : type === 'similar'
                        ? 'Similar Products'
                        : 'Trending Products'
                    }
                </h2>
            </div>
            {reason && (
                <p className='text-sm text-slate-400 mb-6'>{reason}</p>
            )}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-4'>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default Recommendations
