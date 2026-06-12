'use client'
import { useEffect } from 'react'

const ServiceWorkerRegister = () => {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('SW registered:', registration.scope)
                })
                .catch((error) => {
                    console.error('SW registration failed:', error)
                })
        }
    }, [])

    return null
}

export default ServiceWorkerRegister
