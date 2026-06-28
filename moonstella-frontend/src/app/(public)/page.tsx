import Footer from "../components/shared/footer";
import FeaturedCollections from "../landing/featuredcollection";
import HeroSection from "../landing/herosection";
import ShopByCategory from "../landing/shobbycategory";
import Navbar from "../components/shared/navbar";


export default function LandingPage() {
  return (
    <>
      <Navbar/>
      <HeroSection />
      <FeaturedCollections />
      <ShopByCategory />
      <Footer />
    </>
  )
}