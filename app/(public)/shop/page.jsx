'use client'
import ProductCard from '@/components/ProductCard'
import Pagination from '@/components/Pagination'
import { categories } from '@/assets/assets'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Loading from '@/components/Loading'

export default function ShopPage() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search') || ''

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchProducts = async (page = 1) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (selectedCategory) params.append('category', selectedCategory)
            params.append('page', page)
            params.append('limit', '12')

            const res = await fetch(`/api/product?${params.toString()}`)
            const data = await res.json()
            setProducts(data.products)
            setTotalPages(data.pages)
            setTotal(data.total)
            setCurrentPage(data.currentPage)
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setCurrentPage(1)
        fetchProducts(1)
    }, [search, selectedCategory])

    const handlePageChange = (page) => {
        setCurrentPage(page)
        fetchProducts(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat)
        setCurrentPage(1)
    }

    return (
        <div className='max-w-7xl mx-auto px-6 py-10'>

            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                <div>
                    <h1 className='text-2xl font-medium text-slate-700'>
                        {search ? `Results for "${search}"` : 'All Products'}
                    </h1>
                    <p className='text-slate-400 text-sm mt-1'>
                        {total} products found
                    </p>
                </div>
            </div>

            <div className='flex gap-8'>
                {/* Sidebar Filter */}
                <div className='hidden md:block w-48 shrink-0'>
                    <p className='font-medium text-slate-700 mb-3'>Categories</p>
                    <div className='flex flex-col gap-2'>
                        <button
                            onClick={() => handleCategoryChange('')}
                            className={`text-left text-sm px-3 py-2 rounded-lg transition ${
                                selectedCategory === ''
                                    ? 'bg-green-100 text-green-700 font-medium'
                                    : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`text-left text-sm px-3 py-2 rounded-lg transition ${
                                    selectedCategory === cat
                                        ? 'bg-green-100 text-green-700 font-medium'
                                        : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Category Filter */}
                <div className='flex-1'>
                    <div className='md:hidden mb-4'>
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className='w-full p-2 border border-slate-200 rounded-lg text-sm outline-none'
                        >
                            <option value=''>All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <Loading />
                    ) : products.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-60 text-slate-400'>
                            <p className='text-lg'>No products found</p>
                            <p className='text-sm mt-1'>Try a different search or category</p>
                        </div>
                    ) : (
                        <>
                            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}