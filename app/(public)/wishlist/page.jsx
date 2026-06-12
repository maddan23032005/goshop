'use client'
import { useSelector, useDispatch } from 'react-redux'
import { removeFromWishlist } from '@/lib/features/wishlist/wishlistSlice'
import { addToCart } from '@/lib/features/cart/cartSlice'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { HeartIcon, ShoppingCartIcon } from 'lucide-react'

export default function WishlistPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const { items } = useSelector(state => state.wishlist)

    const handleAddToCart = (productId) => {
        dispatch(addToCart({ productId }))
        toast.success('Added to cart!')
    }

    const handleRemove = (productId) => {
        dispatch(removeFromWishlist(productId))
        toast.success('Removed from wishlist')
    }

    return (
        <div className='max-w-7xl mx-auto px-6 py-10'>
            <h1 className='text-2xl font-medium text-slate-700 mb-8'>
                My <span className='text-green-600'>Wishlist</span>
            </h1>

            {items.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-60 text-slate-400'>
                    <HeartIcon size={48} className='mb-4 text-slate-200' />
                    <p className='text-lg'>Your wishlist is empty</p>
                    <Link
                        href='/shop'
                        className='mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition'
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {items.map((product) => (
                        <div key={product.id} className='group'>
                            <div className='relative bg-slate-100 rounded-xl overflow-hidden'>
                                <Link href={`/product/${product.id}`}>
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        width={300}
                                        height={300}
                                        className='w-full h-48 object-cover group-hover:scale-105 transition duration-300'
                                    />
                                </Link>
                                <button
                                    onClick={() => handleRemove(product.id)}
                                    className='absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-red-50 transition'
                                >
                                    <HeartIcon size={16} fill='#ef4444' className='text-red-500' />
                                </button>
                            </div>
                            <div className='mt-3'>
                                <p className='text-sm font-medium text-slate-700'>{product.name}</p>
                                <div className='flex items-center justify-between mt-2'>
                                    <p className='text-green-600 font-medium'>{currency}{product.price}</p>
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        className='flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition'
                                    >
                                        <ShoppingCartIcon size={12} />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
