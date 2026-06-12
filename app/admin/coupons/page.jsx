'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Trash2Icon } from 'lucide-react'
import Loading from '@/components/Loading'

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: true,
        expiresAt: format(new Date(), 'yyyy-MM-dd')
    })

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons')
            const data = await res.json()
            setCoupons(data)
        } catch (error) {
            console.error('Failed to fetch coupons:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCoupon,
                    discount: parseFloat(newCoupon.discount),
                    expiresAt: new Date(newCoupon.expiresAt),
                })
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || 'Failed to add coupon')
                return
            }
            toast.success('Coupon added!')
            fetchCoupons()
            setNewCoupon({
                code: '',
                description: '',
                discount: '',
                forNewUser: false,
                forMember: false,
                isPublic: true,
                expiresAt: format(new Date(), 'yyyy-MM-dd')
            })
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    const deleteCoupon = async (code) => {
        try {
            const res = await fetch(`/api/admin/coupons?code=${code}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success('Coupon deleted!')
                fetchCoupons()
            }
        } catch (error) {
            toast.error('Failed to delete coupon')
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    if (loading) return <Loading />

    return (
        <div className='text-slate-500 mb-40'>
            {/* Add Coupon Form */}
            <form onSubmit={handleAddCoupon} className='max-w-sm text-sm'>
                <h2 className='text-2xl'>Add <span className='text-slate-800 font-medium'>Coupons</span></h2>

                <div className='flex gap-2 mt-4'>
                    <input
                        type='text'
                        placeholder='Coupon Code'
                        className='w-full p-2 border border-slate-200 outline-slate-400 rounded-md'
                        value={newCoupon.code}
                        onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        required
                    />
                    <input
                        type='number'
                        placeholder='Discount %'
                        min={1}
                        max={100}
                        className='w-full p-2 border border-slate-200 outline-slate-400 rounded-md'
                        value={newCoupon.discount}
                        onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                        required
                    />
                </div>

                <input
                    type='text'
                    placeholder='Description'
                    className='w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md'
                    value={newCoupon.description}
                    onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    required
                />

                <div className='mt-2'>
                    <p className='mb-1'>Expiry Date</p>
                    <input
                        type='date'
                        className='w-full p-2 border border-slate-200 outline-slate-400 rounded-md'
                        value={newCoupon.expiresAt}
                        onChange={e => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    />
                </div>

                {/* Toggles */}
                <div className='flex flex-col gap-3 mt-4'>
                    {[
                        { label: 'For New Users Only', key: 'forNewUser' },
                        { label: 'For Members Only', key: 'forMember' },
                        { label: 'Public Coupon', key: 'isPublic' },
                    ].map((toggle) => (
                        <label key={toggle.key} className='flex items-center gap-3 cursor-pointer'>
                            <div className='relative'>
                                <input
                                    type='checkbox'
                                    className='sr-only'
                                    checked={newCoupon[toggle.key]}
                                    onChange={e => setNewCoupon({ ...newCoupon, [toggle.key]: e.target.checked })}
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${newCoupon[toggle.key] ? 'bg-green-500' : 'bg-slate-300'}`} />
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${newCoupon[toggle.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                            <span>{toggle.label}</span>
                        </label>
                    ))}
                </div>

                <button
                    type='submit'
                    className='mt-5 w-full py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition'
                >
                    Add Coupon
                </button>
            </form>

            {/* Coupons List */}
            <div className='mt-10'>
                <h2 className='text-2xl mb-4'>All <span className='text-slate-800 font-medium'>Coupons</span></h2>

                {coupons.length === 0 ? (
                    <p className='text-slate-400 text-sm'>No coupons yet</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-left border-b border-slate-200'>
                                    <th className='pb-3 font-medium'>Code</th>
                                    <th className='pb-3 font-medium'>Description</th>
                                    <th className='pb-3 font-medium'>Discount</th>
                                    <th className='pb-3 font-medium'>Expires</th>
                                    <th className='pb-3 font-medium'>Type</th>
                                    <th className='pb-3 font-medium'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr key={coupon.code} className='border-b border-slate-100 hover:bg-slate-50'>
                                        <td className='py-3 font-medium text-slate-700'>{coupon.code}</td>
                                        <td className='py-3'>{coupon.description}</td>
                                        <td className='py-3 text-green-600 font-medium'>{coupon.discount}%</td>
                                        <td className='py-3'>{format(new Date(coupon.expiresAt), 'dd MMM yyyy')}</td>
                                        <td className='py-3'>
                                            {coupon.forNewUser ? '🆕 New User' : coupon.forMember ? '⭐ Member' : '🌍 Public'}
                                        </td>
                                        <td className='py-3'>
                                            <button
                                                onClick={() => deleteCoupon(coupon.code)}
                                                className='text-red-400 hover:text-red-600 transition'
                                            >
                                                <Trash2Icon size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}