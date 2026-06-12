'use client'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import Title from './Title'
import Loading from './Loading'

const BestSelling = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/product')
                const data = await res.json()
                // Show top 4 products
                setProducts(data.products ? data.products.slice(0, 4) : [])
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    if (products.length === 0) return null

    return (
        <div className='mx-6 my-16'>
            <div className='max-w-7xl mx-auto'>
                <Title
                    title='Best Selling'
                    subtitle='Most popular products loved by customers'
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

export default BestSelling