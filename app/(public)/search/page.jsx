'use client'
import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import Loading from '@/components/Loading'
import { SparklesIcon, SearchIcon } from 'lucide-react'

const exampleSearches = [
    '🎁 Gift for my dad',
    '❄️ Something warm for winter',
    '💪 Fitness equipment under $50',
    '📚 Books for kids',
    '🎮 Gaming accessories',
    '💄 Beauty products for women',
]

export default function SmartSearchPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) return
        setLoading(true)
        setSearched(true)
        try {
            const res = await fetch('/api/ai/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            })
            const data = await res.json()
            setResults(data)
        } catch (error) {
            console.error('Search failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExample = (example) => {
        const text = example.slice(2)
        setQuery(text)
        handleSearch(text)
    }

    return (
        <div className='max-w-7xl mx-auto px-6 py-10'>

            {/* Header */}
            <div className='text-center mb-10'>
                <div className='flex items-center justify-center gap-2 mb-3'>
                    <SparklesIcon size={24} className='text-purple-500' />
                    <h1 className='text-3xl font-medium text-slate-700'>
                        AI Smart Search
                    </h1>
                </div>
                <p className='text-slate-400 max-w-md mx-auto'>
                    Search by meaning, not just keywords. Try natural language like
                    "gift for my dad" or "something warm for winter"
                </p>
            </div>

            {/* Search Bar */}
            <div className='max-w-2xl mx-auto mb-8'>
                <div className='flex gap-3'>
                    <div className='flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-purple-400 transition'>
                        <SearchIcon size={18} className='text-slate-400 shrink-0' />
                        <input
                            type='text'
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder='Describe what you are looking for...'
                            className='flex-1 bg-transparent outline-none text-slate-700 placeholder-slate-400'
                        />
                    </div>
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading || !query.trim()}
                        className='px-6 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-2xl transition font-medium flex items-center gap-2'
                    >
                        <SparklesIcon size={16} />
                        Search
                    </button>
                </div>

                {/* Example Searches */}
                {!searched && (
                    <div className='flex flex-wrap gap-2 mt-4 justify-center'>
                        {exampleSearches.map((example, index) => (
                            <button
                                key={index}
                                onClick={() => handleExample(example)}
                                className='text-sm px-4 py-2 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-600 rounded-full transition'
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Results */}
            {loading ? (
                <Loading />
            ) : searched && results.length === 0 ? (
                <div className='text-center text-slate-400 py-16'>
                    <SparklesIcon size={40} className='mx-auto mb-3 text-slate-200' />
                    <p className='text-lg'>No matching products found</p>
                    <p className='text-sm mt-1'>Try a different description</p>
                </div>
            ) : results.length > 0 ? (
                <div>
                    <p className='text-sm text-slate-400 mb-6 text-center'>
                        Found {results.length} products matching "{query}"
                    </p>
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
                        {results.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
