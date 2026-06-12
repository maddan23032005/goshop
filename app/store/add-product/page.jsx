'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { SparklesIcon, Loader2Icon } from "lucide-react"

export default function StoreAddProduct() {
    const router = useRouter()
    const categories = [
        'Electronics', 'Clothing', 'Home & Kitchen',
        'Beauty & Health', 'Toys & Games', 'Sports & Outdoors',
        'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others'
    ]

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: '',
        description: '',
        mrp: 0,
        price: 0,
        category: '',
    })
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const generateDescription = async () => {
        if (!productInfo.name) {
            toast.error('Please enter product name first!')
            return
        }
        if (!productInfo.category) {
            toast.error('Please select a category first!')
            return
        }

        setGenerating(true)
        try {
            const res = await fetch('/api/ai/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: productInfo.name,
                    category: productInfo.category,
                    mrp: productInfo.mrp,
                    price: productInfo.price,
                })
            })

            const data = await res.json()
            if (data.description) {
                setProductInfo(prev => ({
                    ...prev,
                    description: data.description
                }))
                toast.success('Description generated!')
            }
        } catch (error) {
            toast.error('Failed to generate description')
        } finally {
            setGenerating(false)
        }
    }

    const uploadImage = async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        const data = await res.json()
        return data.url
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const imageFiles = Object.values(images).filter(Boolean)
            if (imageFiles.length === 0) {
                toast.error('Please select at least one image')
                setLoading(false)
                return
            }

            const uploadedUrls = await Promise.all(
                imageFiles.map(file => uploadImage(file))
            )

            const res = await fetch('/api/store/product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...productInfo,
                    images: uploadedUrls,
                })
            })

            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || 'Failed to add product')
                return
            }

            toast.success('Product added successfully!')
            router.push('/store/manage-product')

        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='text-slate-500 mb-28'>
            <h1 className='text-2xl'>Add New <span className='text-slate-800 font-medium'>Product</span></h1>

            {/* Images */}
            <p className='mt-7 mb-3'>Product Images</p>
            <div className='flex gap-3'>
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image
                            width={300}
                            height={300}
                            className='h-16 w-auto border border-slate-200 rounded-lg cursor-pointer object-cover'
                            src={images[key]
                                ? URL.createObjectURL(images[key])
                                : assets.upload_area
                            }
                            alt=""
                        />
                        <input
                            type='file'
                            accept='image/*'
                            id={`images${key}`}
                            onChange={e => setImages({
                                ...images,
                                [key]: e.target.files[0]
                            })}
                            hidden
                        />
                    </label>
                ))}
            </div>

            {/* Name */}
            <label className='flex flex-col gap-2 my-6'>
                <span>Product Name</span>
                <input
                    type='text'
                    name='name'
                    onChange={onChangeHandler}
                    value={productInfo.name}
                    placeholder='Enter product name'
                    className='w-full max-w-sm p-2.5 px-4 outline-none border border-slate-200 rounded-lg focus:border-green-400'
                    required
                />
            </label>

            {/* Category */}
            <label className='flex flex-col gap-2 mb-6'>
                <span>Category</span>
                <select
                    onChange={e => setProductInfo({
                        ...productInfo,
                        category: e.target.value
                    })}
                    value={productInfo.category}
                    className='w-full max-w-sm p-2.5 px-4 outline-none border border-slate-200 rounded-lg focus:border-green-400'
                    required
                >
                    <option value=''>Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </label>

            {/* Prices */}
            <div className='flex gap-5 mb-6'>
                <label className='flex flex-col gap-2'>
                    <span>Original Price ($)</span>
                    <input
                        type='number'
                        name='mrp'
                        onChange={onChangeHandler}
                        value={productInfo.mrp}
                        placeholder='0'
                        className='w-36 p-2.5 px-4 outline-none border border-slate-200 rounded-lg focus:border-green-400'
                        required
                    />
                </label>
                <label className='flex flex-col gap-2'>
                    <span>Offer Price ($)</span>
                    <input
                        type='number'
                        name='price'
                        onChange={onChangeHandler}
                        value={productInfo.price}
                        placeholder='0'
                        className='w-36 p-2.5 px-4 outline-none border border-slate-200 rounded-lg focus:border-green-400'
                        required
                    />
                </label>
            </div>

            {/* Description with AI Generate */}
            <label className='flex flex-col gap-2 mb-6'>
                <div className='flex items-center justify-between max-w-sm'>
                    <span>Description</span>
                    <button
                        type='button'
                        onClick={generateDescription}
                        disabled={generating}
                        className='flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition disabled:opacity-50'
                    >
                        {generating
                            ? <Loader2Icon size={12} className='animate-spin' />
                            : <SparklesIcon size={12} />
                        }
                        {generating ? 'Generating...' : 'AI Generate'}
                    </button>
                </div>
                <textarea
                    name='description'
                    onChange={onChangeHandler}
                    value={productInfo.description}
                    placeholder='Enter product description or use AI to generate one...'
                    rows={5}
                    className='w-full max-w-sm p-2.5 px-4 outline-none border border-slate-200 rounded-lg resize-none focus:border-green-400'
                    required
                />
            </label>

            <button
                type='submit'
                disabled={loading}
                className='bg-slate-800 text-white px-8 py-2.5 rounded-lg hover:bg-slate-900 disabled:bg-slate-400 transition font-medium'
            >
                {loading ? 'Adding Product...' : 'Add Product'}
            </button>
        </form>
    )
}