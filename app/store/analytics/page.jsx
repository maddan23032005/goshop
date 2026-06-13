'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
    CircleDollarSignIcon, ShoppingBagIcon,
    PackageIcon, StarIcon
} from 'lucide-react'
import Image from 'next/image'

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444']

export default function StoreAnalytics() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/store/analytics')
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error('Failed to fetch analytics:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    if (loading) return <Loading />

    const statCards = [
        { title: 'Total Revenue', value: `${currency}${data?.stats.totalRevenue}`, icon: CircleDollarSignIcon, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Total Orders', value: data?.stats.totalOrders, icon: ShoppingBagIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Total Products', value: data?.stats.totalProducts, icon: PackageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Avg Rating', value: data?.stats.avgRating, icon: StarIcon, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ]

    return (
        <div className='text-slate-600 mb-28'>
            <h1 className='text-2xl mb-6'>
                Store <span className='text-slate-800 font-medium'>Analytics</span>
            </h1>

            {/* Stat Cards */}
            <div className='grid grid-cols-2 gap-4 mb-8'>
                {statCards.map((card, index) => (
                    <div key={index} className='border border-slate-200 rounded-xl p-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-xs text-slate-400'>{card.title}</p>
                                <p className='text-2xl font-medium text-slate-700 mt-1'>
                                    {card.value}
                                </p>
                            </div>
                            <div className={`p-3 ${card.bg} rounded-xl`}>
                                <card.icon size={20} className={card.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className='border border-slate-200 rounded-xl p-5 mb-6'>
                <h2 className='text-sm font-medium text-slate-700 mb-4'>
                    Revenue Last 7 Days
                </h2>
                <ResponsiveContainer width='100%' height={220}>
                    <AreaChart data={data?.revenueChartData}>
                        <defs>
                            <linearGradient id='storeRevenue' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='5%' stopColor='#16a34a' stopOpacity={0.3} />
                                <stop offset='95%' stopColor='#16a34a' stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                        <XAxis dataKey='date' tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => [`${currency}${value}`, 'Revenue']} />
                        <Area
                            type='monotone'
                            dataKey='revenue'
                            stroke='#16a34a'
                            fill='url(#storeRevenue)'
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Orders by Status */}
            <div className='border border-slate-200 rounded-xl p-5 mb-6'>
                <h2 className='text-sm font-medium text-slate-700 mb-4'>
                    Orders by Status
                </h2>
                <ResponsiveContainer width='100%' height={200}>
                    <PieChart>
                        <Pie
                            data={data?.ordersByStatus}
                            cx='50%'
                            cy='50%'
                            innerRadius={50}
                            outerRadius={80}
                            dataKey='count'
                            nameKey='status'
                        >
                            {data?.ordersByStatus?.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className='border border-slate-200 rounded-xl p-5'>
                <h2 className='text-sm font-medium text-slate-700 mb-4'>
                    Top Products
                </h2>
                {!data?.topProducts?.length ? (
                    <p className='text-slate-400 text-sm'>No sales data yet</p>
                ) : (
                    <div className='flex flex-col gap-3'>
                        {data?.topProducts?.map((product, index) => (
                            <div key={index} className='flex items-center gap-3'>
                                <span className='text-slate-400 text-sm w-5'>{index + 1}</span>
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className='w-10 h-10 rounded-lg object-cover bg-slate-100'
                                />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium text-slate-700'>{product.name}</p>
                                    <div className='flex items-center gap-1'>
                                        <StarIcon size={10} fill='#eab308' className='text-transparent' />
                                        <span className='text-xs text-slate-400'>{product.avgRating}</span>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm font-medium text-slate-700'>
                                        {currency}{product.price}
                                    </p>
                                    <p className='text-xs text-slate-400'>{product.totalSold} sold</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
