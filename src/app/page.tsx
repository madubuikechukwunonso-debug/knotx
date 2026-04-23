import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ManifestoSection from '@/components/ManifestoSection';
import HomeGallerySection from '@/components/HomeGallerySection';
import ServicesSection from '@/components/ServicesSection';
import ProductsSection from '@/components/ProductsSection';
import NewsletterSection from '@/components/NewsletterSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <ManifestoSection />
      <HomeGallerySection />
      <ServicesSection />
      <ProductsSection />
      <NewsletterSection />
      <Footer />
    </>
  );
}
