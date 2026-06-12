'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import TranslatedText from './TranslatedText'

const ProductDescription = ({ product }) => {
    const ratings = product.rating || []
    const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : 0

    return (
        <div className='mt-10'>
            <div className='flex gap-4 border-b border-slate-200 mb-6'>
                <button className='pb-3 border-b-2 border-slate-700 text-sm font-medium text-slate-700'>
                    Description
                </button>
                <button className='pb-3 text-sm text-slate-400'>
                    Reviews ({ratings.length})
                </button>
            </div>

            {/* Translated Description */}
            <div className='text-slate-500 text-sm leading-7 max-w-3xl'>
                <TranslatedText text={product.description} />
            </div>

            {/* Reviews */}
            <div className='mt-10'>
                <div className='flex items-center gap-3 mb-6'>
                    <h3 className='text-lg font-medium text-slate-700'>
                        Customer Reviews
                    </h3>
                    <div className='flex items-center gap-1'>
                        <StarIcon size={16} fill='#00C950' className='text-transparent' />
                        <span className='text-sm font-medium text-slate-700'>{avgRating}</span>
                        <span className='text-sm text-slate-400'>({ratings.length} reviews)</span>
                    </div>
                </div>

                {ratings.length === 0 ? (
                    <p className='text-slate-400 text-sm'>No reviews yet. Be the first to review!</p>
                ) : (
                    <div className='flex flex-col gap-5 max-w-2xl'>
                        {ratings.map((r, index) => (
                            <div key={index} className='border-b border-slate-100 pb-5'>
                                <div className='flex items-center gap-3'>
                                    {r.user?.image && (
                                        <Image
                                            src={r.user.image}
                                            alt={r.user.name}
                                            width={36}
                                            height={36}
                                            className='w-9 h-9 rounded-full'
                                        />
                                    )}
                                    <div>
                                        <p className='text-sm font-medium text-slate-700'>
                                            {r.user?.name}
                                        </p>
                                        <div className='flex gap-0.5'>
                                            {[1,2,3,4,5].map((star) => (
                                                <StarIcon
                                                    key={star}
                                                    size={12}
                                                    className='text-transparent'
                                                    fill={r.rating >= star ? '#00C950' : '#D1D5DB'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className='text-xs text-slate-400 ml-auto'>
                                        {new Date(r.createdAt).toDateString()}
                                    </p>
                                </div>
                                <p className='text-sm text-slate-500 mt-2 leading-6'>
                                    <TranslatedText text={r.review} />
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDescription