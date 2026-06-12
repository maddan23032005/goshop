'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useUser } from '@clerk/nextjs'

export default function CreateStore() {
    const router = useRouter()
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [storeInfo, setStoreInfo] = useState({
        name: '',
        username: '',
        email: user?.emailAddresses[0]?.emailAddress || '',
        contact: '',
        address: '',
        description: '',
        logo: '',
    })

    const handleChange = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...storeInfo,
                    logo: user?.imageUrl || '',
                })
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Failed to create store')
                return
            }

            toast.success('Store created! Waiting for admin approval.')
            router.push('/store')

        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='max-w-2xl mx-auto px-6 py-16'>
            <h1 className='text-3xl font-medium text-slate-700 mb-2'>
                Create Your <span className='text-green-600'>Store</span>
            </h1>
            <p className='text-slate-400 text-sm mb-8'>
                Fill in your store details. Your store will be reviewed and activated by an admin.
            </p>

            <form onSubmit={handleSubmit} className='flex flex-col gap-5'>

                <div className='flex flex-col gap-1.5'>
                    <label className='text-sm text-slate-600 font-medium'>Store Name</label>
                    <input
                        type='text'
                        name='name'
                        value={storeInfo.name}
                        onChange={handleChange}
                        placeholder='e.g. Happy Electronics'
                        className='p-3 border border-slate-200 rounded-lg outline-none focus:border-green-400 text-sm'
                        required
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label className='text-sm text-slate-600 font-medium'>
                        Username <span className='text-slate-400 font-normal'>(your store URL: gocart.com/shop/username)</span>
                    </label>
                    <input
                        type='text'
                        name='username'
                        value={storeInfo.username}
                        onChange={handleChange}
                        placeholder='e.g. happyelectronics'
                        className='p-3 border border-slate-200 rounded-lg outline-none focus:border-green-400 text-sm'
                        required
                    />
                </div>

                <div className='flex gap-4'>
                    <div className='flex flex-col gap-1.5 flex-1'>
                        <label className='text-sm text-slate-600 font-medium'>Email</label>
                        <input
                            type='email'
                            name='email'
                            value={storeInfo.email}
                            onChange={handleChange}
                            placeholder='store@example.com'
                            className='p-3 border border-slate-200 rounded-lg outline-none focus:border-green-400 text-sm'
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-1.5 flex-1'>
                        <label className='text-sm text-slate-600 font-medium'>Contact</label>
                        <input
                            type='text'
                            name='contact'
                            value={storeInfo.contact}
                            onChange={handleChange}
                            placeholder='+1 234 567 890'
                            className='p-3 border border-slate-200 rounded-lg outline-none focus:border-green-400 text-sm'
                            required
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label className='text-sm text-slate-600 font-medium'>Store Address</label>
                    <input
                        type='text'
                        name='address'
                        value={storeInfo.address}
                        onChange={handleChange}
                        placeholder='123 Main St, City, State, Country'
                        className='p-3 border border-slate-200 rounded-lg outline-none focus:border-green-400 text-sm'
                        required
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label className='text-sm text-slate-600 font-medium'>Store Description</label>
                    <textarea
                        name='description'
                        value={storeInfo.description}
                        onChange={handleChange}
                        placeholder='Tell customers what your store is about...'
                        rows={4}
                        className='p-3 border border-slate-200 rounded-lg outline-none focus:border-green-400 text-sm resize-none'
                        required
                    />
                </div>

                <button
                    type='submit'
                    disabled={loading}
                    className='bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-lg transition font-medium mt-2'
                >
                    {loading ? 'Creating Store...' : 'Create Store'}
                </button>

            </form>
        </div>
    )
}