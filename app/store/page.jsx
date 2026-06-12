'use client'
import Loading from '@/components/Loading'
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/store/dashboard')

            if (!res.ok) {
                const err = await res.json()
                setError(err.error || 'Failed to load dashboard')
                return
            }

            const data = await res.json()
            setDashboardData({
                totalProducts: data.totalProducts ?? 0,
                totalEarnings: data.totalEarnings ?? 0,
                totalOrders: data.totalOrders ?? 0,
                ratings: data.ratings ?? [],
            })
        } catch (error) {
            console.error('Failed to fetch dashboard:', error)
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: 'Total Earnings', value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Ratings', value: dashboardData.ratings.length, icon: StarIcon },
    ]

    if (loading) return <Loading />

    // User has no store yet
    if (error === 'Store not found') {
        return (
            <div className='flex flex-col items-center justify-center h-60 text-slate-400'>
                <p className='text-lg'>You don&apos;t have a store yet</p>
                <button
                    onClick={() => router.push('/create-store')}
                    className='mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm'
                >
                    Create Your Store
                </button>
            </div>
        )
    }

    if (error) {
        return (
            <div className='flex items-center justify-center h-60 text-red-400'>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className='text-slate-500 mb-28'>
            <h1 className='text-2xl'>Seller <span className='text-slate-800 font-medium'>Dashboard</span></h1>

            <div className='flex flex-wrap gap-5 my-10 mt-4'>
                {dashboardCardsData.map((card, index) => (
                    <div key={index} className='flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg'>
                        <div className='flex flex-col gap-3 text-xs'>
                            <p>{card.title}</p>
                            <b className='text-2xl font-medium text-slate-700'>{card.value}</b>
                        </div>
                        <card.icon size={50} className='w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full' />
                    </div>
                ))}
            </div>

            <h2>Total Reviews</h2>

            {dashboardData.ratings.length === 0 ? (
                <p className='text-slate-400 text-sm mt-4'>No reviews yet</p>
            ) : (
                <div className='mt-5'>
                    {dashboardData.ratings.map((review, index) => (
                        <div key={index} className='flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl'>
                            <div>
                                <div className='flex gap-3'>
                                    <Image
                                        src={review.user.image}
                                        alt=''
                                        className='w-10 aspect-square rounded-full'
                                        width={100}
                                        height={100}
                                    />
                                    <div>
                                        <p className='font-medium'>{review.user.name}</p>
                                        <p className='font-light text-slate-500'>
                                            {new Date(review.createdAt).toDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className='mt-3 text-slate-500 max-w-xs leading-6'>{review.review}</p>
                            </div>
                            <div className='flex flex-col justify-between gap-6 sm:items-end'>
                                <div className='flex flex-col sm:items-end'>
                                    <p className='text-slate-400'>{review.product?.category}</p>
                                    <p className='font-medium'>{review.product?.name}</p>
                                </div>
                                <button
                                    onClick={() => router.push(`/product/${review.product.id}`)}
                                    className='bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all'
                                >
                                    View Product
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}