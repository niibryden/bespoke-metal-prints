import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Package, MapPin, CheckCircle, ArrowLeft, Loader2, Trash2, LogIn, UserPlus } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';
import { OrderConfirmation } from './OrderConfirmation';
import { StripePaymentForm } from './StripePaymentForm';
import { TrustBadges } from './TrustBadges';
import { getShippingDimensions } from '../utils/shipping-dimensions';
import { useCart } from '../contexts/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AuthModal } from './AuthModal';

interface ShippingRate {
  id: string;
  service: string;
  carrier: string;
  rate: string;
  delivery_days: number;
  delivery_date: string;
}

interface CartCheckoutPageProps {
  onClose: () => void;
}

export function CartCheckoutPage({ onClose }: CartCheckoutPageProps) {
  const { items, removeItem, getTotalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'auth' | 'shipping' | 'payment' | 'confirmation'>('auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const supabase = useMemo(() => getSupabaseClient(), []);
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  
  // Shipping form
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  
  // Billing address
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  
  const [useSameAddress, setUseSameAddress] = useState(true);
  
  // Load saved addresses from backend
  const loadSavedAddresses = async (userId: string, accessToken: string) => {
    try {
      // Feature disabled - customer endpoint not yet implemented
      // This will be enabled when we add saved address functionality
      console.log('📍 Saved addresses feature not yet implemented');
      return;
      
      if (!accessToken) {
        console.error('❌ No access token provided to loadSavedAddresses');
        return;
      }
      
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
      console.log('📡 Fetching customer data from:', `${serverUrl}/customer/${userId}`);
      
      const response = await fetch(`${serverUrl}/customer/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log('📡 Customer data response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Customer data loaded:', { 
          addressCount: data.addresses?.length || 0,
          paymentMethodCount: data.paymentMethods?.length || 0 
        });
        
        const addresses = data.addresses || [];
        
        // Find default address or use the first one
        const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
        
        if (defaultAddress) {
          console.log('✅ Loading saved default address:', defaultAddress);
          setShippingAddress(prev => ({
            ...prev,
            name: defaultAddress.name || prev.name,
            street1: defaultAddress.street1 || '',
            street2: defaultAddress.street2 || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            zip: defaultAddress.zip || '',
            country: defaultAddress.country || 'US',
          }));
          
          // Also set billing address if same address is checked
          if (useSameAddress) {
            setBillingAddress({
              name: defaultAddress.name || '',
              street1: defaultAddress.street1 || '',
              street2: defaultAddress.street2 || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              zip: defaultAddress.zip || '',
              country: defaultAddress.country || 'US',
            });
          }
        } else {
          console.log('ℹ️ No saved addresses found for this customer');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load customer data:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error loading saved addresses:', error);
      // Don't show error to user, just fail silently
    }
  };
  
  // Get user session and auto-fill email
  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('✅ User logged in, loading saved data for:', session.user.email);
        console.log('Session access_token exists:', !!session.access_token);
        setIsLoggedIn(true);
        setShippingAddress(prev => ({
          ...prev,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || prev.name,
        }));
        
        // Load saved addresses
        console.log('📍 Loading saved addresses for returning customer...');
        await loadSavedAddresses(session.user.id, session.access_token);
        
        // Auto-skip auth step if logged in
        if (step === 'auth') {
          console.log('🔄 User already logged in, skipping to shipping');
          setStep('shipping');
        }
      }
    };
    getUserSession();
  }, [supabase]);
  
  // Sync billing address with shipping address when useSameAddress is true
  useEffect(() => {
    if (useSameAddress && shippingAddress.name) {
      setBillingAddress({
        name: shippingAddress.name,
        street1: shippingAddress.street1,
        street2: shippingAddress.street2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
      });
    }
  }, [useSameAddress, shippingAddress]);
  
  // Save address after successful order
  const saveAddress = async (userId: string, accessToken: string) => {
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
      
      console.log('📍 Saving address for future use...');
      
      // Save shipping address as default
      const addressToSave = {
        name: shippingAddress.name,
        email: shippingAddress.email,
        street1: shippingAddress.street1,
        street2: shippingAddress.street2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
        isDefault: true, // Mark as default
      };
      
      const saveResponse = await fetch(`${serverUrl}/customer/${userId}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(addressToSave),
      });
      
      if (!saveResponse.ok) {
        console.error('❌ Failed to save address:', await saveResponse.text());
        return;
      }
      
      console.log('✅ Address saved successfully! Will auto-populate on next checkout.');
    } catch (error) {
      console.error('❌ Error saving address:', error);
      // Don't block checkout if address save fails
    }
  };
  

  // Shipping rates
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  
  // Order
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;

  // Validate discount codes
  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    if (!shippingAddress.email) {
      setDiscountError('Please enter your email address first');
      return;
    }

    setApplyingDiscount(true);
    setDiscountError(null);

    try {
      const upperCode = discountCode.trim().toUpperCase();
      
      // Call server to validate discount code
      const response = await fetch(`${serverUrl}/checkout/validate-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ code: upperCode }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedDiscount({ 
          code: upperCode, 
          type: data.discount.type, 
          value: data.discount.value
        });
        setDiscountError(null);
      } else {
        setDiscountError(data.error || 'Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (error) {
      console.error('Error validating discount:', error);
      setDiscountError('Failed to validate discount code');
      setAppliedDiscount(null);
    }

    setApplyingDiscount(false);
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError(null);
  };

  // Calculate base total from cart
  const basePrice = getTotalPrice();

  // Calculate discounted subtotal
  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    
    if (appliedDiscount.type === 'percentage') {
      return (basePrice * appliedDiscount.value) / 100;
    } else {
      return appliedDiscount.value;
    }
  };

  const discountAmount = calculateDiscountAmount();
  const subtotalAfterDiscount = basePrice - discountAmount;

  // Calculate total with discount
  const shippingCost = selectedRate ? parseFloat(selectedRate.rate) : 0;
  const total = subtotalAfterDiscount + shippingCost;

  // Fetch shipping rates from backend - use largest item for dimensions
  const fetchShippingRates = async () => {
    if (!shippingAddress.street1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      setError('Please fill in all shipping address fields');
      return;
    }

    setLoadingRates(true);
    setError(null);

    try {
      console.log('=== CART CHECKOUT: SHIPPING CALCULATION START ===');
      console.log('Fetching shipping rates for', items.length, 'items');
      
      // Use largest item size for shipping dimensions
      // Sort sizes by area to find the largest
      const sizePriority: Record<string, number> = {
        '5" × 7"': 35,
        '12" × 8"': 96,
        '17" × 11"': 187,
        '24" × 16"': 384,
        '30" × 20"': 600,
        '36" × 24"': 864,
        '40" × 30"': 1200,
      };
      
      const largestSize = items.reduce((largest, item) => {
        const currentPriority = sizePriority[item.size] || 0;
        const largestPriority = sizePriority[largest] || 0;
        return currentPriority > largestPriority ? item.size : largest;
      }, items[0]?.size || '12" × 8"');
      
      console.log('📦 Using largest item size for shipping:', largestSize);
      
      // Normalize size format for server: convert "5" × 7"" to "5\" x 7\""
      // Replace Unicode × with lowercase x
      const normalizedSize = largestSize.replace(/×/g, 'x').replace(/"/g, '\\"');
      console.log('📦 Normalized size for server:', normalizedSize);
      
      // Get shipping dimensions based on largest product size
      const shippingDimensions = getShippingDimensions(largestSize);
      console.log('📦 Shipping dimensions:', shippingDimensions);
      
      const response = await fetch(`${serverUrl}/checkout/shipping-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            name: shippingAddress.name,
            street1: shippingAddress.street1,
            street2: shippingAddress.street2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zip,
            country: shippingAddress.country,
          },
          size: normalizedSize,
        }),
      });

      console.log('Shipping response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Shipping error response:', errorData);
        throw new Error(errorData.error || `Failed to calculate shipping (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('Shipping rates received:', data);
      setShippingRates(data.rates);
      setShipmentId(data.shipmentId);
      if (data.rates.length > 0) {
        setSelectedRate(data.rates[0]); // Select first rate by default (Priority)
      }
    } catch (err: any) {
      console.error('Error fetching shipping rates:', err);
      setError(err.message || 'Failed to fetch shipping rates. Please check the browser console for details.');
    } finally {
      setLoadingRates(false);
    }
  };

  // Initialize payment intent when moving to payment step
  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Starting cart checkout payment initialization...');
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('👤 User session:', session ? 'Found' : 'Not found');
      
      // Create payment intent
      const paymentRequestBody = {
        amount: total,
        currency: 'usd',
        metadata: {
          customerEmail: shippingAddress.email,
          itemCount: items.length,
        },
        userId: session?.user?.id,
        customerEmail: shippingAddress.email,
      };
      
      console.log('💳 Creating payment intent for cart total:', total);
      
      const paymentResponse = await fetch(`${serverUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(paymentRequestBody),
      });

      console.log('📥 Payment response status:', paymentResponse.status);

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('❌ Payment intent error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `Failed to create payment intent (Status: ${paymentResponse.status})`);
      }

      const paymentData = await paymentResponse.json();
      console.log('✅ Payment intent created:', paymentData.paymentIntentId);
      setPaymentIntentId(paymentData.paymentIntentId);
      setClientSecret(paymentData.clientSecret);
      
      console.log('📝 Creating order for', items.length, 'items...');
      
      // Create order with all cart items
      const orderResponse = await fetch(`${serverUrl}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          paymentIntentId: paymentData.paymentIntentId,
          customerEmail: shippingAddress.email,
          shippingAddress,
          orderDetails: {
            items: items.map(item => ({
              finish: item.finish,
              size: item.size,
              mountType: item.mountType,
              frame: item.frame,
              rushOrder: item.rushOrder,
              price: item.price,
            })),
            itemCount: items.length,
          },
          items: items, // Send full cart items with images for S3 upload
          amount: total,
          basePrice: basePrice,
          shippingRate: selectedRate,
          shipmentId: shipmentId,
          discount: appliedDiscount ? {
            code: appliedDiscount.code,
            type: appliedDiscount.type,
            value: appliedDiscount.value,
            discountAmount: discountAmount,
          } : null,
        }),
      });

      console.log('📥 Order response status:', orderResponse.status);

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('❌ Order creation error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `Failed to create order (Status: ${orderResponse.status})`);
      }

      const orderData = await orderResponse.json();
      console.log('✅ Order created:', orderData.orderId);
      setOrderId(orderData.orderId);
      
      console.log('✅ Moving to payment step');
      setStep('payment');
    } catch (err: any) {
      console.error('❌ Error initializing payment:', err);
      
      // Provide more helpful error messages
      let userMessage = err.message || 'Failed to initialize payment';
      
      if (err.message === 'Failed to fetch') {
        userMessage = 'Unable to connect to payment server. Please check your internet connection and try again.';
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/95 z-[9999] overflow-y-auto [data-theme='light']_&:bg-white/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-[#ff6b35] transition-colors [data-theme='light']_&:text-black"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bespoke Metal Prints</h2>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step === 'auth' ? 'text-[#ff6b35]' : step === 'shipping' ? 'text-[#ff6b35]' : step === 'payment' || step === 'confirmation' ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'auth' ? 'bg-[#ff6b35]' : step === 'shipping' ? 'bg-[#ff6b35]' : step === 'payment' || step === 'confirmation' ? 'bg-green-500' : 'bg-gray-700'}`}>
              {step === 'payment' || step === 'confirmation' ? <CheckCircle className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
            </div>
            <span className="hidden sm:inline">Shipping</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#ff6b35]' : step === 'confirmation' ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-[#ff6b35]' : step === 'confirmation' ? 'bg-green-500' : 'bg-gray-700'}`}>
              {step === 'confirmation' ? <CheckCircle className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
            </div>
            <span className="hidden sm:inline">Payment</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700" />
          <div className={`flex items-center gap-2 ${step === 'confirmation' ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'confirmation' ? 'bg-green-500' : 'bg-gray-700'}`}>
              <Package className="w-6 h-6" />
            </div>
            <span className="hidden sm:inline">Complete</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-[#1a1a1a] rounded-lg p-8 text-center [data-theme='light']_&:bg-gray-100">
                <h2 className="text-2xl mb-2 text-white [data-theme='light']_&:text-black">Choose Checkout Method</h2>
                <p className="text-gray-400 mb-8 [data-theme='light']_&:text-gray-600">
                  Sign in to save your order and enjoy faster checkout
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAuthModal(true)}
                    className="w-full px-6 py-4 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all flex items-center justify-center gap-3 [data-theme='light']_&:text-white"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAuthModal(true)}
                    className="w-full px-6 py-4 bg-[#ff6b35]/80 text-black rounded-lg hover:bg-[#ff8c42] transition-all flex items-center justify-center gap-3 [data-theme='light']_&:text-white"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Create Account</span>
                  </motion.button>
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-[#1a1a1a] text-gray-400 [data-theme='light']_&:bg-gray-100">or</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCheckoutAsGuest(true);
                      setStep('shipping');
                    }}
                    className="w-full px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all [data-theme='light']_&:bg-gray-200 [data-theme='light']_&:text-black"
                  >
                    Continue as Guest
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Cart Items Summary */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 [data-theme='light']_&:bg-gray-100">
                <h2 className="text-xl mb-4 text-white [data-theme='light']_&:text-black">
                  Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-white">
                      <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.thumbnail || item.image}
                          alt="Cart item"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm [data-theme='light']_&:text-black">
                          {item.size} - {item.finish}
                        </p>
                        <p className="text-gray-400 text-xs [data-theme='light']_&:text-gray-600">
                          {item.mountType} {item.frame !== 'None' && `• ${item.frame}`}
                        </p>
                      </div>
                      <div className="text-white text-sm [data-theme='light']_&:text-black">
                        ${item.price.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-400 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address Form */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 [data-theme='light']_&:bg-gray-100">
                <h2 className="text-xl mb-4 text-white [data-theme='light']_&:text-black">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="col-span-2 px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    autoComplete="email"
                    className="col-span-2 px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={shippingAddress.street1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street1: e.target.value })}
                    autoComplete="shipping address-line1"
                    className="col-span-2 px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <input
                    type="text"
                    placeholder="Apt, Suite (Optional)"
                    value={shippingAddress.street2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street2: e.target.value })}
                    className="col-span-2 px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="ZIP Code"
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                    autoComplete="shipping postal-code"
                    className="px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
              </div>

              {/* Get Shipping Rates Button */}
              {!shippingRates.length && (
                <button
                  onClick={fetchShippingRates}
                  disabled={loadingRates}
                  className="w-full px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingRates ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calculating Shipping...
                    </>
                  ) : (
                    'Calculate Shipping'
                  )}
                </button>
              )}

              {/* Shipping Rates */}
              {shippingRates.length > 0 && (
                <div className="bg-[#1a1a1a] rounded-lg p-6 [data-theme='light']_&:bg-gray-100">
                  <h2 className="text-xl mb-4 text-white [data-theme='light']_&:text-black">Select Shipping Method</h2>
                  <div className="space-y-3">
                    {shippingRates.map((rate) => (
                      <button
                        key={rate.id}
                        onClick={() => setSelectedRate(rate)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedRate?.id === rate.id
                            ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                            : 'border-gray-700 bg-[#0a0a0a] hover:border-gray-600 [data-theme=\'light\']_&:bg-white [data-theme=\'light\']_&:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white [data-theme='light']_&:text-black">
                              {rate.carrier} - {rate.service}
                            </div>
                            <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                              Estimated delivery: {rate.delivery_days} business days
                            </div>
                          </div>
                          <div className="text-lg text-[#ff6b35]">${rate.rate}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Discount Code */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 [data-theme='light']_&:bg-gray-100">
                <h2 className="text-xl mb-4 text-white [data-theme='light']_&:text-black">Discount Code</h2>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500 rounded-lg">
                    <div>
                      <div className="text-green-500">
                        Code "{appliedDiscount.code}" applied!
                      </div>
                      <div className="text-sm text-green-400">
                        {appliedDiscount.type === 'percentage'
                          ? `${appliedDiscount.value}% off`
                          : `$${appliedDiscount.value} off`}
                      </div>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                    />
                    <button
                      onClick={validateDiscountCode}
                      disabled={applyingDiscount}
                      className="px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-colors disabled:opacity-50"
                    >
                      {applyingDiscount ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
                {discountError && (
                  <div className="mt-2 text-red-500 text-sm">{discountError}</div>
                )}
              </div>

              {/* Order Total */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 [data-theme='light']_&:bg-gray-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-white [data-theme='light']_&:text-black">
                    <span>Subtotal:</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount ({appliedDiscount.code}):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedRate && (
                    <div className="flex justify-between text-white [data-theme='light']_&:text-black">
                      <span>Shipping:</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-2 flex justify-between text-xl text-[#ff6b35]">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Continue to Payment */}
              {selectedRate && (
                <button
                  onClick={initializePayment}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>
              )}
            </motion.div>
          )}

          {step === 'payment' && clientSecret && paymentIntentId && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Trust Badges */}
              <div className="mb-8">
                <TrustBadges variant="checkout" />
              </div>

              <StripePaymentForm
                clientSecret={clientSecret}
                amount={total}
                onSuccess={async (paymentIntentId, trackingNum) => {
                  console.log('✅ Payment successful!', { paymentIntentId, trackingNum });
                  setTrackingNumber(trackingNum);
                  
                  // Save address for returning customers
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session?.user) {
                    await saveAddress(session.user.id, session.access_token);
                  }
                  
                  // Clear cart after successful checkout
                  clearCart();
                  
                  setStep('confirmation');
                }}
                onError={(error) => {
                  console.error('❌ Payment failed:', error);
                  setError(error);
                  setStep('shipping');
                }}
                billingAddress={useSameAddress ? {
                  name: shippingAddress.name,
                  address: {
                    line1: shippingAddress.street1,
                    line2: shippingAddress.street2,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postal_code: shippingAddress.zip,
                    country: shippingAddress.country,
                  },
                } : {
                  name: billingAddress.name,
                  address: {
                    line1: billingAddress.street1,
                    line2: billingAddress.street2,
                    city: billingAddress.city,
                    state: billingAddress.state,
                    postal_code: billingAddress.zip,
                    country: billingAddress.country,
                  },
                }}
              />
            </motion.div>
          )}

          {step === 'confirmation' && orderId && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <OrderConfirmation
                orderId={orderId}
                email={shippingAddress.email}
                trackingNumber={trackingNumber}
                onClose={onClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => {
              setShowAuthModal(false);
              // Check if user logged in and redirect to shipping
              supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                  setIsLoggedIn(true);
                  setShippingAddress(prev => ({
                    ...prev,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || prev.name,
                  }));
                  setStep('shipping');
                }
              });
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}