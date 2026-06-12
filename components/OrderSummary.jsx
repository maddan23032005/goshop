'use client'
import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/lib/features/cart/cartSlice'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import AddressModal from './AddressModal'

const OrderSummary = ({ totalPrice, items }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const router = useRouter()

    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [couponInput, setCouponInput] = useState('')
    const [coupon, setCoupon] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/address')
            const data = await res.json()
            setAddresses(data)
            if (data.length > 0) setSelectedAddress(data[0])
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [])

    const handleCoupon = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponInput })
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error)
                return
            }
            setCoupon(data)
            toast.success(`Coupon applied! ${data.discount}% off`)
        } catch (error) {
            toast.error('Failed to apply coupon')
        }
    }

    const discountedTotal = coupon
        ? totalPrice - (totalPrice * coupon.discount / 100)
        : totalPrice

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address')
            return
        }

        setLoading(true)
        try {
            const storeId = items[0].storeId

            // First create the order
            const orderRes = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    addressId: selectedAddress.id,
                    paymentMethod,
                    total: discountedTotal.toFixed(2),
                    storeId,
                    coupon: coupon || {},
                })
            })

            const orderData = await orderRes.json()
            if (!orderRes.ok) {
                toast.error(orderData.error || 'Failed to create order')
                return
            }

            // If Stripe payment selected
            if (paymentMethod === 'STRIPE') {
                const stripeRes = await fetch('/api/stripe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderData.id,
                        items: items.map(item => ({
                            name: item.name || 'Product',
                            image: item.image || '',
                            price: item.price,
                            quantity: item.quantity,
                        }))
                    })
                })

                const stripeData = await stripeRes.json()
                if (stripeData.url) {
                    dispatch(clearCart())
                    window.location.href = stripeData.url
                    return
                }
            }

            // COD flow
            dispatch(clearCart())
            toast.success('Order placed successfully!')
            router.push('/orders')

        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>

            {/* Payment Method */}
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} />
                <label htmlFor="COD" className='cursor-pointer'>Cash on Delivery</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} />
                <label htmlFor="STRIPE" className='cursor-pointer'>Stripe Payment</label>
            </div>

            {/* Address */}
            <div className='my-4 py-4 border-y border-slate-200'>
                <div className='flex justify-between items-center'>
                    <p className='text-slate-400'>Delivery Address</p>
                    <button onClick={() => setShowAddressModal(true)} className='text-green-600 text-xs flex items-center gap-1'>
                        {selectedAddress ? <SquarePenIcon size={12} /> : <PlusIcon size={12} />}
                        {selectedAddress ? 'Change' : 'Add Address'}
                    </button>
                </div>
                {selectedAddress ? (
                    <p className='mt-2 text-xs leading-5'>
                        {selectedAddress.name}, {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                    </p>
                ) : (
                    <p className='text-xs text-slate-400 mt-2'>No address selected</p>
                )}
            </div>

            {/* Coupon */}
            <form onSubmit={handleCoupon} className='flex gap-2 mb-4'>
                <input
                    type='text'
                    placeholder='Coupon code'
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className='flex-1 p-2 border border-slate-200 rounded text-xs outline-none'
                />
                <button type='submit' className='px-3 py-2 bg-slate-700 text-white text-xs rounded hover:bg-slate-800 transition'>
                    Apply
                </button>
            </form>

            {/* Price Breakdown */}
            <div className='flex flex-col gap-2 text-xs'>
                <div className='flex justify-between'>
                    <p>Subtotal</p>
                    <p>{currency}{totalPrice.toFixed(2)}</p>
                </div>
                {coupon && (
                    <div className='flex justify-between text-green-600'>
                        <p>Discount ({coupon.discount}%)</p>
                        <p>-{currency}{(totalPrice * coupon.discount / 100).toFixed(2)}</p>
                    </div>
                )}
                <div className='flex justify-between font-medium text-slate-700 text-sm border-t border-slate-200 pt-2 mt-1'>
                    <p>Total</p>
                    <p>{currency}{discountedTotal.toFixed(2)}</p>
                </div>
            </div>

            <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className='w-full mt-5 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition font-medium'
            >
                {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            {showAddressModal && (
                <AddressModal
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    setSelectedAddress={setSelectedAddress}
                    onClose={() => setShowAddressModal(false)}
                    onAddressAdded={fetchAddresses}
                />
            )}
        </div>
    )
}

export default OrderSummary