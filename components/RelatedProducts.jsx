'use client'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import Title from './Title'

const RelatedProducts = ({ category, productId }) => {
    const [products, setProducts] = useState([])

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const res = await fetch(
                    `/api/product/related?category=${category}&productId=${productId}`
                )
                const data = await res.json()
                setProducts(data)
            } catch (error) {
                console.error('Failed to fetch related:', error)
            }
        }
        fetchRelated()
    }, [category, productId])

    if (products.length === 0) return null

    return (
        <div className='mt-16'>
            <Title
                title='Related Products'
                subtitle='You might also like these'
            />
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8'>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default RelatedProducts
