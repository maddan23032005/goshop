import Link from 'next/link'

export default function OfflinePage() {
    return (
        <div className='min-h-screen flex flex-col items-center justify-center px-6 text-center'>
            <div className='text-6xl mb-6'>📦</div>
            <h1 className='text-2xl font-medium text-slate-700 mb-3'>
                You&apos;re Offline
            </h1>
            <p className='text-slate-400 max-w-sm mb-8'>
                It looks like you lost your internet connection.
                Please check your connection and try again.
            </p>
            <Link
                href='/'
                className='px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium'
            >
                Try Again
            </Link>
        </div>
    )
}
