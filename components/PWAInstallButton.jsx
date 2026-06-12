'use client'
import { useEffect, useState } from 'react'
import { DownloadIcon, XIcon } from 'lucide-react'

const PWAInstallButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowBanner(true)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setShowBanner(false)
            setDeferredPrompt(null)
        }
    }

    if (!showBanner) return null

    return (
        <div className='fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm'>
            <div className='bg-slate-800 text-white rounded-2xl p-4 flex items-center gap-3 shadow-xl'>
                <div className='w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0'>
                    <span className='text-lg font-bold'>G</span>
                </div>
                <div className='flex-1'>
                    <p className='text-sm font-medium'>Install GoShop App</p>
                    <p className='text-xs text-slate-400'>Fast, offline-ready shopping</p>
                </div>
                <button
                    onClick={handleInstall}
                    className='flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-xs font-medium transition'
                >
                    <DownloadIcon size={12} />
                    Install
                </button>
                <button
                    onClick={() => setShowBanner(false)}
                    className='text-slate-400 hover:text-white transition'
                >
                    <XIcon size={16} />
                </button>
            </div>
        </div>
    )
}

export default PWAInstallButton
