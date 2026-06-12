import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <div className='flex items-center justify-center gap-2 mt-10'>
            {/* Prev */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition'
            >
                <ChevronLeftIcon size={16} />
            </button>

            {/* Page Numbers */}
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 rounded-lg text-sm transition ${
                        currentPage === page
                            ? 'bg-green-600 text-white font-medium'
                            : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                >
                    {page}
                </button>
            ))}

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition'
            >
                <ChevronRightIcon size={16} />
            </button>
        </div>
    )
}

export default Pagination
