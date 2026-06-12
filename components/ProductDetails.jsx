'use client'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { addToWishlist, removeFromWishlist } from '@/lib/features/wishlist/wishlistSlice'
import { StarIcon, HeartIcon, ShoppingCartIcon, StoreIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

const ProductDetails = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const wishlistItems = useSelector(state => state.wishlist.items)
    const isWishlisted = wishlistItems.some(item => item.id === product.id)

    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)

    const rating = product.rating?.length > 0
        ? (product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length).toFixed(1)
        : 0

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            dispatch(addToCart({ productId: product.id }))
        }
        toast.success(`${quantity} item(s) added to cart!`)
    }

    const toggleWishlist = () => {
        if (isWishlisted) {
            dispatch(removeFromWishlist(product.id))
            toast.success('Removed from wishlist')
        } else {
            dispatch(addToWishlist(product))
            toast.success('Added to wishlist!')
        }
    }

    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)

    return (
        <div className='flex flex-col lg:flex-row gap-10'>

            {/* Images Section */}
            <div className='flex flex-col-reverse sm:flex-row gap-4 lg:w-1/2'>

                {/* Thumbnails */}
                <div className='flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto'>
                    {product.images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${selectedImage === index
                                    ? 'border-green-500'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${product.name} ${index + 1}`}
                                width={64}
                                height={64}
                                className='w-full h-full object-cover'
                            />
                        </button>
                    ))}
                </div>

                {/* Main Image */}
                <div className='flex-1 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center min-h-80'>
                    <Image
                        src={product.images[selectedImage]}
                        alt={product.name}
                        width={500}
                        height={500}
                        className='w-full h-full object-contain max-h-96 p-4 hover:scale-105 transition duration-300'
                    />
                </div>
            </div>

            {/* Product Info */}
            <div className='lg:w-1/2'>

                {/* Category */}
                <p className='text-sm text-green-600 font-medium mb-2'>
                    {product.category}
                </p>

                {/* Name */}
                <h1 className='text-2xl font-medium text-slate-800 leading-snug'>
                    {product.name}
                </h1>

                {/* Rating */}
                <div className='flex items-center gap-2 mt-3'>
                    <div className='flex'>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                size={16}
                                className='text-transparent'
                                fill={rating >= star ? '#00C950' : '#D1D5DB'}
                            />
                        ))}
                    </div>
                    <p className='text-sm text-slate-500'>
                        {rating} ({product.rating?.length || 0} reviews)
                    </p>
                </div>

                {/* Price */}
                <div className='flex items-center gap-3 mt-4'>
                    <p className='text-3xl font-medium text-slate-800'>
                        {currency}{product.price}
                    </p>
                    {product.mrp > product.price && (
                        <>
                            <p className='text-lg text-slate-400 line-through'>
                                {currency}{product.mrp}
                            </p>
                            <span className='px-2 py-0.5 bg-green-100 text-green-700 text-sm rounded-full font-medium'>
                                {discount}% off
                            </span>
                        </>
                    )}
                </div>

                {/* Stock Status */}
                <div className='mt-3'>
                    {product.inStock ? (
                        <span className='text-sm text-green-600 font-medium'>
                            ✓ In Stock
                        </span>
                    ) : (
                        <span className='text-sm text-red-500 font-medium'>
                            ✗ Out of Stock
                        </span>
                    )}
                </div>

                {/* Quantity */}
                <div className='flex items-center gap-3 mt-6'>
                    <p className='text-sm text-slate-600'>Quantity</p>
                    <div className='flex items-center border border-slate-200 rounded-lg overflow-hidden'>
                        <button
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className='px-3 py-2 hover:bg-slate-100 transition text-slate-600'
                        >
                            -
                        </button>
                        <span className='px-4 py-2 text-sm font-medium border-x border-slate-200'>
                            {quantity}
                        </span>
                        <button
                            onClick={() => setQuantity(q => q + 1)}
                            className='px-3 py-2 hover:bg-slate-100 transition text-slate-600'
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Buttons */}
                <div className='flex gap-3 mt-6'>
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className='flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 disabled:bg-slate-300 transition font-medium'
                    >
                        <ShoppingCartIcon size={18} />
                        Add to Cart
                    </button>
                    <button
                        onClick={toggleWishlist}
                        className={`p-3 rounded-xl border-2 transition ${isWishlisted
                                ? 'border-red-300 bg-red-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <HeartIcon
                            size={20}
                            fill={isWishlisted ? '#ef4444' : 'none'}
                            className={isWishlisted ? 'text-red-500' : 'text-slate-400'}
                        />
                    </button>
                </div>

                {/* Store Info */}
                {product.store && (
                    <Link
                        href={`/shop/${product.store.username}`}
                        className='flex items-center gap-3 mt-6 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition'
                    >
                        <Image
                            src={product.store.logo}
                            alt={product.store.name}
                            width={40}
                            height={40}
                            className='w-10 h-10 rounded-full object-cover'
                        />
                        <div>
                            <p className='text-xs text-slate-400'>Sold by</p>
                            <p className='text-sm font-medium text-slate-700'>
                                {product.store.name}
                            </p>
                        </div>
                        <StoreIcon size={16} className='ml-auto text-slate-400' />
                    </Link>
                )}

                {/* Delivery Info */}
                <div className='mt-4 p-4 bg-green-50 rounded-xl'>
                    <p className='text-sm text-green-700 font-medium'>Free delivery on orders above $50</p>
                    <p className='text-xs text-green-600 mt-1'>7 days easy return policy</p>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails