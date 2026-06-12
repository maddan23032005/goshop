'use client'
import { useState, useEffect } from 'react'

export const useTranslate = (text) => {
    const [translated, setTranslated] = useState(text)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!text) return

        const translateText = async () => {
            // Check locale cookie
            const locale = document.cookie
                .split('; ')
                .find(row => row.startsWith('locale='))
                ?.split('=')[1] || 'en'

            if (locale === 'en') {
                setTranslated(text)
                return
            }

            setLoading(true)
            try {
                const res = await fetch('/api/ai/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                })
                const data = await res.json()
                if (data.translated) {
                    setTranslated(data.translated)
                }
            } catch (error) {
                console.error('Translation failed:', error)
                setTranslated(text)
            } finally {
                setLoading(false)
            }
        }

        translateText()
    }, [text])

    return { translated, loading }
}
