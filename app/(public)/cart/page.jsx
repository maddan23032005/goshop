'use client'
import { useSelector, useDispatch } from 'react-redux'
import { addToCart, removeFromCart, deleteItemFromCart } from '@/lib/features/cart/cartSlice'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import OrderSummary from '@/components/OrderSummary'
import Loading from '@/components/Loading'

export default function CartPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const { cartItems } = useSelector(state => state.cart)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCartProducts = async () => {
            const ids = Object.keys(cartItems)
            if (ids.length === 0) {
                setProducts([])
                setLoading(false)
                return
            }
            try {
                const res = await fetch('/api/product')
                const data = await res.json()
                const cartProducts = (data.products || []).filter(p => ids.includes(p.id))
                setProducts(cartProducts)
            } catch (error) {
                console.error('Failed to fetch cart products:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCartProducts()
    }, [cartItems])

    const totalPrice = products.reduce((sum, product) => {
        return sum + product.price * (cartItems[product.id] || 0)
    }, 0)

    if (loading) return <Loading />

    return (
        <div className='max-w-7xl mx-auto px-6 py-10'>
            <h1 className='text-2xl font-medium text-slate-700 mb-8'>
                Shopping <span className='text-green-600'>Cart</span>
            </h1>

            {products.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-60 text-slate-400'>
                    <p className='text-lg'>Your cart is empty</p>
                    <Link href='/shop' className='mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition'>
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className='flex flex-col lg:flex-row gap-10'>
                    {/* Cart Items */}
                    <div className='flex-1'>
                        {products.map(product => (
                            <div key={product.id} className='flex gap-3 sm:gap-4 py-5 border-b border-slate-100'>
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={100}
                                    height={100}
                                    className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-slate-100 shrink-0'
                                />
                                <div className='flex-1 min-w-0'>
                                    <p className='font-medium text-slate-700 text-sm sm:text-base truncate'>{product.name}</p>
                                    <p className='text-xs sm:text-sm text-slate-400'>{product.category}</p>
                                    <p className='text-green-600 font-medium mt-1 text-sm'>
                                        {currency}{product.price}
                                    </p>
                                    <div className='flex items-center gap-2 sm:gap-3 mt-2'>
                                        <button
                                            onClick={() => dispatch(removeFromCart({ productId: product.id }))}
                                            className='w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-100 transition text-sm'
                                        >
                                            -
                                        </button>
                                        <span className='text-sm font-medium'>
                                            {cartItems[product.id]}
                                        </span>
                                        <button
                                            onClick={() => dispatch(addToCart({ productId: product.id }))}
                                            className='w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-100 transition text-sm'
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => dispatch(deleteItemFromCart({ productId: product.id }))}
                                            className='ml-2 text-red-400 text-xs hover:text-red-600 transition'
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <p className='font-medium text-slate-700 text-sm shrink-0'>
                                    {currency}{(product.price * cartItems[product.id]).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className='w-full lg:w-auto'>
                        <OrderSummary
                            totalPrice={totalPrice}
                            items={products.map(p => ({
                                productId: p.id,
                                quantity: cartItems[p.id],
                                price: p.price,
                                storeId: p.storeId,
                            }))}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}