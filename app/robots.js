export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/store/',
                    '/api/',
                    '/cart',
                    '/orders',
                    '/wishlist',
                ],
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
