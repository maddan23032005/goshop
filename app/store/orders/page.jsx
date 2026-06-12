'use client'
import Loading from '@/components/Loading'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function StoreOrders() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/store/orders')
            const data = await res.json()
            setOrders(data)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (orderId, status) => {
        try {
            const res = await fetch('/api/store/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status })
            })
            if (res.ok) {
                toast.success('Order status updated!')
                fetchOrders()
            }
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <div className='text-slate-500 mb-28'>
            <h1 className='text-2xl'>Store <span className='text-slate-800 font-medium'>Orders</span></h1>

            {orders.length === 0 ? (
                <p className='text-slate-400 text-sm mt-8'>No orders yet</p>
            ) : (
                <div className='mt-6 flex flex-col gap-5'>
                    {orders.map((order) => (
                        <div key={order.id} className='border border-slate-200 rounded-xl p-5'>

                            {/* Order Header */}
                            <div className='flex flex-wrap justify-between gap-3 mb-4 pb-4 border-b border-slate-100 text-sm'>
                                <div>
                                    <p className='text-xs text-slate-400'>Customer</p>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <Image
                                            src={order.user.image}
                                            alt={order.user.name}
                                            width={28}
                                            height={28}
                                            className='w-7 h-7 rounded-full'
                                        />
                                        <p className='font-medium text-slate-700'>{order.user.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className='text-xs text-slate-400'>Date</p>
                                    <p className='mt-1'>{new Date(order.createdAt).toDateString()}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-slate-400'>Total</p>
                                    <p className='mt-1 font-medium text-slate-700'>{currency}{order.total}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-slate-400'>Payment</p>
                                    <p className='mt-1'>{order.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-slate-400'>Update Status</p>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className='mt-1 text-xs border border-slate-200 rounded-lg p-1.5 outline-none'
                                    >
                                        <option value='ORDER_PLACED'>Order Placed</option>
                                        <option value='PROCESSING'>Processing</option>
                                        <option value='SHIPPED'>Shipped</option>
                                        <option value='DELIVERED'>Delivered</option>
                                    </select>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className='flex flex-col gap-3'>
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className='flex gap-3 items-center'>
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            width={60}
                                            height={60}
                                            className='w-12 h-12 object-cover rounded-lg bg-slate-100'
                                        />
                                        <div className='flex-1'>
                                            <p className='text-sm font-medium text-slate-700'>
                                                {item.product.name}
                                            </p>
                                            <p className='text-xs text-slate-400'>
                                                Qty: {item.quantity} × {currency}{item.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Delivery Address */}
                            {order.address && (
                                <div className='mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400'>
                                    <p>Deliver to: {order.address.name}, {order.address.street}, {order.address.city}, {order.address.state} {order.address.zip}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
