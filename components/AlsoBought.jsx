'use client'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import { ShoppingBagIcon } from 'lucide-react'

const AlsoBought = ({ productId }) => {
    const [products, setProducts] = useState([])

    useEffect(() => {
        const fetchAlsoBought = async () => {
            try {
                const res = await fetch(`/api/ai/also-bought?productId=${productId}`)
                const data = await res.json()
                setProducts(data)
            } catch (error) {
                console.error('Failed to fetch also bought:', error)
            }
        }
        fetchAlsoBought()
    }, [productId])

    if (products.length === 0) return null

    return (
        <div className='my-10'>
            <div className='flex items-center gap-2 mb-6'>
                <ShoppingBagIcon size={18} className='text-green-600' />
                <h2 className='text-xl font-medium text-slate-700'>
                    Customers Also Bought
                </h2>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default AlsoBought
