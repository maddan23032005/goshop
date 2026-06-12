export default function manifest() {
    return {
        name: 'GoShop — Shop Smarter',
        short_name: 'GoShop',
        description: 'Multi-vendor e-commerce platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#16a34a',
        orientation: 'portrait',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],

        categories: ['shopping', 'ecommerce'],
        shortcuts: [
            {
                name: 'Shop',
                url: '/shop',
                description: 'Browse all products',
            },
            {
                name: 'My Orders',
                url: '/orders',
                description: 'View your orders',
            },
            {
                name: 'Cart',
                url: '/cart',
                description: 'View your cart',
            }
        ]
    }
}
