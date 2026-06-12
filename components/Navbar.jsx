'use client'
import { Search, ShoppingCart, HeartIcon, SparklesIcon, CameraIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import Image from "next/image"
import LanguageSwitcher from "./LanguageSwitcher"
import { useTranslations } from 'next-intl'

const Navbar = () => {
    const t = useTranslations('nav')
    const tc = useTranslations('common')
    const router = useRouter()
    const { isSignedIn } = useUser()
    const [search, setSearch] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const wishlistCount = useSelector(state => state.wishlist.items.length)
    const searchRef = useRef(null)

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (search.length < 2) {
                setSuggestions([])
                return
            }
            try {
                const res = await fetch(`/api/product/suggestions?q=${search}`)
                const data = await res.json()
                setSuggestions(data)
                setShowSuggestions(true)
            } catch (error) {
                console.error('Failed to fetch suggestions:', error)
            }
        }
        const debounce = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(debounce)
    }, [search])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = (e) => {
        e?.preventDefault()
        setShowSuggestions(false)
        router.push(`/shop?search=${search}`)
    }

    const handleSuggestionClick = (productId) => {
        setShowSuggestions(false)
        setSearch('')
        router.push(`/product/${productId}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>shop
                        <span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-5 text-slate-600">
                        <Link href="/" className="hover:text-green-600 transition text-sm">{t('home')}</Link>
                        <Link href="/shop" className="hover:text-green-600 transition text-sm">{t('shop')}</Link>
                        <Link href="/search" className="hidden xl:flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition">
                            <SparklesIcon size={14} />
                            {t('aiSearch')}
                        </Link>
                        <Link href="/image-search" className="hidden xl:flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition">
                            <CameraIcon size={14} />
                            {t('imageSearch')}
                        </Link>

                        {/* Search with Autocomplete */}
                        <div ref={searchRef} className="relative hidden xl:block">
                            <form onSubmit={handleSearch} className="flex items-center w-56 text-sm gap-2 bg-slate-100 px-4 py-2.5 rounded-full">
                                <Search size={16} className="text-slate-500 shrink-0" />
                                <input
                                    className="w-full bg-transparent outline-none placeholder-slate-500 text-sm"
                                    type="text"
                                    placeholder={tc('search')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                />
                            </form>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                    {suggestions.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSuggestionClick(product.id)}
                                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition text-left"
                                        >
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                width={36}
                                                height={36}
                                                className="w-9 h-9 object-cover rounded-lg bg-slate-100"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-700 truncate">{product.name}</p>
                                                <p className="text-xs text-slate-400">{product.category}</p>
                                            </div>
                                            <p className="text-sm font-medium text-green-600">${product.price}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="relative flex items-center gap-1 text-slate-600 hover:text-green-600 transition text-sm">
                            <HeartIcon size={16} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-2 text-[8px] text-white bg-red-500 size-3.5 rounded-full flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative flex items-center gap-1.5 text-slate-600 hover:text-green-600 transition text-sm">
                            <ShoppingCart size={16} />
                            {t('cart')}
                            {cartCount > 0 && (
                                <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <LanguageSwitcher />

                        {/* Auth */}
                        {isSignedIn ? (
                            <div className="flex items-center gap-3">
                                <Link href="/store" className="text-sm hover:text-green-600 transition">
                                    {t('myStore')}
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm">
                                    {t('login')}
                                </button>
                            </SignInButton>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden flex items-center gap-3">
                        <Link href="/cart" className="relative">
                            <ShoppingCart size={20} className="text-slate-600" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        {isSignedIn ? (
                            <UserButton afterSignOutUrl="/" />
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-5 py-1.5 bg-indigo-500 text-sm text-white rounded-full">
                                    {t('login')}
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </div>

            <hr className="border-gray-300" />

            {/* Mobile Search */}
            <div className="xl:hidden px-6 pb-3">
                <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-full text-sm">
                    <Search size={16} className="text-slate-500 shrink-0" />
                    <input
                        className="w-full bg-transparent outline-none placeholder-slate-500"
                        type="text"
                        placeholder={tc('search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </div>
        </nav>
    )
}

export default Navbar