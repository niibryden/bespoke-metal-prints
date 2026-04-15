import { useState, useEffect, Suspense, lazy, startTransition } from 'react';
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
import { initializeAuthSubscription, cleanupAuthSubscription, safeSignOut } from './utils/supabase/auth-manager';

// Lazy load pages
const StockPhotosPage = lazy(() => import('./components/StockPhotosPage').then(m => ({ default: m.StockPhotosPage })));
const AccountPage = lazy(() => import('./components/AccountPage').then(m => ({ default: m.AccountPage })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminBootstrap = lazy(() => import('./components/AdminBootstrap').then(m => ({ default: m.AdminBootstrap })));
const PhotographerDashboard = lazy(() => import('./components/PhotographerDashboard').then(m => ({ default: m.PhotographerDashboard })));
const PhotographerLoginPage = lazy(() => import('./components/PhotographerLoginPage').then(m => ({ default: m.PhotographerLoginPage })));
const PhotographerSignupPage = lazy(() => import('./components/PhotographerSignupPage').then(m => ({ default: m.PhotographerSignupPage })));
const PhotographerMarketplaceHub = lazy(() => import('./components/PhotographerMarketplaceHub').then(m => ({ default: m.default })));
const MarketplacePage = lazy(() => import('./components/MarketplaceBrowsePage').then(m => ({ default: m.MarketplaceBrowsePage })));
const CartCheckoutPage = lazy(() => import('./components/CartCheckoutPage').then(m => ({ default: m.CartCheckoutPage })));
const TermsConditions = lazy(() => import('./components/TermsConditionsPage').then(m => ({ default: m.TermsConditionsPage })));
const RefundPolicy = lazy(() => import('./components/RefundPolicyPage').then(m => ({ default: m.RefundPolicyPage })));
const ShippingPolicy = lazy(() => import('./components/ShippingPolicyPage').then(m => ({ default: m.ShippingPolicyPage })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const MetalPrintsExplained = lazy(() => import('./components/MetalPrintsExplainedPage').then(m => ({ default: m.MetalPrintsExplainedPage })));
const MetalPrintsVsCanvas = lazy(() => import('./components/MetalPrintsVsCanvasPage').then(m => ({ default: m.MetalPrintsVsCanvasPage })));
const MetalPrintsVsAcrylic = lazy(() => import('./components/MetalPrintsVsAcrylicPage').then(m => ({ default: m.MetalPrintsVsAcrylicPage })));
const MetalPrintsVsPaper = lazy(() => import('./components/MetalPrintsVsPaperPage').then(m => ({ default: m.MetalPrintsVsPaperPage })));
const ProductsPage = lazy(() => import('./components/ProductsPage').then(m => ({ default: m.ProductsPage })));
const FAQPage = lazy(() => import('./components/FAQPage').then(m => ({ default: m.FAQPage })));
const AboutPage = lazy(() => import('./components/AboutPage').then(m => ({ default: m.AboutPage })));
const SizeGuidePage = lazy(() => import('./components/SizeGuidePage').then(m => ({ default: m.SizeGuidePage })));
const HDMetalPrintGuidePage = lazy(() => import('./components/HDMetalPrintGuidePage').then(m => ({ default: m.HDMetalPrintGuidePage })));
const CareInstructionsPage = lazy(() => import('./components/CareInstructionsPage').then(m => ({ default: m.CareInstructionsPage })));
const ReviewsPage = lazy(() => import('./components/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const TrackingPage = lazy(() => import('./components/TrackingPage').then(m => ({ default: m.TrackingPage })));
const CompleteGuidePage = lazy(() => import('./components/CompleteGuidePage').then(m => ({ default: m.CompleteGuidePage })));

type Page = 
  | 'home' 
  | 'stock-photos' 
  | 'account' 
  | 'admin' 
  | 'admin/bootstrap' 
  | 'photographer' 
  | 'marketplace'
  | 'cart-checkout'
  | 'terms-conditions' 
  | 'refund-policy' 
  | 'shipping-policy' 
  | 'privacy-policy' 
  | 'metal-prints-explained' 
  | 'metal-prints-vs-canvas'
  | 'metal-prints-vs-acrylic'
  | 'metal-prints-vs-paper'
  | 'products'
  | 'faq'
  | 'about'
  | 'size-guide'
  | 'hd-metal-print-guide'
  | 'care-instructions'
  | 'reviews'
  | 'tracking'
  | 'complete-guide';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [photographerInfo, setPhotographerInfo] = useState<any>(null);
  const [photographerView, setPhotographerView] = useState<'hub' | 'signup' | 'login' | 'dashboard'>('hub');
  const [selectedStockPhoto, setSelectedStockPhoto] = useState<string | null>(null);

  // Handle URL hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      const path = window.location.pathname;
      
      // Support both hash and path routing
      const route = hash || path.slice(1);
      
      // Wrap page navigation in startTransition to avoid suspense errors
      startTransition(() => {
        if (route === 'admin' || route === '/admin') {
          setCurrentPage('admin');
        } else if (route === 'admin/bootstrap' || route === '/admin/bootstrap') {
          setCurrentPage('admin/bootstrap');
        } else if (route === 'photographer' || route === '/photographer') {
          setCurrentPage('photographer');
        } else if (route === 'stock-photos' || route === '/stock-photos') {
          setCurrentPage('stock-photos');
        } else if (route === 'marketplace' || route === '/marketplace') {
          setCurrentPage('marketplace');
        } else if (route === 'account' || route === '/account') {
          setCurrentPage('account');
        }
      });
    };
    
    // Check on mount
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const defaultSEO: SEOConfig = {
    title: "Bespoke Metal Prints | Premium HD Metal Wall Art Printing",
    description: "Transform your photos into stunning metal prints. Premium HD quality, vibrant colors, and professional craftsmanship. Free shipping on orders over $100.",
    canonical: "https://www.bespokemetalprints.com",
    keywords: "metal prints, photo printing, wall art, HD metal prints, custom prints",
  };

  const handleAdminLogout = () => {
    setAdminInfo(null);
    startTransition(() => {
      setCurrentPage('home');
    });
  };

  const handlePhotographerLogout = () => {
    setPhotographerInfo(null);
    startTransition(() => {
      setCurrentPage('home');
    });
  };

  const navigateToPage = (page: Page) => {
    startTransition(() => {
      setCurrentPage(page);
      // Update URL hash to match current page
      if (page !== 'home') {
        window.location.hash = page;
      } else {
        // Clear hash for home page
        history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    });
  };

  const handleStockPhotoSelect = (imageUrl: string) => {
    startTransition(() => {
      setSelectedStockPhoto(imageUrl);
    });
    navigateToPage('home');
  };

  const handleStockPhotoProcessed = () => {
    startTransition(() => {
      setSelectedStockPhoto(null);
    });
  };

  const handleReorder = (orderDetails: any) => {
    console.log('Reorder requested:', orderDetails);
    startTransition(() => {
      // Navigate to home with the selected image
      if (orderDetails.image || orderDetails.imageUrl) {
        setSelectedStockPhoto(orderDetails.image || orderDetails.imageUrl);
      }
    });
    navigateToPage('home');
    // Scroll to configurator after a brief delay
    setTimeout(() => {
      const element = document.getElementById('configurator');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleAccountSignOut = () => {
    // Navigate to home after sign out
    navigateToPage('home');
  };

  // Initialize global auth subscription to prevent lock errors
  useEffect(() => {
    let subscription: any = null;
    
    const init = async () => {
      // Initialize with a callback to handle auth state changes
      subscription = await initializeAuthSubscription((user, event) => {
        // Wrap state updates in startTransition to avoid suspense errors
        startTransition(() => {
          // Only handle logout events here since individual components manage their own login state
          if (event === 'SIGNED_OUT') {
            setAdminInfo(null);
            setPhotographerInfo(null);
          }
        });
      });
    };
    
    init();
    
    return () => {
      if (subscription) {
        cleanupAuthSubscription(subscription);
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <CartProvider>
          <SEO {...defaultSEO} />
          <ScrollToTop />
          <Navigation
            onGoHome={() => navigateToPage('home')}
            onStockPhotosClick={() => navigateToPage('stock-photos')}
            onAdminClick={() => navigateToPage('admin')}
            onTrackingClick={() => navigateToPage('tracking')}
            onRefundPolicyClick={() => navigateToPage('refund-policy')}
            onShippingPolicyClick={() => navigateToPage('shipping-policy')}
            onPrivacyPolicyClick={() => navigateToPage('privacy-policy')}
            onProductsClick={() => navigateToPage('products')}
            onFAQClick={() => navigateToPage('faq')}
            onAboutClick={() => navigateToPage('complete-guide')}
            onSizeGuideClick={() => navigateToPage('size-guide')}
            onHDMetalPrintGuideClick={() => navigateToPage('hd-metal-print-guide')}
            onCareInstructionsClick={() => navigateToPage('care-instructions')}
            onReviewsClick={() => navigateToPage('reviews')}
            onCartCheckoutClick={() => navigateToPage('cart-checkout')}
          />
          <main className="min-h-screen">
            {currentPage === 'home' && (
              <>
                <HeroSection />
                <ReviewsCarousel />
                <ConfiguratorSection 
                  onNavigateToStockPhotos={() => navigateToPage('stock-photos')} 
                  stockImageUrl={selectedStockPhoto}
                  onStockImageProcessed={handleStockPhotoProcessed}
                />
                <FeaturesSection />
                <StockPhotosPreview onViewAll={() => navigateToPage('stock-photos')} />
              </>
            )}
            {currentPage === 'stock-photos' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <StockPhotosPage 
                  onClose={() => navigateToPage('home')}
                  onSelectImage={handleStockPhotoSelect}
                />
              </Suspense>
            )}
            {currentPage === 'account' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <AccountPage 
                  onClose={() => navigateToPage('home')}
                  onSignOut={handleAccountSignOut}
                  onReorder={handleReorder}
                />
              </Suspense>
            )}
            {currentPage === 'admin' && (
              <Suspense fallback={<LoadingSkeleton />}>
                {adminInfo ? (
                  <AdminDashboard onLogout={handleAdminLogout} adminInfo={adminInfo} />
                ) : (
                  <AdminLogin onLogin={setAdminInfo} onBack={() => navigateToPage('home')} />
                )}
              </Suspense>
            )}
            {currentPage === 'admin/bootstrap' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <AdminBootstrap 
                  onBack={() => navigateToPage('admin')} 
                  onSuccess={() => navigateToPage('admin')} 
                />
              </Suspense>
            )}
            {currentPage === 'photographer' && (
              <Suspense fallback={<LoadingSkeleton />}>
                {photographerInfo ? (
                  // Show dashboard if logged in
                  <PhotographerDashboard 
                    photographerEmail={photographerInfo.email} 
                    onLogout={async () => {
                      // Sign out from Supabase
                      await safeSignOut();
                      // Clear local state
                      startTransition(() => {
                        setPhotographerInfo(null);
                        setPhotographerView('hub');
                      });
                    }}
                    onUploadClick={() => {}} 
                  />
                ) : photographerView === 'hub' ? (
                  // Show marketplace hub (landing page)
                  <PhotographerMarketplaceHub 
                    onClose={() => navigateToPage('home')}
                    onSignupClick={() => {
                      startTransition(() => {
                        setPhotographerView('signup');
                      });
                    }}
                    onLoginClick={() => {
                      startTransition(() => {
                        setPhotographerView('login');
                      });
                    }}
                  />
                ) : photographerView === 'signup' ? (
                  // Show signup form
                  <PhotographerSignupPage 
                    onClose={() => {
                      startTransition(() => {
                        setPhotographerView('hub');
                      });
                      navigateToPage('home');
                    }}
                    onSuccess={(email) => {
                      startTransition(() => {
                        setPhotographerInfo({ email });
                        setPhotographerView('dashboard');
                      });
                    }}
                  />
                ) : (
                  // Show login form
                  <PhotographerLoginPage 
                    onClose={() => {
                      startTransition(() => {
                        setPhotographerView('hub');
                      });
                      navigateToPage('home');
                    }}
                    onSuccess={(email) => {
                      startTransition(() => {
                        setPhotographerInfo({ email });
                        setPhotographerView('dashboard');
                      });
                    }}
                    onSignupClick={() => {
                      startTransition(() => {
                        setPhotographerView('signup');
                      });
                    }}
                  />
                )}
              </Suspense>
            )}
            {currentPage === 'marketplace' && (
              <Suspense fallback={<LoadingSkeleton />}>
                {/* Marketplace photos are now integrated into stock photos collections */}
                <StockPhotosPage 
                  onClose={() => navigateToPage('home')}
                  onSelectImage={handleStockPhotoSelect}
                />
              </Suspense>
            )}
            {currentPage === 'cart-checkout' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <CartCheckoutPage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'terms-conditions' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <TermsConditions onBack={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'refund-policy' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <RefundPolicy onBack={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'shipping-policy' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <ShippingPolicy onBack={() => navigateToPage('home')} onTrackingClick={() => navigateToPage('tracking')} />
              </Suspense>
            )}
            {currentPage === 'privacy-policy' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <PrivacyPolicy onBack={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'metal-prints-explained' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <MetalPrintsExplained onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'metal-prints-vs-canvas' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <MetalPrintsVsCanvas onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'metal-prints-vs-acrylic' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <MetalPrintsVsAcrylic onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'metal-prints-vs-paper' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <MetalPrintsVsPaper onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'products' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <ProductsPage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'faq' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <FAQPage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'about' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <AboutPage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'size-guide' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <SizeGuidePage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'hd-metal-print-guide' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <HDMetalPrintGuidePage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'care-instructions' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <CareInstructionsPage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'reviews' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <ReviewsPage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'tracking' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <TrackingPage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
            {currentPage === 'complete-guide' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <CompleteGuidePage onClose={() => navigateToPage('home')} />
              </Suspense>
            )}
          </main>
          <Footer 
            onAdminClick={() => navigateToPage('admin')}
            onMarketplaceClick={() => navigateToPage('marketplace')}
            onPhotographerClick={() => navigateToPage('photographer')}
            onTermsClick={() => navigateToPage('terms-conditions')}
            onRefundPolicyClick={() => navigateToPage('refund-policy')}
            onShippingPolicyClick={() => navigateToPage('shipping-policy')}
            onPrivacyPolicyClick={() => navigateToPage('privacy-policy')}
            onMetalPrintsExplainedClick={() => navigateToPage('metal-prints-explained')}
            onMetalPrintsVsCanvasClick={() => navigateToPage('metal-prints-vs-canvas')}
          />
        </CartProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}