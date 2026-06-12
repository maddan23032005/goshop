'use client'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const AddressModal = ({ addresses, selectedAddress, setSelectedAddress, onClose, onAddressAdded }) => {
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newAddress, setNewAddress] = useState({
        name: '', email: '', phone: '',
        street: '', city: '', state: '',
        zip: '', country: '',
    })

    const handleChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value })
    }

    const handleSaveAddress = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddress)
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || 'Failed to save address')
                return
            }
            toast.success('Address saved!')
            onAddressAdded()
            setShowForm(false)
            setNewAddress({
                name: '', email: '', phone: '',
                street: '', city: '', state: '',
                zip: '', country: '',
            })
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (addressId) => {
        try {
            const res = await fetch(`/api/address?addressId=${addressId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success('Address deleted')
                onAddressAdded()
            }
        } catch (error) {
            toast.error('Failed to delete address')
        }
    }

    return (
        <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4'>
            <div className='bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-medium text-slate-700'>
                        {showForm ? 'Add New Address' : 'Select Address'}
                    </h3>
                    <button onClick={onClose} className='text-slate-400 hover:text-slate-600'>
                        <XIcon size={20} />
                    </button>
                </div>

                {!showForm ? (
                    <>
                        {/* Address List */}
                        <div className='flex flex-col gap-3 mb-4'>
                            {addresses.length === 0 ? (
                                <p className='text-slate-400 text-sm text-center py-4'>
                                    No addresses yet
                                </p>
                            ) : (
                                addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        onClick={() => {
                                            setSelectedAddress(address)
                                            onClose()
                                        }}
                                        className={`p-3 border rounded-lg cursor-pointer transition text-sm ${
                                            selectedAddress?.id === address.id
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <p className='font-medium text-slate-700'>{address.name}</p>
                                        <p className='text-slate-500 text-xs mt-0.5'>
                                            {address.street}, {address.city}, {address.state} {address.zip}
                                        </p>
                                        <p className='text-slate-400 text-xs'>{address.phone}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(address.id)
                                            }}
                                            className='text-red-400 text-xs mt-1 hover:text-red-600'
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setShowForm(true)}
                            className='w-full py-2 border border-dashed border-slate-300 text-slate-500 text-sm rounded-lg hover:bg-slate-50 transition'
                        >
                            + Add New Address
                        </button>
                    </>
                ) : (
                    /* Add Address Form */
                    <form onSubmit={handleSaveAddress} className='flex flex-col gap-3'>
                        {[
                            { name: 'name', placeholder: 'Full Name' },
                            { name: 'email', placeholder: 'Email', type: 'email' },
                            { name: 'phone', placeholder: 'Phone Number' },
                            { name: 'street', placeholder: 'Street Address' },
                            { name: 'city', placeholder: 'City' },
                            { name: 'state', placeholder: 'State' },
                            { name: 'zip', placeholder: 'ZIP Code' },
                            { name: 'country', placeholder: 'Country' },
                        ].map((field) => (
                            <input
                                key={field.name}
                                type={field.type || 'text'}
                                name={field.name}
                                placeholder={field.placeholder}
                                value={newAddress[field.name]}
                                onChange={handleChange}
                                className='p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-400'
                                required
                            />
                        ))}

                        <div className='flex gap-3 mt-2'>
                            <button
                                type='button'
                                onClick={() => setShowForm(false)}
                                className='flex-1 py-2 border border-slate-200 text-slate-500 text-sm rounded-lg hover:bg-slate-50 transition'
                            >
                                Back
                            </button>
                            <button
                                type='submit'
                                disabled={loading}
                                className='flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-green-300 transition'
                            >
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default AddressModal