import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: {
        default: 'GoShop',
        template: '%s | GoShop'
    },
    description: 'GoShop is a multi-vendor e-commerce platform. Find the best products from top sellers at unbeatable prices.',
    keywords: ['ecommerce', 'shopping', 'online store', 'buy online', 'goshop'],
    authors: [{ name: 'GoShop' }],
    creator: 'GoShop',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_APP_URL,
        siteName: 'GoShop',
        title: 'GoShop — Shop Smarter',
        description: 'Find the best products from top sellers at unbeatable prices.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'GoCart',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GoShop — Shop Smarter',
        description: 'Find the best products from top sellers at unbeatable prices.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        }
    }
};

export default async function RootLayout({ children }) {
    const locale = await getLocale()
    const messages = await getMessages()

    return (
        <ClerkProvider>
            <html lang={locale}>
                <body className='antialiased'>
                    <NextIntlClientProvider messages={messages}>
                        <StoreProvider>
                            <Toaster />
                            {children}
                        </StoreProvider>
                    </NextIntlClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
