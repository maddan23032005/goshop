'use client'
import { useState } from 'react'
import { StarIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

const RatingModal = ({ product, onClose }) => {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [review, setReview] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/rating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.productId,
                    orderId: product.orderId,
                    rating,
                    review,
                })
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || 'Failed to submit review')
                return
            }
            toast.success('Review submitted!')
            onClose()
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4'>
            <div className='bg-white rounded-2xl p-6 w-full max-w-md'>

                {/* Header */}
                <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-medium text-slate-700'>Rate Product</h3>
                    <button onClick={onClose} className='text-slate-400 hover:text-slate-600'>
                        <XIcon size={20} />
                    </button>
                </div>

                {/* Product */}
                <div className='flex gap-3 items-center mb-5 p-3 bg-slate-50 rounded-xl'>
                    <Image
                        src={product.productImage}
                        alt={product.productName}
                        width={50}
                        height={50}
                        className='w-12 h-12 object-cover rounded-lg'
                    />
                    <p className='font-medium text-slate-700 text-sm'>{product.productName}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Stars */}
                    <p className='text-sm text-slate-500 mb-2'>Your Rating</p>
                    <div className='flex gap-1 mb-4'>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type='button'
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <StarIcon
                                    size={28}
                                    className='text-transparent transition'
                                    fill={(hover || rating) >= star ? '#00C950' : '#D1D5DB'}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Review */}
                    <textarea
                        value={review}
                        onChange={e => setReview(e.target.value)}
                        placeholder='Write your review here...'
                        rows={4}
                        className='w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-400 resize-none'
                        required
                    />

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full mt-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition font-medium'
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RatingModal