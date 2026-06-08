import Footer from "../components/footer";
import FeaturedCollections from "../landing/featuredcollection";
import HeroSection from "../landing/herosection";
import ShopByCategory from "../landing/shobbycategory";


export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturedCollections />
      <ShopByCategory />
      <Footer />
    </>
  )
}