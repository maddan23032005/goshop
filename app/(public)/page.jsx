import Hero from "@/components/Hero";
import Banner from "@/components/Banner";
import BestSelling from "@/components/BestSelling";
import LatestProducts from "@/components/LatestProducts";
import OurSpec from "@/components/OurSpec";
import Newsletter from "@/components/Newsletter";
import Recommendations from "@/components/Recommendations";

export default function Home() {
    return (
        <>
            <Hero />
            <BestSelling />
            <Banner />
            <LatestProducts />
            <div className='max-w-7xl mx-auto px-6'>
                <Recommendations type='personalized' />
            </div>
            <div className='max-w-7xl mx-auto px-6'>
                <Recommendations type='trending' />
            </div>
            <OurSpec />
            <Newsletter />
        </>
    )
}
