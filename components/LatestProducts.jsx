'use client'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import Title from './Title'

const LatestProducts = () => {
    const [products, setProducts] = useState([])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/product')
                const data = await res.json()
                // Show latest 8 products
                setProducts(data.products ? data.products.slice(0, 8) : [])
            } catch (error) {
                console.error('Failed to fetch:', error)
            }
        }
        fetchProducts()
    }, [])

    if (products.length === 0) return null

    return (
        <div className='mx-6 my-16'>
            <div className='max-w-7xl mx-auto'>
                <Title
                    title='Latest Products'
                    subtitle='Fresh arrivals just added to the store'
                />
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8'>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LatestProducts