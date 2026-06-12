import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
    const cookieStore = await cookies()
    const locale = cookieStore.get('locale')?.value || 'en'

    const validLocales = ['en', 'ta', 'hi']
    const finalLocale = validLocales.includes(locale) ? locale : 'en'

    return {
        locale: finalLocale,
        messages: (await import(`../messages/${finalLocale}.json`)).default
    }
})
