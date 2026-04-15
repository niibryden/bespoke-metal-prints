import { getSupabaseClient } from '../utils/supabase/client';
import { safeGetSession, safeSignOut } from '../utils/supabase/auth-manager';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, User, Menu, X, LogOut, Settings, ShoppingCart, ChevronDown, BookOpen, Ruler, HelpCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LoginPage } from './LoginPage';
import { AccountPage } from './AccountPage';
import { AccessibilitySettings } from './AccessibilitySettings';
import { CartModal } from './CartModal';
import { DarkModeToggleSwap } from './DarkModeToggle';
import { useCart } from '../contexts/CartContext';
import logo from 'figma:asset/b87a44ea706a718f76149582796ccaf613512b6f.png';

interface NavigationProps {
  onStockPhotosClick?: () => void;
  onGoHome?: () => void;
  onAdminClick?: () => void;
  onTrackingClick?: () => void;
  onRefundPolicyClick?: () => void;
  onShippingPolicyClick?: () => void;
  onPrivacyPolicyClick?: () => void;
  onReorder?: (orderDetails: any) => void;
  onProductsClick?: () => void;
  onFAQClick?: () => void;
  onAboutClick?: () => void;
  onSizeGuideClick?: () => void;
  onHDMetalPrintGuideClick?: () => void;
  onCareInstructionsClick?: () => void;
  onReviewsClick?: () => void;
}

