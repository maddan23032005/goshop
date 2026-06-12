'use client'
import Loading from '@/components/Loading'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminApprove() {
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchStores = async () => {
        try {
            const res = await fetch('/api/admin/stores')
            const data = await res.json()
            setStores(data.filter(s => s.status === 'pending'))
        } catch (error) {
            console.error('Failed to fetch stores:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (storeId) => {
        try {
            const res = await fetch('/api/admin/stores', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId,
                    status: 'approved',
                    isActive: true
                })
            })
            if (res.ok) {
                toast.success('Store approved!')
                fetchStores()
            }
        } catch (error) {
            toast.error('Failed to approve store')
        }
    }

    const handleReject = async (storeId) => {
        try {
            const res = await fetch('/api/admin/stores', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId,
                    status: 'rejected',
                    isActive: false
                })
            })
            if (res.ok) {
                toast.success('Store rejected')
                fetchStores()
            }
        } catch (error) {
            toast.error('Failed to reject store')
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    if (loading) return <Loading />

    return (
        <div className='text-slate-500 mb-28'>
            <h1 className='text-2xl'>Approve <span className='text-slate-800 font-medium'>Stores</span></h1>

            {stores.length === 0 ? (
                <p className='text-slate-400 text-sm mt-8'>No pending store approvals</p>
            ) : (
                <div className='mt-6 flex flex-col gap-4'>
                    {stores.map((store) => (
                        <div key={store.id} className='border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4 justify-between'>
                            <div className='flex gap-4'>
                                <Image
                                    src={store.logo}
                                    alt={store.name}
                                    width={60}
                                    height={60}
                                    className='w-14 h-14 rounded-full object-cover bg-slate-100'
                                />
                                <div>
                                    <p className='font-medium text-slate-700'>{store.name}</p>
                                    <p className='text-xs text-slate-400'>@{store.username}</p>
                                    <p className='text-xs text-slate-400 mt-1'>{store.email}</p>
                                    <p className='text-xs text-slate-500 mt-2 max-w-sm'>{store.description}</p>
                                </div>
                            </div>
                            <div className='flex gap-3 items-start'>
                                <button
                                    onClick={() => handleApprove(store.id)}
                                    className='px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition'
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(store.id)}
                                    className='px-5 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition'
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}