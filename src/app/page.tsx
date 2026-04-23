import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ManifestoSection from "@/components/ManifestoSection";
import HomeGallerySection from "@/components/HomeGallerySection";
import ServicesSection from "@/components/ServicesSection";
import ProductsSection from "@/components/ProductsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import { listProducts } from "@/modules/products/products.service";

export default async function HomePage() {
  const products = await listProducts();

  return (
    <>
      <Navigation />
      <HeroSection />
      <ManifestoSection />
      <HomeGallerySection />
      <ServicesSection />
      <ProductsSection products={products} />
      <NewsletterSection />
      <Footer />
    </>
  );
}