export function Navigation({ 
  onStockPhotosClick, 
  onGoHome, 
  onAdminClick, 
  onTrackingClick,
  onRefundPolicyClick,
  onShippingPolicyClick,
  onPrivacyPolicyClick,
  onReorder,
  onProductsClick,
  onFAQClick,
  onAboutClick,
  onSizeGuideClick,
  onHDMetalPrintGuideClick,
  onCareInstructionsClick,
  onReviewsClick,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false); // Prevent concurrent signOut calls
  const { theme, toggleTheme } = useTheme();
  const { getItemCount } = useCart();
  
  const supabase = useMemo(() => getSupabaseClient(), []);

  // Inactivity timer (30 minutes = 1800000 ms)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Set new timer
      inactivityTimer = setTimeout(async () => {
        if (isSigningOut) return; // Prevent concurrent signOut
        console.log('User inactive for 30 minutes, signing out...');
        setIsSigningOut(true);
        try {
          await safeSignOut();
          setUser(null);
          setShowAccount(false);
          alert('You have been signed out due to inactivity.');
        } catch (error) {
          console.error('Error during inactivity signout:', error);
        } finally {
          setIsSigningOut(false);
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Activity event handlers
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [user, supabase, isSigningOut]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check for existing session once on mount
    const checkSession = async () => {
      const { data: { session } } = await safeGetSession();
      if (session) {
        setUser(session.user);
      }
    };

    checkSession();
    
    // Note: Auth subscription is handled globally in App.tsx
    // Individual components should not create their own subscriptions
    // This prevents auth lock errors from multiple concurrent subscriptions
  }, [supabase]);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent concurrent signOut calls
    setIsSigningOut(true);
    await safeSignOut();
    setUser(null);
    setIsMobileMenuOpen(false);
    setShowAccount(false); // Close account modal on sign out
    setIsSigningOut(false);
  };

  const handleReorder = (order: any) => {
    console.log('🔄 TEST MODE: Reorder initiated');
    console.log('Order data:', order);
    
    // Close account page
    setShowAccount(false);
    
    // Call parent's reorder handler if provided
    if (onReorder) {
      console.log('✅ Calling parent reorder handler with:', {
        image: order.image || order.imageUrl,
        size: order.items?.size,
        finish: order.items?.finish,
        mountType: order.items?.mountType,
        frame: order.items?.frame,
      });
      onReorder(order);
    }
    
    // Go back to home if on stock photos page
    if (onGoHome) {
      onGoHome();
    }
    
    // Scroll to configurator after a brief delay
    setTimeout(() => {
      const element = document.getElementById('configurator');
      if (element) {
        console.log('📍 Scrolling to configurator');
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('⚠️ Configurator element not found');
      }
    }, 300);
  };

  const scrollToSection = (sectionId: string) => {
    // Special handling for stock photos
    if (sectionId === 'stock-photos' && onStockPhotosClick) {
      onStockPhotosClick();
      setIsMobileMenuOpen(false);
      return;
    }
    
    // Special handling for tracking
    if (sectionId === 'tracking' && onTrackingClick) {
      onTrackingClick();
      setIsMobileMenuOpen(false);
      return;
    }
    
    // Special handling for products
    if (sectionId === 'products' && onProductsClick) {
      onProductsClick();
      setIsMobileMenuOpen(false);
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: 'Home', id: 'hero' },
    { name: 'Products', id: 'products' },
    { name: 'Stock Photos', id: 'stock-photos' },
    { name: 'Track Order', id: 'tracking' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-[#ff6b35]/10 dark:bg-black/95' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Bespoke Metal Prints" 
            className="h-14 sm:h-18 md:h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
            loading="eager"
            fetchpriority="high"
            onClick={() => {
              setIsMobileMenuOpen(false); // Close mobile menu if open
              if (onGoHome) {
                onGoHome();
              } else {
                scrollToSection('hero');
              }
            }}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-black hover:text-[#ff6b35] transition-colors dark:text-white"
            >
              {item.name}
            </button>
          ))}
          
          {/* Learn Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setShowLearnDropdown(true)}
            onMouseLeave={() => setShowLearnDropdown(false)}
          >
            <button
              className="text-black hover:text-[#ff6b35] transition-colors flex items-center gap-1 dark:text-white"
            >
              Learn
              <ChevronDown className={`w-4 h-4 transition-transform ${showLearnDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showLearnDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-3 z-50"
                >
                  {/* Complete Guide */}
                  <div className="px-3 mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Educational Resources</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowLearnDropdown(false);
                      if (onAboutClick) onAboutClick();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#ff6b35] transition-colors flex items-center gap-3"
                  >
                    <BookOpen className="w-5 h-5 text-[#ff6b35]" />
                    <div>
                      <div className="font-medium">Complete Guide</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">What is HD Metal Print, Care & More</div>
                    </div>
                  </button>
                  
                  {/* Size Guide */}
                  <button
                    onClick={() => {
                      setShowLearnDropdown(false);
                      if (onSizeGuideClick) onSizeGuideClick();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#ff6b35] transition-colors flex items-center gap-3"
                  >
                    <Ruler className="w-5 h-5 text-[#ff6b35]" />
                    <div>
                      <div className="font-medium">Size Guide</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Find your perfect dimensions</div>
                    </div>
                  </button>
                  
                  {/* FAQ */}
                  <button
                    onClick={() => {
                      setShowLearnDropdown(false);
                      if (onFAQClick) onFAQClick();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#ff6b35] transition-colors flex items-center gap-3"
                  >
                    <HelpCircle className="w-5 h-5 text-[#ff6b35]" />
                    <div>
                      <div className="font-medium">FAQ</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Common questions answered</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {user ? (
            <button
              onClick={() => setShowAccount(true)}
              className="text-black hover:text-[#ff6b35] transition-colors flex items-center gap-2 dark:text-white"
            >
              <User className="w-4 h-4" />
              Account
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="text-black hover:text-[#ff6b35] transition-colors flex items-center gap-2 dark:text-white"
            >
              <User className="w-4 h-4" />
              Login
            </button>
          )}
          <DarkModeToggleSwap />
          <button
            onClick={() => setShowAccessibility(true)}
            className="text-black hover:text-[#ff6b35] transition-colors p-2 rounded-full bg-white shadow-md dark:bg-black/20 dark:text-white dark:shadow-none"
            aria-label="Accessibility settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollToSection('configurator')}
            className="px-6 py-2 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all hover:scale-105 dark:text-black"
          >
            Start Your Print
          </button>
          <button
            onClick={() => setShowCart(true)}
            className="relative text-black hover:text-[#ff6b35] transition-colors p-2 rounded-full bg-white shadow-md dark:bg-black/20 dark:text-white dark:shadow-none"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {getItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff6b35] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {getItemCount()}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <DarkModeToggleSwap />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-black hover:text-[#ff6b35] transition-colors p-2 dark:text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white/98 backdrop-blur-md border-t border-[#ff6b35]/20 dark:bg-black/98"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-black hover:text-[#ff6b35] transition-colors text-left py-2 border-b border-[#ff6b35]/10 dark:text-white"
                  whileTap={{ scale: 0.98 }}
                >
                  {item.name}
                </motion.button>
              ))}
              {user ? (
                <motion.button
                  onClick={() => setShowAccount(true)}
                  className="text-black hover:text-[#ff6b35] transition-colors flex items-center gap-2 py-2 border-b border-[#ff6b35]/10 dark:text-white"
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-4 h-4" />
                  Account
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowLogin(true)}
                  className="text-black hover:text-[#ff6b35] transition-colors flex items-center gap-2 py-2 border-b border-[#ff6b35]/10 dark:text-white"
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-4 h-4" />
                  Login
                </motion.button>
              )}
              <motion.button
                onClick={() => {
                  setShowAccessibility(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-black hover:text-[#ff6b35] transition-colors flex items-center gap-2 py-2 border-b border-[#ff6b35]/10 dark:text-white"
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-4 h-4" />
                Accessibility
              </motion.button>
              <motion.button
                onClick={() => {
                  scrollToSection('configurator');
                  setIsMobileMenuOpen(false);
                }}
                className="px-6 py-3 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all text-center mt-2 dark:text-black"
                whileTap={{ scale: 0.98 }}
              >
                Start Your Print
              </motion.button>
              <motion.button
                onClick={() => setShowCart(true)}
                className="relative text-black hover:text-[#ff6b35] transition-colors flex items-center gap-2 py-2 border-b border-[#ff6b35]/10 dark:text-white"
                aria-label="Cart"
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {getItemCount() > 0 && (
                  <span className="ml-auto bg-[#ff6b35] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                    {getItemCount()}
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {showLogin && <LoginPage key="login-modal" onClose={() => setShowLogin(false)} />}
        {showAccount && <AccountPage key="account-modal" onClose={() => setShowAccount(false)} onSignOut={handleSignOut} onReorder={handleReorder} />}
      </AnimatePresence>
      
      {/* Accessibility Settings Modal */}
      <AnimatePresence>
        {showAccessibility && <AccessibilitySettings onClose={() => setShowAccessibility(false)} />}
      </AnimatePresence>
      
      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <CartModal 
            onClose={() => setShowCart(false)}
            onCheckout={() => {
              setShowCart(false);
              setIsMobileMenuOpen(false);
              // Scroll to configurator for checkout
              setTimeout(() => {
                const element = document.getElementById('configurator');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
}