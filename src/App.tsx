import { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ReviewsCarousel } from './components/ReviewsCarousel';
import { FeaturesSection } from './components/FeaturesSection';
import { StockPhotosPreview } from './components/StockPhotosPreview';
import { ConfiguratorSection } from './components/ConfiguratorSection';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { SEO, SEOConfig } from './components/SEO';

// Lazy load pages
const StockPhotosPage = lazy(() => import('./components/StockPhotosPage').then(m => ({ default: m.StockPhotosPage })));
const AccountPage = lazy(() => import('./components/AccountPage').then(m => ({ default: m.AccountPage })));

type Page = 'home' | 'stock-photos' | 'account';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const defaultSEO: SEOConfig = {
    title: "Bespoke Metal Prints | Premium HD Metal Wall Art Printing",
    description: "Transform your photos into stunning metal prints. Premium HD quality, vibrant colors, and professional craftsmanship. Free shipping on orders over $150.",
    canonical: "https://www.bespokemetalprints.com",
    keywords: "metal prints, photo printing, wall art, HD metal prints, custom prints",
  };

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <CartProvider>
          <SEO {...defaultSEO} />
          <ScrollToTop />
          <Navigation
            onGoHome={() => setCurrentPage('home')}
            onStockPhotosClick={() => setCurrentPage('stock-photos')}
          />
          <main className="min-h-screen">
            {currentPage === 'home' && (
              <>
                <HeroSection />
                <ReviewsCarousel />
                <ConfiguratorSection />
                <FeaturesSection />
                <StockPhotosPreview />
              </>
            )}
            {currentPage === 'stock-photos' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <StockPhotosPage />
              </Suspense>
            )}
            {currentPage === 'account' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <AccountPage />
              </Suspense>
            )}
          </main>
          <Footer />
        </CartProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
