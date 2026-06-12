import Hero from "@/components/Hero";
import Banner from "@/components/Banner";
import BestSelling from "@/components/BestSelling";
import LatestProducts from "@/components/LatestProducts";
import OurSpec from "@/components/OurSpec";
import Newsletter from "@/components/Newsletter";

export default function Home() {
    return (
        <>
            <Hero />
            <BestSelling />
            <Banner />
            <LatestProducts />
            <OurSpec />
            <Newsletter />
        </>
    )
}
