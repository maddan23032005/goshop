import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const languageNames = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
}

export async function POST(request) {
    try {
        const { text } = await request.json()
        const cookieStore = await cookies()
        const locale = cookieStore.get('locale')?.value || 'en'

        // No translation needed for English
        if (locale === 'en') {
            return NextResponse.json({ translated: text })
        }

        const targetLanguage = languageNames[locale]

        const response = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional translator. Translate the given text to ${targetLanguage}. 
Return ONLY the translated text, nothing else. No explanations, no quotes.`
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            max_tokens: 500,
            temperature: 0.3,
        })

        const translated = response.choices[0].message.content

        return NextResponse.json({ translated })

    } catch (error) {
        console.error('Translation error:', error)
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
    }
}
