'use client'
import Loading from '@/components/Loading'
import OrderTimeline from '@/components/OrderTimeline'
import RatingModal from '@/components/RatingModal'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

export default function OrdersPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/order')
                const data = await res.json()
                setOrders(data)
            } catch (error) {
                console.error('Failed to fetch orders:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <div className='max-w-4xl mx-auto px-6 py-10'>
            <h1 className='text-2xl font-medium text-slate-700 mb-8'>
                My <span className='text-green-600'>Orders</span>
            </h1>

            {orders.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-60 text-slate-400'>
                    <p className='text-lg'>No orders yet</p>
                </div>
            ) : (
                <div className='flex flex-col gap-6'>
                    {orders.map((order) => (
                        <div key={order.id} className='border border-slate-200 rounded-xl overflow-hidden'>

                            {/* Order Header */}
                            <div className='flex flex-wrap justify-between gap-3 p-5 bg-slate-50'>
                                <div>
                                    <p className='text-xs text-slate-400'>Order ID</p>
                                    <p className='text-sm font-medium text-slate-600'>
                                        {order.id.slice(0, 16)}...
                                    </p>
                                </div>
                                <div>
                                    <p className='text-xs text-slate-400'>Date</p>
                                    <p className='text-sm text-slate-600'>
                                        {new Date(order.createdAt).toDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className='text-xs text-slate-400'>Total</p>
                                    <p className='text-sm font-medium text-slate-700'>
                                        {currency}{order.total}
                                    </p>
                                </div>
                                <div>
                                    <p className='text-xs text-slate-400'>Status</p>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        order.status === 'DELIVERED'
                                            ? 'bg-green-100 text-green-700'
                                            : order.status === 'SHIPPED'
                                            ? 'bg-blue-100 text-blue-700'
                                            : order.status === 'PROCESSING'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setExpandedOrder(
                                        expandedOrder === order.id ? null : order.id
                                    )}
                                    className='text-slate-400 hover:text-slate-600 transition'
                                >
                                    {expandedOrder === order.id
                                        ? <ChevronUpIcon size={20} />
                                        : <ChevronDownIcon size={20} />
                                    }
                                </button>
                            </div>

                            {/* Expanded Content */}
                            {expandedOrder === order.id && (
                                <div className='p-5'>
                                    <div className='flex flex-col lg:flex-row gap-8'>

                                        {/* Order Items */}
                                        <div className='flex-1'>
                                            <p className='text-sm font-medium text-slate-700 mb-3'>
                                                Items
                                            </p>
                                            <div className='flex flex-col gap-4'>
                                                {order.orderItems.map((item, index) => (
                                                    <div key={index} className='flex gap-3 items-center justify-between'>
                                                        <div className='flex gap-3 items-center'>
                                                            <Image
                                                                src={item.product.images[0]}
                                                                alt={item.product.name}
                                                                width={60}
                                                                height={60}
                                                                className='w-14 h-14 object-cover rounded-lg bg-slate-100'
                                                            />
                                                            <div>
                                                                <p className='text-sm font-medium text-slate-700'>
                                                                    {item.product.name}
                                                                </p>
                                                                <p className='text-xs text-slate-400'>
                                                                    Qty: {item.quantity}
                                                                </p>
                                                                <p className='text-sm text-slate-600'>
                                                                    {currency}{item.price}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {order.status === 'DELIVERED' && (
                                                            <button
                                                                onClick={() => setSelectedProduct({
                                                                    productId: item.product.id,
                                                                    orderId: order.id,
                                                                    productName: item.product.name,
                                                                    productImage: item.product.images[0],
                                                                })}
                                                                className='text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition'
                                                            >
                                                                Rate
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Address */}
                                            {order.address && (
                                                <div className='mt-4 pt-4 border-t border-slate-100'>
                                                    <p className='text-xs text-slate-400'>Delivery to</p>
                                                    <p className='text-sm text-slate-600 mt-1'>
                                                        {order.address.name}, {order.address.street}, {order.address.city}, {order.address.state} {order.address.zip}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Timeline */}
                                        <div className='lg:w-64'>
                                            <p className='text-sm font-medium text-slate-700 mb-3'>
                                                Order Tracking
                                            </p>
                                            <OrderTimeline status={order.status} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <RatingModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    )
}