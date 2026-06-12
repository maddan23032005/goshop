'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, XIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { dummyStoreData } from "@/assets/assets"

const StoreLayout = ({ children }) => {
    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const fetchIsSeller = async () => {
        setIsSeller(true)
        setStoreInfo(dummyStoreData)
        setLoading(false)
    }

    useEffect(() => {
        fetchIsSeller()
    }, [])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                {/* Desktop Sidebar */}
                <div className="hidden md:block shrink-0">
                    <SellerSidebar storeInfo={storeInfo} />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
                            <div className="flex justify-end p-4">
                                <button onClick={() => setSidebarOpen(false)}>
                                    <XIcon size={20} className="text-slate-500" />
                                </button>
                            </div>
                            <SellerSidebar storeInfo={storeInfo} />
                        </div>
                    </div>
                )}

                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default StoreLayout