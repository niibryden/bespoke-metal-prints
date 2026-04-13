import { lazy, Suspense, useEffect, useState, startTransition } from 'react';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { CartProvider } from './contexts/CartContext';
import { DarkModeAudit } from './components/DarkModeAudit';
import { SEO, SEOConfig } from './components/SEO';
import { StockPhotosPreview } from './components/StockPhotosPreview';
import { FloatingCartButton } from './components/FloatingCartButton';
import { CartModal } from './components/CartModal';
import { SignupPopup } from './components/SignupPopup';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ReviewsCarousel } from './components/ReviewsCarousel';
import { FeaturesSection } from './components/FeaturesSection';
import { ConfiguratorSection } from './components/ConfiguratorSection';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { applyAccessibilitySettings } from './utils/apply-accessibility';
import { initPerformanceMonitoring } from './utils/performance';
import './utils/optimization-tools';
import { Toaster } from 'sonner@2.0.3';

// Suppress harmless Supabase auth lock warnings in development
// This warning occurs due to React Strict Mode causing double renders
// The lock is automatically recovered and doesn't affect functionality
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('Lock "lock:sb-') && message.includes('was not released within')) {
      // Silently ignore Supabase lock timeout warnings - they auto-recover
      return;
    }
    originalWarn.apply(console, args);
  };
}

