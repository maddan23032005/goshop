'use client'
import { StarIcon, HeartIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlist, removeFromWishlist } from '@/lib/features/wishlist/wishlistSlice'
import toast from 'react-hot-toast'
import TranslatedText from './TranslatedText'

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const wishlistItems = useSelector(state => state.wishlist.items)
    const isWishlisted = wishlistItems.some(item => item.id === product.id)

    const rating = product.rating?.length > 0
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0

    const toggleWishlist = (e) => {
        e.preventDefault()
        if (isWishlisted) {
            dispatch(removeFromWishlist(product.id))
            toast.success('Removed from wishlist')
        } else {
            dispatch(addToWishlist(product))
            toast.success('Added to wishlist!')
        }
    }

    return (
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto'>
            <div className='relative bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                <Image
                    width={500}
                    height={500}
                    className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300'
                    src={product.images[0]}
                    alt=""
                />
                <button
                    onClick={toggleWishlist}
                    className='absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition'
                >
                    <HeartIcon
                        size={14}
                        fill={isWishlisted ? '#ef4444' : 'none'}
                        className={isWishlisted ? 'text-red-500' : 'text-slate-400'}
                    />
                </button>
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p><TranslatedText text={product.name} /></p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon
                                key={index}
                                size={14}
                                className='text-transparent mt-0.5'
                                fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                            />
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard