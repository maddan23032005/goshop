'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import Loading from '@/components/Loading'
import { CameraIcon, UploadIcon, SparklesIcon, XIcon } from 'lucide-react'

export default function ImageSearchPage() {
    const [selectedImage, setSelectedImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [analysis, setAnalysis] = useState('')
    const fileRef = useRef(null)

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSelectedImage(file)
        setPreview(URL.createObjectURL(file))
        setResults(null)
        setAnalysis('')
    }

    const handleSearch = async () => {
        if (!selectedImage) return
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('image', selectedImage)

            const res = await fetch('/api/ai/image-search', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (data.error) {
                alert(data.error)
                return
            }

            setAnalysis(data.analysis)
            setResults(data.products)

        } catch (error) {
            console.error('Image search failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const clearImage = () => {
        setSelectedImage(null)
        setPreview(null)
        setResults(null)
        setAnalysis('')
    }

    return (
        <div className='max-w-7xl mx-auto px-6 py-10'>

            {/* Header */}
            <div className='text-center mb-10'>
                <div className='flex items-center justify-center gap-2 mb-3'>
                    <CameraIcon size={24} className='text-green-500' />
                    <h1 className='text-3xl font-medium text-slate-700'>
                        AI Image Search
                    </h1>
                </div>
                <p className='text-slate-400 max-w-md mx-auto'>
                    Upload a photo of any product and we'll find similar items in our store using AI
                </p>
            </div>

            {/* Upload Area */}
            <div className='max-w-xl mx-auto mb-10'>
                {!preview ? (
                    <label
                        htmlFor='imageUpload'
                        className='flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition'
                    >
                        <UploadIcon size={40} className='text-slate-300 mb-3' />
                        <p className='text-slate-500 font-medium'>
                            Click to upload an image
                        </p>
                        <p className='text-slate-400 text-sm mt-1'>
                            PNG, JPG, WEBP up to 10MB
                        </p>
                        <input
                            id='imageUpload'
                            ref={fileRef}
                            type='file'
                            accept='image/*'
                            onChange={handleImageSelect}
                            hidden
                        />
                    </label>
                ) : (
                    <div className='relative'>
                        <div className='relative w-full h-64 rounded-2xl overflow-hidden bg-slate-100'>
                            <Image
                                src={preview}
                                alt='Selected'
                                fill
                                className='object-contain'
                            />
                        </div>
                        <button
                            onClick={clearImage}
                            className='absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition'
                        >
                            <XIcon size={16} className='text-slate-500' />
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className='w-full mt-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl transition font-medium flex items-center justify-center gap-2'
                        >
                            {loading ? (
                                <>
                                    <SparklesIcon size={18} className='animate-spin' />
                                    Analyzing Image...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon size={18} />
                                    Find Similar Products
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* AI Analysis */}
            {analysis && (
                <div className='max-w-xl mx-auto mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200'>
                    <p className='text-xs font-medium text-slate-500 mb-2 flex items-center gap-1'>
                        <SparklesIcon size={12} />
                        AI Analysis
                    </p>
                    <pre className='text-xs text-slate-600 whitespace-pre-line font-sans'>
                        {analysis}
                    </pre>
                </div>
            )}

            {/* Results */}
            {loading ? (
                <Loading />
            ) : results !== null && (
                <div>
                    <h2 className='text-xl font-medium text-slate-700 mb-6 text-center'>
                        {results.length > 0
                            ? `Found ${results.length} similar products`
                            : 'No similar products found'
                        }
                    </h2>
                    {results.length > 0 && (
                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
                            {results.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
