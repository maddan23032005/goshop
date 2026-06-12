'use client'
import { useState } from 'react'
import { GlobeIcon, ChevronDownIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
]

const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [current, setCurrent] = useState('en')
    const router = useRouter()

    const switchLanguage = async (code) => {
        try {
            await fetch('/api/language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale: code })
            })
            setCurrent(code)
            setIsOpen(false)
            router.refresh() // Refresh to apply new language
        } catch (error) {
            console.error('Failed to switch language:', error)
        }
    }

    const currentLang = languages.find(l => l.code === current)

    return (
        <div className='relative'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-1.5 text-sm text-slate-600 hover:text-green-600 transition'
            >
                <GlobeIcon size={16} />
                <span>{currentLang?.flag} {currentLang?.label}</span>
                <ChevronDownIcon size={14} />
            </button>

            {isOpen && (
                <div className='absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-36'>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => switchLanguage(lang.code)}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition ${
                                current === lang.code
                                    ? 'bg-green-50 text-green-600 font-medium'
                                    : 'text-slate-600'
                            }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default LanguageSwitcher
