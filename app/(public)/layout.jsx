import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Banner from "@/components/Banner";
import AIChatbot from "@/components/AIChatbot";
import OrderAssistant from "@/components/OrderAssistant";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PWAInstallButton from "@/components/PWAInstallButton";
import AgentChat from "@/components/AgentChat";

export default function PublicLayout({ children }) {
    return (
        <div className='min-h-screen flex flex-col'>
            <ServiceWorkerRegister />
            <Banner />
            <Navbar />
            <main className='flex-1'>
                {children}
            </main>
            <Footer />
            <AIChatbot />
            <OrderAssistant />
            <AgentChat />
            <PWAInstallButton />
        </div>
    )
}
