import Footer from "../components/footer";
import FeaturedCollections from "../landing/featuredcollection";
import HeroSection from "../landing/herosection";
import ShopByCategory from "../landing/shobbycategory";
import Navbar from "../components/navbar";


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