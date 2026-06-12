'use client'
import { useTranslate } from '@/hooks/useTranslate'
import { Loader2Icon } from 'lucide-react'

const TranslatedText = ({ text, className = '' }) => {
    const { translated, loading } = useTranslate(text)

    if (loading) {
        return (
            <span className={`flex items-center gap-2 ${className}`}>
                <Loader2Icon size={14} className='animate-spin text-slate-400' />
                <span className='text-slate-400 text-sm'>Translating...</span>
            </span>
        )
    }

    return (
        <span className={className}>
            {translated}
        </span>
    )
}

export default TranslatedText
