import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ManifestoSection from "@/components/ManifestoSection";
import HomeGallerySection from "@/components/HomeGallerySection";
import ServicesSection from "@/components/ServicesSection";
import ProductsSection from "@/components/ProductsSection";
import NewsletterSection from "@/components/NewsletterSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import LenisProvider from "@/providers/LenisProvider";
import { listProducts } from "@/modules/products/products.service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProducts();

  // Fetch random reviews (limit to 6 for performance)
  const reviews = await prisma.review.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      customerName: true,
      rating: true,
      emoji: true,
      comment: true,
      serviceType: true,
      createdAt: true,
    },
  });

  // Shuffle reviews for randomness
  const shuffledReviews = [...reviews].sort(() => Math.random() - 0.5);

  return (
    <LenisProvider>
      <Navigation />
      <HeroSection />
      <ManifestoSection />
      <HomeGallerySection />
      <ServicesSection />
      
      {/* NEW: Customer Reviews Section */}
      <ReviewsSection reviews={shuffledReviews} />

      <ProductsSection products={products} />
      <NewsletterSection />
      <Footer />
    </LenisProvider>
  );
}
