'use client'
import Loading from '@/components/Loading'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function ManageProducts() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/store/product')
            const data = await res.json()
            setProducts(data)
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleStock = async (productId, currentStock) => {
        try {
            const res = await fetch('/api/store/product', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, inStock: !currentStock })
            })
            if (res.ok) {
                toast.success('Product updated!')
                fetchProducts()
            }
        } catch (error) {
            toast.error('Failed to update product')
        }
    }

    const deleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return
        try {
            const res = await fetch(`/api/store/product?productId=${productId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success('Product deleted!')
                fetchProducts()
            }
        } catch (error) {
            toast.error('Failed to delete product')
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <div className='text-slate-500 mb-28'>
            <h1 className='text-2xl'>Manage <span className='text-slate-800 font-medium'>Products</span></h1>

            {products.length === 0 ? (
                <p className='text-slate-400 text-sm mt-8'>No products yet. Add your first product!</p>
            ) : (
                <div className='mt-6 overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='text-left border-b border-slate-200'>
                                <th className='pb-3 font-medium'>Product</th>
                                <th className='pb-3 font-medium'>Category</th>
                                <th className='pb-3 font-medium'>Price</th>
                                <th className='pb-3 font-medium'>In Stock</th>
                                <th className='pb-3 font-medium'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className='border-b border-slate-100 hover:bg-slate-50'>
                                    <td className='py-4'>
                                        <div className='flex items-center gap-3'>
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                width={50}
                                                height={50}
                                                className='w-12 h-12 object-cover rounded-lg bg-slate-100'
                                            />
                                            <p className='font-medium text-slate-700 max-w-40 truncate'>{product.name}</p>
                                        </div>
                                    </td>
                                    <td className='py-4'>{product.category}</td>
                                    <td className='py-4'>{currency}{product.price}</td>
                                    <td className='py-4'>
                                        <button
                                            onClick={() => toggleStock(product.id, product.inStock)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${product.inStock
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                        >
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </button>
                                    </td>
                                    <td className='py-4'>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className='text-red-400 hover:text-red-600 text-xs transition'
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}