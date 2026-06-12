'use client'
import Link from "next/link"
import { MenuIcon } from "lucide-react"

const StoreNavbar = ({ onMenuClick }) => {
    return (
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 transition-all">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-slate-500 hover:text-slate-700"
                >
                    <MenuIcon size={22} />
                </button>
                <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                    <span className="text-green-600">go</span>shop<span className="text-green-600 text-5xl leading-0">.</span>
                    <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                        Store
                    </p>
                </Link>
            </div>
            <div className="flex items-center gap-3">
                <p className="text-sm text-slate-500 hidden sm:block">Hi, Seller</p>
            </div>
        </div>
    )
}

export default StoreNavbar