// Lazy load heavy components and animations
const StockPhotosPage = lazy(() => import('./components/StockPhotosPage').then(m => ({ default: m.StockPhotosPage })));
const CollectionPage = lazy(() => import('./components/CollectionPage').then(m => ({ default: m.CollectionPage })));
const CollectionDetailView = lazy(() => import('./components/CollectionDetailView').then(m => ({ default: m.CollectionDetailView })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminBootstrap = lazy(() => import('./components/AdminBootstrap').then(m => ({ default: m.AdminBootstrap })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TrackingPage = lazy(() => import('./components/TrackingPage').then(m => ({ default: m.TrackingPage })));
const RefundPolicyPage = lazy(() => import('./components/RefundPolicyPage').then(m => ({ default: m.RefundPolicyPage })));
const ShippingPolicyPage = lazy(() => import('./components/ShippingPolicyPage').then(m => ({ default: m.ShippingPolicyPage })));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsConditionsPage = lazy(() => import('./components/TermsConditionsPage').then(m => ({ default: m.TermsConditionsPage })));
const CartCheckoutPage = lazy(() => import('./components/CartCheckoutPage').then(m => ({ default: m.CartCheckoutPage })));
const ProductsPage = lazy(() => import('./components/ProductsPage').then(m => ({ default: m.ProductsPage })));
const FAQPage = lazy(() => import('./components/FAQPage').then(m => ({ default: m.FAQPage })));
const AboutPage = lazy(() => import('./components/AboutPage').then(m => ({ default: m.AboutPage })));
const CompleteGuidePage = lazy(() => import('./components/CompleteGuidePage').then(m => ({ default: m.CompleteGuidePage })));
const SizeGuidePage = lazy(() => import('./components/SizeGuidePage').then(m => ({ default: m.SizeGuidePage })));
const HDMetalPrintGuidePage = lazy(() => import('./components/HDMetalPrintGuidePage').then(m => ({ default: m.HDMetalPrintGuidePage })));
const CareInstructionsPage = lazy(() => import('./components/CareInstructionsPage').then(m => ({ default: m.CareInstructionsPage })));
const ReviewsPage = lazy(() => import('./components/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const MetalPrintsExplainedPage = lazy(() => import('./components/MetalPrintsExplainedPage').then(m => ({ default: m.MetalPrintsExplainedPage })));
const MetalPrintsVsCanvasPage = lazy(() => import('./components/MetalPrintsVsCanvasPage').then(m => ({ default: m.MetalPrintsVsCanvasPage })));
const MetalPrintsVsAcrylicPage = lazy(() => import('./components/MetalPrintsVsAcrylicPage').then(m => ({ default: m.MetalPrintsVsAcrylicPage })));
const MetalPrintsVsPaperPage = lazy(() => import('./components/MetalPrintsVsPaperPage').then(m => ({ default: m.MetalPrintsVsPaperPage })));
const BestPrintTypeWallArtPage = lazy(() => import('./components/BestPrintTypeWallArtPage').then(m => ({ default: m.BestPrintTypeWallArtPage })));
const BestPhotoPrintMaterialGiftsPage = lazy(() => import('./components/BestPhotoPrintMaterialGiftsPage').then(m => ({ default: m.BestPhotoPrintMaterialGiftsPage })));
const BestWallArtOfficesPage = lazy(() => import('./components/BestWallArtOfficesPage').then(m => ({ default: m.BestWallArtOfficesPage })));
const BestWallArtBathroomsPage = lazy(() => import('./components/BestWallArtBathroomsPage').then(m => ({ default: m.BestWallArtBathroomsPage })));
const DiagnosticPage = lazy(() => import('./components/DiagnosticPage').then(m => ({ default: m.DiagnosticPage })));
const SupportSyncIntegrationPage = lazy(() => import('./components/SupportSyncIntegrationPage').then(m => ({ default: m.SupportSyncIntegrationPage })));
const PhotographerSignupPage = lazy(() => import('./components/PhotographerSignupPage').then(m => ({ default: m.PhotographerSignupPage })));
const PhotographerDashboard = lazy(() => import('./components/PhotographerDashboard').then(m => ({ default: m.PhotographerDashboard })));
const PhotographerLoginPage = lazy(() => import('./components/PhotographerLoginPage').then(m => ({ default: m.PhotographerLoginPage })));
const PhotographerMarketplaceHub = lazy(() => import('./components/PhotographerMarketplaceHub'));
const PhotoUploadModal = lazy(() => import('./components/PhotoUploadModal').then(m => ({ default: m.PhotoUploadModal })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0a0a0a]">
    <div className="w-12 h-12 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
  </div>
);

type PageView = 'home' | 'stock-photos' | 'collection' | 'collection-detail' | 'admin-login' | 'admin-bootstrap' | 'admin-dashboard' | 'tracking' | 'refund-policy' | 'shipping-policy' | 'privacy-policy' | 'terms-conditions' | 'cart-checkout' | 'products' | 'faq' | 'about' | 'size-guide' | 'hd-metal-print-guide' | 'care-instructions' | 'reviews' | 'metal-prints-explained' | 'metal-prints-vs-canvas' | 'metal-prints-vs-acrylic' | 'metal-prints-vs-paper' | 'best-print-type-wall-art' | 'best-photo-print-material-gifts' | 'best-wall-art-offices' | 'best-wall-art-bathrooms' | 'diagnostic' | 'support-sync-integration' | 'photographer-signup' | 'photographer-login' | 'photographer-dashboard' | 'photographer-marketplace';

export default function App() {
  // Clean up any oversized cart data on app startup
  useEffect(() => {
    try {
      const cartData = localStorage.getItem('bespoke-cart');
      if (cartData) {
        const sizeKB = (cartData.length / 1024).toFixed(2);
        console.log(`🧹 Checking cart data on startup: ${sizeKB} KB`);
        
        // If cart data is larger than 1MB, it's probably corrupted with full images
        if (cartData.length > 1024 * 1024) {
          console.warn(`⚠️ Cart data is too large (${sizeKB} KB), clearing...`);
          localStorage.removeItem('bespoke-cart');
          console.log('✅ Oversized cart data cleared');
        }
      }
    } catch (e) {
      console.error('Failed to check cart data:', e);
    }
  }, []);
  
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [selectedCollection, setSelectedCollection] = useState<{ id: number; title: string; description: string } | null>(null);
  const [selectedCollectionName, setSelectedCollectionName] = useState<string>('');
  const [stockImageUrl, setStockImageUrl] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<{ email: string; role: string; name: string; permissions: any; accessToken: string } | null>(() => {
    // Restore admin session from localStorage
    const savedAdmin = localStorage.getItem('admin-session');
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        // Check if session is still valid (expires after 24 hours)
        const expiresAt = parsed.expiresAt;
        if (expiresAt && Date.now() < expiresAt) {
          // MIGRATION FIX: Ensure permissions is an object, not an array
          const adminInfo = parsed.adminInfo;
          
          // CRITICAL: Validate that accessToken exists and is a valid JWT format
          if (!adminInfo.accessToken || adminInfo.accessToken === 'undefined' || adminInfo.accessToken === '') {
            console.log('🔧 Invalid or missing access token, clearing session');
            localStorage.removeItem('admin-session');
            return null;
          }
          
          // CRITICAL: Validate JWT format (should start with "eyJ" and be long)
          if (!adminInfo.accessToken.startsWith('eyJ') || adminInfo.accessToken.length < 100) {
            console.log('🔧 Access token is not a valid JWT format, clearing session');
            console.log('🔧 Token preview:', adminInfo.accessToken.substring(0, 50));
            localStorage.removeItem('admin-session');
            alert('Your admin session is invalid. Please log in again.');
            return null;
          }
          
          // EXTRA VALIDATION: Try to decode the JWT to ensure it has required claims
          try {
            const parts = adminInfo.accessToken.split('.');
            if (parts.length !== 3) {
              console.log('🔧 JWT does not have 3 parts, clearing session');
              localStorage.removeItem('admin-session');
              alert('Your admin session is corrupted. Please log in again.');
              return null;
            }
            
            // Decode the payload (second part)
            const payload = JSON.parse(atob(parts[1]));
            
            // Check for required claims
            if (!payload.sub || !payload.email) {
              console.log('🔧 JWT missing required claims (sub or email), clearing session');
              console.log('🔧 Payload:', payload);
              localStorage.removeItem('admin-session');
              alert('Your admin session is missing required information. Please log in again.');
              return null;
            }
            
            console.log('✅ JWT validation passed:', { sub: payload.sub, email: payload.email });
          } catch (decodeError) {
            console.error('🔧 Failed to decode JWT, clearing session:', decodeError);
            localStorage.removeItem('admin-session');
            alert('Your admin session is corrupted. Please log in again.');
            return null;
          }
          
          if (Array.isArray(adminInfo.permissions) || !adminInfo.permissions) {
            console.log('🔧 Migrating old admin session with invalid permissions');
            adminInfo.permissions = {
              canViewOrders: true,
              canManageInventory: true,
              canExportData: true,
            };
            // Save the migrated session back
            localStorage.setItem('admin-session', JSON.stringify({ adminInfo, expiresAt }));
          }
          return adminInfo;
        } else {
          console.log('🔧 Session expired, clearing');
          localStorage.removeItem('admin-session');
        }
      } catch (e) {
        console.error('Failed to restore admin session:', e);
        localStorage.removeItem('admin-session');
      }
    }
    return null;
  });
  const [reorderConfig, setReorderConfig] = useState<any>(null);
  const [initialOrderId, setInitialOrderId] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photographerEmail, setPhotographerEmail] = useState<string | null>(null);
  
  // If admin session exists, show admin dashboard
  useEffect(() => {
    if (adminInfo && currentPage === 'home') {
      setCurrentPage('admin-dashboard');
    }
  }, [adminInfo]);
  
  // Check URL parameters on mount for tracking page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    const page = params.get('page');
    
    // CRITICAL FIX: Also check pathname for /pages/ routes
    const pathname = window.location.pathname;
    const pathPage = pathname.startsWith('/pages/') 
      ? pathname.replace('/pages/', '') 
      : null;
    
    if (orderId) {
      setInitialOrderId(orderId);
      setCurrentPage('tracking');
      console.log(`📦 Opening tracking page for order: ${orderId}`);
    } else if (pathPage === 'privacy-policy' || page === 'privacy-policy' || page === 'privacy') {
      setCurrentPage('privacy-policy');
      console.log('📄 Opening Privacy Policy page');
      // Update URL to clean format if coming from /pages/ path
      if (pathPage === 'privacy-policy' && !page) {
        window.history.replaceState({}, '', '?page=privacy-policy');
      }
    } else if (pathPage === 'terms-conditions' || page === 'terms-conditions' || page === 'terms') {
      setCurrentPage('terms-conditions');
      console.log('📄 Opening Terms & Conditions page');
      // Update URL to clean format if coming from /pages/ path
      if (pathPage === 'terms-conditions' && !page) {
        window.history.replaceState({}, '', '?page=terms-conditions');
      }
    } else if (pathPage === 'refund-policy' || page === 'refund-policy' || page === 'refund') {
      setCurrentPage('refund-policy');
      console.log('📄 Opening Refund & Cancellation Policy page');
      // Update URL to clean format if coming from /pages/ path
      if (pathPage === 'refund-policy' && !page) {
        window.history.replaceState({}, '', '?page=refund-policy');
      }
    } else if (pathPage === 'shipping-policy' || page === 'shipping-policy' || page === 'shipping') {
      setCurrentPage('shipping-policy');
      console.log('📄 Opening Shipping Policy page');
      // Update URL to clean format if coming from /pages/ path
      if (pathPage === 'shipping-policy' && !page) {
        window.history.replaceState({}, '', '?page=shipping-policy');
      }
    } else if (page === 'metal-prints-explained') {
      setCurrentPage('metal-prints-explained');
      console.log('📄 Opening Metal Prints Explained page');
    } else if (page === 'metal-prints-vs-canvas') {
      setCurrentPage('metal-prints-vs-canvas');
      console.log('📄 Opening Metal Prints vs Canvas page');
    } else if (page === 'admin-bootstrap') {
      setCurrentPage('admin-bootstrap');
      console.log('🚀 Opening Admin Bootstrap page');
    }
  }, []);
  
  // Apply accessibility settings on mount
  useEffect(() => {
    applyAccessibilitySettings();
  }, []);
  
  // Initialize performance monitoring
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  // Service worker registration - DISABLED in iframe/Figma environment
  // Service workers don't work properly in iframes and cause MIME type errors
  useEffect(() => {
    // Only register SW in production on real domains (not Figma)
    const isProduction = window.location.hostname !== 'localhost' 
      && !window.location.hostname.includes('figma');
    
    const isInIframe = window.self !== window.top;
    
    if ('serviceWorker' in navigator && isProduction && !isInIframe) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service worker registered:', registration.scope);
        })
        .catch((error) => {
          console.log('ℹ️ Service worker not available:', error.message);
        });
    } else {
      console.log('ℹ️ Service worker disabled (iframe/dev environment)');
    }
  }, []);
  
  const handleStockPhotosClick = () => {
    setCurrentPage('stock-photos');
  };

  const handleGoHome = () => {
    setCurrentPage('home');
    setSelectedCollection(null);
    setSelectedCollectionName('');
    
    // Scroll to top smoothly after a brief delay to ensure page has rendered
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSelectCollection = (collection: { id: number; title: string; description: string }) => {
    setSelectedCollectionName(collection.title);
    setCurrentPage('collection-detail');
  };

  const handleBackToStockPhotos = () => {
    setCurrentPage('stock-photos');
    setSelectedCollection(null);
    setSelectedCollectionName('');
  };

  const handleCreateOrder = (imageUrl: string) => {
    console.log('✅ App: Stock photo selected:', imageUrl.substring(0, 80));
    
    // Set the stock image URL in state
    setStockImageUrl(imageUrl);
    
    // Navigate to home page
    setCurrentPage('home');
    setSelectedCollection(null);
    
    // Aggressive multi-attempt scrolling to ensure configurator is visible
    const scrollToConfigurator = (attempt = 1, maxAttempts = 5) => {
      const element = document.getElementById('configurator');
      if (element) {
        console.log(`✅ App: Scrolling to configurator (attempt ${attempt})`);
        const yOffset = -80; // Offset to show section header nicely
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        
        // Verify scroll worked, retry if needed
        if (attempt < maxAttempts) {
          setTimeout(() => {
            const currentScroll = window.pageYOffset;
            const targetScroll = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            if (Math.abs(currentScroll - targetScroll) > 100) {
              console.log('⚠️ Scroll verification failed, retrying...');
              scrollToConfigurator(attempt + 1, maxAttempts);
            } else {
              console.log('✅ Configurator now in view!');
            }
          }, 300);
        }
      } else if (attempt < maxAttempts) {
        console.log(`⚠️ Configurator element not found, retrying in ${100 * attempt}ms...`);
        setTimeout(() => scrollToConfigurator(attempt + 1, maxAttempts), 100 * attempt);
      } else {
        console.error('❌ Failed to find configurator element after multiple attempts');
      }
    };
    
    // Start scrolling attempts
    setTimeout(() => scrollToConfigurator(), 100);
  };

  const handleAdminLogin = (adminInfo: { email: string; role: string; name: string; permissions: any; accessToken: string }) => {
    setAdminInfo(adminInfo);
    setCurrentPage('admin-dashboard');
    // Save admin session to localStorage with expiration
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
    localStorage.setItem('admin-session', JSON.stringify({ adminInfo, expiresAt }));
  };

  const handleAdminLogout = () => {
    setAdminInfo(null);
    setCurrentPage('home');
    // Remove admin session from localStorage
    localStorage.removeItem('admin-session');
  };

  const handleGoToAdminLogin = () => {
    setCurrentPage('admin-login');
  };

  const handleGoToTracking = () => {
    setCurrentPage('tracking');
  };

  const handleGoToRefundPolicy = () => {
    setCurrentPage('refund-policy');
  };

  const handleGoToShippingPolicy = () => {
    setCurrentPage('shipping-policy');
  };

  const handleGoToPrivacyPolicy = () => {
    window.history.pushState({}, '', '?page=privacy-policy');
    setCurrentPage('privacy-policy');
  };

  const handleGoToProducts = () => {
    setCurrentPage('products');
  };

  const handleStartDesigning = () => {
    // Close products page and navigate to home
    setCurrentPage('home');
    
    // Scroll to configurator with aggressive retry logic
    const scrollToConfigurator = (attempt = 1, maxAttempts = 5) => {
      const element = document.getElementById('configurator');
      if (element) {
        console.log(`✅ Scrolling to configurator from products page (attempt ${attempt})`);
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else if (attempt < maxAttempts) {
        console.log(`⚠️ Configurator element not found, retrying in ${100 * attempt}ms...`);
        setTimeout(() => scrollToConfigurator(attempt + 1, maxAttempts), 100 * attempt);
      }
    };
    
    setTimeout(() => scrollToConfigurator(), 100);
  };

  const handleReorder = (orderDetails: any) => {
    console.log('App: Reordering with details:', orderDetails);
    console.log('App: Order image:', orderDetails.image?.substring(0, 100) || orderDetails.imageUrl?.substring(0, 100) || 'NO IMAGE');
    
    // Navigate to home page
    setCurrentPage('home');
    
    const imageData = orderDetails.image || orderDetails.imageUrl;
    
    if (!imageData) {
      console.warn('⚠️ App: No image data available for reorder. User will need to upload a new image.');
      alert('This order does not have image data saved. You will need to upload a new image.');
    }
    
    const reorderData = {
      image: imageData,
      size: orderDetails.items?.size || orderDetails.size,
      finish: orderDetails.items?.finish || orderDetails.finish || 'Gloss',
      mountType: orderDetails.items?.mountType || orderDetails.mountType || 'Stick Tape',
      frame: orderDetails.items?.frame || orderDetails.frame || 'None',
      rushOrder: false,
    };
    
    console.log('App: Reorder config prepared:', {
      hasImage: !!reorderData.image,
      size: reorderData.size,
      finish: reorderData.finish,
      mountType: reorderData.mountType,
      frame: reorderData.frame,
    });
    
    // Set the reorder configuration
    setReorderConfig(reorderData);
    
    // Dispatch reorder event with image data after a delay to ensure configurator is mounted
    setTimeout(() => {
      console.log('App: Dispatching reorder event with data:', reorderData);
      window.dispatchEvent(new CustomEvent('reorder', { 
        detail: reorderData
      }));
      
      // Scroll to configurator after dispatching event
      setTimeout(() => {
        const element = document.getElementById('configurator');
        if (element) {
          console.log('App: Scrolling to configurator for reorder');
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.warn('App: Configurator element not found for reorder');
        }
      }, 200);
    }, 500);
  };

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <CartProvider>
          <div className="min-h-screen bg-background">
            {/* SEO Component - Updates based on current page */}
            <SEO 
              {...(currentPage === 'home' ? SEOConfig.home :
                  currentPage === 'stock-photos' ? SEOConfig.stockPhotos :
                  currentPage === 'products' ? SEOConfig.products :
                  currentPage === 'tracking' ? SEOConfig.tracking :
                  currentPage === 'refund-policy' ? SEOConfig.refund :
                  currentPage === 'shipping-policy' ? SEOConfig.shipping :
                  currentPage === 'privacy-policy' ? SEOConfig.privacy :
                  currentPage === 'terms-conditions' ? SEOConfig.terms :
                  currentPage === 'faq' ? SEOConfig.faq :
                  currentPage === 'about' ? SEOConfig.about :
                  currentPage === 'size-guide' ? SEOConfig.sizeGuide :
                  currentPage === 'hd-metal-print-guide' ? SEOConfig.hDMetalPrintGuide :
                  currentPage === 'care-instructions' ? SEOConfig.careInstructions :
                  currentPage === 'reviews' ? SEOConfig.reviews :
                  currentPage === 'metal-prints-explained' ? SEOConfig.metalPrintsExplained :
                  currentPage === 'metal-prints-vs-canvas' ? SEOConfig.metalPrintsVsCanvas :
                  currentPage === 'metal-prints-vs-acrylic' ? SEOConfig.metalPrintsVsAcrylic :
                  currentPage === 'metal-prints-vs-paper' ? SEOConfig.metalPrintsVsPaper :
                  currentPage === 'best-print-type-wall-art' ? SEOConfig.bestPrintTypeWallArt :
                  currentPage === 'best-photo-print-material-gifts' ? SEOConfig.bestPhotoPrintMaterialGifts :
                  currentPage === 'best-wall-art-offices' ? SEOConfig.bestWallArtOffices :
                  currentPage === 'best-wall-art-bathrooms' ? SEOConfig.bestWallArtBathrooms :
                  currentPage === 'collection-detail' ? {
                    ...SEOConfig.stockPhotos,
                    title: `${selectedCollectionName} Collection - Metal Prints | Bespoke Metal Prints`,
                    description: `Browse ${selectedCollectionName} collection - premium photos ready for metal printing. High-quality images perfect for custom metal art prints.`
                  } : SEOConfig.home)}
            />
            
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                {currentPage === 'admin-dashboard' && adminInfo ? (
                  <AdminDashboard key="admin-dashboard" onLogout={handleAdminLogout} adminInfo={adminInfo} />
                ) : currentPage === 'admin-bootstrap' ? (
                  <AdminBootstrap 
                    key="admin-bootstrap" 
                    onBack={handleGoHome} 
                    onSuccess={handleGoToAdminLogin}
                  />
                ) : currentPage === 'admin-login' ? (
                  <AdminLogin key="admin-login" onLogin={handleAdminLogin} onBack={handleGoHome} />
                ) : currentPage === 'collection-detail' && selectedCollectionName ? (
                  <CollectionDetailView
                    key="collection-detail-page"
                    collectionName={selectedCollectionName}
                    onClose={handleGoHome}
                    onBack={handleBackToStockPhotos}
                    onStartPrint={handleCreateOrder}
                  />
                ) : currentPage === 'stock-photos' ? (
                  <StockPhotosPage 
                    key="stock-photos-page"
                    onClose={handleGoHome}
                    onSelectImage={handleCreateOrder}
                    onSelectCollection={handleSelectCollection}
                  />
                ) : currentPage === 'tracking' ? (
                  <TrackingPage key="tracking-page" onClose={handleGoHome} initialOrderId={initialOrderId} />
                ) : currentPage === 'refund-policy' ? (
                  <RefundPolicyPage key="refund-policy-page" onBack={handleGoHome} />
                ) : currentPage === 'shipping-policy' ? (
                  <ShippingPolicyPage key="shipping-policy-page" onBack={handleGoHome} onTrackingClick={handleGoToTracking} />
                ) : currentPage === 'privacy-policy' ? (
                  <PrivacyPolicyPage key="privacy-policy-page" onBack={handleGoHome} />
                ) : currentPage === 'terms-conditions' ? (
                  <TermsConditionsPage key="terms-conditions-page" onBack={handleGoHome} />
                ) : currentPage === 'cart-checkout' ? (
                  <CartCheckoutPage key="cart-checkout-page" onClose={handleGoHome} />
                ) : currentPage === 'products' ? (
                  <ProductsPage key="products-page" onClose={handleGoHome} onStartDesigning={handleStartDesigning} />
                ) : currentPage === 'faq' ? (
                  <FAQPage key="faq-page" onClose={handleGoHome} />
                ) : currentPage === 'about' ? (
                  <CompleteGuidePage key="complete-guide-page" onClose={handleGoHome} />
                ) : currentPage === 'size-guide' ? (
                  <SizeGuidePage key="size-guide-page" onClose={handleGoHome} />
                ) : currentPage === 'hd-metal-print-guide' ? (
                  <HDMetalPrintGuidePage key="hd-metal-print-guide-page" onClose={handleGoHome} />
                ) : currentPage === 'care-instructions' ? (
                  <CareInstructionsPage key="care-instructions-page" onClose={handleGoHome} />
                ) : currentPage === 'reviews' ? (
                  <ReviewsPage key="reviews-page" onClose={handleGoHome} />
                ) : currentPage === 'metal-prints-explained' ? (
                  <MetalPrintsExplainedPage key="metal-prints-explained-page" onClose={handleGoHome} />
                ) : currentPage === 'metal-prints-vs-canvas' ? (
                  <MetalPrintsVsCanvasPage key="metal-prints-vs-canvas-page" onClose={handleGoHome} />
                ) : currentPage === 'metal-prints-vs-acrylic' ? (
                  <MetalPrintsVsAcrylicPage key="metal-prints-vs-acrylic-page" onClose={handleGoHome} />
                ) : currentPage === 'metal-prints-vs-paper' ? (
                  <MetalPrintsVsPaperPage key="metal-prints-vs-paper-page" onClose={handleGoHome} />
                ) : currentPage === 'best-print-type-wall-art' ? (
                  <BestPrintTypeWallArtPage key="best-print-type-wall-art-page" onClose={handleGoHome} />
                ) : currentPage === 'best-photo-print-material-gifts' ? (
                  <BestPhotoPrintMaterialGiftsPage key="best-photo-print-material-gifts-page" onClose={handleGoHome} />
                ) : currentPage === 'best-wall-art-offices' ? (
                  <BestWallArtOfficesPage key="best-wall-art-offices-page" onClose={handleGoHome} />
                ) : currentPage === 'best-wall-art-bathrooms' ? (
                  <BestWallArtBathroomsPage key="best-wall-art-bathrooms-page" onClose={handleGoHome} />
                ) : currentPage === 'diagnostic' ? (
                  <DiagnosticPage key="diagnostic-page" onClose={handleGoHome} />
                ) : currentPage === 'support-sync-integration' ? (
                  <SupportSyncIntegrationPage key="support-sync-integration-page" onClose={handleGoHome} />
                ) : currentPage === 'photographer-marketplace' ? (
                  <PhotographerMarketplaceHub 
                    key="photographer-marketplace" 
                    onClose={handleGoHome}
                    onSignupClick={() => setCurrentPage('photographer-signup')}
                    onLoginClick={() => setCurrentPage('photographer-login')}
                  />
                ) : currentPage === 'photographer-signup' ? (
                  <PhotographerSignupPage 
                    key="photographer-signup" 
                    onClose={handleGoHome}
                    onSuccess={(email: string) => {
                      setPhotographerEmail(email);
                      setCurrentPage('photographer-dashboard');
                    }}
                  />
                ) : currentPage === 'photographer-login' ? (
                  <PhotographerLoginPage 
                    key="photographer-login" 
                    onClose={handleGoHome}
                    onSuccess={(email: string) => {
                      setPhotographerEmail(email);
                      setCurrentPage('photographer-dashboard');
                    }}
                    onSignupClick={() => setCurrentPage('photographer-signup')}
                  />
                ) : currentPage === 'photographer-dashboard' ? (
                  <PhotographerDashboard 
                    key="photographer-dashboard" 
                    photographerEmail={photographerEmail || ''}
                    onLogout={() => {
                      setPhotographerEmail(null);
                      startTransition(() => {
                        setCurrentPage('home');
                      });
                    }}
                    onUploadClick={() => {
                      startTransition(() => {
                        setShowPhotoUpload(true);
                      });
                    }}
                  />
                ) : (
                  <>
                    <Navigation 
                      onStockPhotosClick={handleStockPhotosClick} 
                      onGoHome={handleGoHome}
                      onAdminClick={handleGoToAdminLogin}
                      onTrackingClick={handleGoToTracking}
                      onRefundPolicyClick={handleGoToRefundPolicy}
                      onShippingPolicyClick={handleGoToShippingPolicy}
                      onPrivacyPolicyClick={handleGoToPrivacyPolicy}
                      onReorder={handleReorder}
                      onProductsClick={handleGoToProducts}
                      onFAQClick={() => setCurrentPage('faq')}
                      onAboutClick={() => setCurrentPage('about')}
                      onSizeGuideClick={() => setCurrentPage('size-guide')}
                      onHDMetalPrintGuideClick={() => setCurrentPage('hd-metal-print-guide')}
                      onCareInstructionsClick={() => setCurrentPage('care-instructions')}
                      onReviewsClick={() => setCurrentPage('reviews')}
                    />
                    <HeroSection />
                    <ReviewsCarousel />
                    <FeaturesSection />
                    <StockPhotosPreview onViewAll={() => setCurrentPage('stock-photos')} />
                    <ConfiguratorSection 
                      initialConfig={reorderConfig || undefined} 
                      initialStep={reorderConfig ? 3 : undefined}
                      stockImageUrl={stockImageUrl}
                      onStockImageProcessed={() => setStockImageUrl(null)}
                    />
                    <Footer 
                      onAdminClick={handleGoToAdminLogin}
                      onMarketplaceClick={() => setCurrentPage('photographer-marketplace')}
                    />
                  </>
                )}
              </AnimatePresence>
            </Suspense>
            <ScrollToTop />
            <FloatingCartButton onClick={() => setShowCart(true)} />
            <AnimatePresence>
              {showCart && (
                <CartModal
                  onClose={() => setShowCart(false)}
                  onCheckout={() => {
                    setShowCart(false);
                    setCurrentPage('cart-checkout');
                  }}
                />
              )}
            </AnimatePresence>
            
            {/* Photographer Photo Upload Modal */}
            <AnimatePresence>
              {showPhotoUpload && (
                <Suspense fallback={null}>
                  <PhotoUploadModal
                    onClose={() => setShowPhotoUpload(false)}
                    onSuccess={() => {
                      setShowPhotoUpload(false);
                      // Reload dashboard to show the new photo
                      window.location.reload();
                    }}
                  />
                </Suspense>
              )}
            </AnimatePresence>

            <SignupPopup />
            <DarkModeAudit />
            <Toaster />
          </div>
        </CartProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}