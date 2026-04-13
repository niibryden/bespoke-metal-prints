import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Package, MapPin, CheckCircle, ArrowLeft, Loader2, Gift, UserPlus, LogIn, MessageSquare } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';
import { OrderConfirmation } from './OrderConfirmation';
import { StripePaymentForm } from './StripePaymentForm';
import { TrustBadges } from './TrustBadges';
import { getShippingDimensions } from '../utils/shipping-dimensions';
import { createThumbnail } from '../utils/image-thumbnail';
import { AuthModal } from './AuthModal';

// Helper function to compress base64 images
async function compressImage(base64Image: string, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Keep original dimensions for print quality
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Convert to compressed JPEG (better compression than PNG)
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64Image;
  });
}

interface ShippingRate {
  id: string;
  service: string;
  carrier: string;
  rate: string;
  delivery_days: number;
  delivery_date: string;
}

interface CheckoutPageProps {
  orderDetails: {
    finish: string;
    size: string;
    mountType: string;
    frame: string;
    image?: string;
    rushOrder?: boolean; // Add rushOrder property
  };
  basePrice: number;
  onClose: () => void;
  onComplete?: () => void; // Add callback for when checkout completes
}

export function CheckoutPage({ orderDetails, basePrice, onClose, onComplete }: CheckoutPageProps) {
  const [step, setStep] = useState<'auth' | 'shipping' | 'payment' | 'confirmation'>('auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftRecipientEmail, setGiftRecipientEmail] = useState('');
  
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
    freeShipping?: boolean; // Add freeShipping property
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  
  // Shipping form
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  
  // SMS consent - optional, not required for checkout
  const [smsConsent, setSmsConsent] = useState(false);
  
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
      if (!accessToken) {
        console.error('❌ No access token provided to loadSavedAddresses');
        return;
      }
      
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
      console.log('📡 Fetching customer data from:', `${serverUrl}/customer/${userId}`);
      
      const response = await fetch(`${serverUrl}/customer/${userId}/address`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log('📡 Customer addresses response status:', response.status);
      
      if (response.ok) {
        const addresses = await response.json();
        console.log('✅ Customer addresses loaded:', { 
          addressCount: addresses?.length || 0
        });
        
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
    
    // Listen for auth state changes (e.g., when user signs in/up via AuthModal)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in, auto-proceeding to shipping');
        setIsLoggedIn(true);
        setShippingAddress(prev => ({
          ...prev,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || prev.name,
        }));
        
        // Auto-proceed to shipping when user signs in during checkout
        if (step === 'auth') {
          setStep('shipping');
          setShowAuthModal(false);
        }
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase, step]);
  
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
        phone: shippingAddress.phone,
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
  
  // Payment
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  
  // Order
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [imageUploadedBeforePayment, setImageUploadedBeforePayment] = useState<boolean>(false);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;

  // Validate discount codes
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
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
          value: data.discount.value,
          freeShipping: false 
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

  // Calculate total with discount and free shipping
  const effectiveShippingCost = (appliedDiscount?.freeShipping && selectedRate) ? 0 : (selectedRate ? parseFloat(selectedRate.rate) : 0);
  const shippingCost = selectedRate ? parseFloat(selectedRate.rate) : 0; // Original shipping cost for display
  const total = subtotalAfterDiscount + effectiveShippingCost;
  
  // Log discount calculations for debugging
  useEffect(() => {
    if (appliedDiscount) {
      console.log('💰 DISCOUNT CALCULATION:');
      console.log('  Base Price:', basePrice.toFixed(2));
      console.log('  Discount Code:', appliedDiscount.code);
      console.log('  Discount Type:', appliedDiscount.type);
      console.log('  Discount Value:', appliedDiscount.value);
      console.log('  Discount Amount:', discountAmount.toFixed(2));
      console.log('  Free Shipping:', appliedDiscount.freeShipping || false);
      console.log('  Subtotal After Discount:', subtotalAfterDiscount.toFixed(2));
      console.log('  Original Shipping Cost:', shippingCost.toFixed(2));
      console.log('  Effective Shipping Cost:', effectiveShippingCost.toFixed(2));
      console.log('  FINAL TOTAL:', total.toFixed(2));
    }
  }, [appliedDiscount, basePrice, discountAmount, subtotalAfterDiscount, shippingCost, effectiveShippingCost, total]);

  // Fetch shipping rates from backend
  const fetchShippingRates = async () => {
    if (!shippingAddress.street1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      setError('Please fill in all shipping address fields');
      return;
    }

    setLoadingRates(true);
    setError(null);

    try {
      console.log('Fetching shipping rates for size:', orderDetails.size);
      
      // Normalize size format for server: convert "5" × 7"" to "5\" x 7\""
      // Replace Unicode × with lowercase x
      const normalizedSize = orderDetails.size.replace(/×/g, 'x').replace(/"/g, '\\"');
      console.log('Normalized size for server:', normalizedSize);
      
      // Get shipping dimensions based on product size
      const shippingDimensions = getShippingDimensions(orderDetails.size);
      console.log('Shipping dimensions:', shippingDimensions);
      
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
      setShipmentId(data.shipmentId); // Store shipment ID for later purchase
      if (data.rates.length > 0) {
        // Auto-select Express for rush orders, otherwise select first rate (Priority)
        if (orderDetails.rushOrder) {
          const expressRate = data.rates.find((rate: ShippingRate) => 
            rate.service.toLowerCase().includes('express')
          );
          setSelectedRate(expressRate || data.rates[data.rates.length - 1]); // Use last rate (express) if found
        } else {
          setSelectedRate(data.rates[0]); // Select first rate by default (Priority)
        }
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
      console.log('🔄 Starting payment initialization...');
      
      // Validate that we have a valid total amount
      if (!total || total <= 0) {
        console.error('❌ Invalid total amount:', total);
        throw new Error('Invalid order total. Please return to the configurator and try again.');
      }
      
      // Get user session for returning customer features
      const { data: { session } } = await supabase.auth.getSession();
      console.log('👤 User session:', session ? 'Found' : 'Not found');
      
      // ⚡ OPTIMIZATION: Skip image upload during payment initialization
      // Image will be uploaded AFTER payment confirmation for better UX
      // This makes "Continue to Payment" instant instead of waiting for S3 upload
      console.log('⚡ Skipping image upload - will upload after payment confirmation');
      
      // Create payment intent
      const paymentRequestBody = {
        amount: total,
        currency: 'usd',
        metadata: {
          customerEmail: shippingAddress.email,
          address: {
            line1: shippingAddress.street1,
            line2: shippingAddress.street2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zip,
            country: shippingAddress.country || 'US',
          },
        },
        // Pass user info for returning customer support and Stripe dashboard
        userId: session?.user?.id,
        customerEmail: shippingAddress.email,
        customerName: shippingAddress.name,
        customerPhone: shippingAddress.phone || null,
        // Pass discount information for tracking
        discount: appliedDiscount ? {
          code: appliedDiscount.code,
          type: appliedDiscount.type,
          value: appliedDiscount.value,
          discountAmount: discountAmount,
        } : null,
      };
      
      console.log('💳 Creating payment intent for amount:', total);
      if (appliedDiscount) {
        console.log(`💰 Discount applied: ${appliedDiscount.code} - Saving $${discountAmount.toFixed(2)} (Final total: $${total.toFixed(2)})`);
      }
      
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
      
      console.log('📝 Creating order with print-ready image...');
      
      // Log SMS consent status for debugging
      if (shippingAddress.phone && smsConsent) {
        console.log('📱 SMS consent granted for:', shippingAddress.phone);
      } else if (shippingAddress.phone && !smsConsent) {
        console.log('📵 SMS consent not granted (phone provided but opt-in declined)');
      } else {
        console.log('📵 No phone number provided');
      }
      
      // ⚡ PERFORMANCE: Skip image upload for instant payment page load
      // Image will be uploaded AFTER payment is confirmed in onSuccess callback
      // This makes "Continue to Payment" instant (< 500ms instead of 5-30 seconds)
      console.log('⚡ Skipping image upload - will upload after payment confirmation for better UX');
      
      const imageUrl = null; // No pre-upload
      const earlyOrderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setImageUploadedBeforePayment(false); // Will upload after payment
      
      // Create order WITH image URL and specific order ID
      const orderResponse = await fetch(`${serverUrl}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          orderId: earlyOrderId, // Use pre-generated order ID
          paymentIntentId: paymentData.paymentIntentId,
          customerEmail: shippingAddress.email,
          shippingAddress,
          smsConsent: smsConsent, // Track SMS consent preference
          imageUrl: imageUrl, // Image already uploaded to S3
          orderDetails: {
            finish: orderDetails.finish,
            size: orderDetails.size,
            mountType: orderDetails.mountType,
            frame: orderDetails.frame,
            hasImage: !!imageUrl, // True if image was successfully uploaded
          },
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
          <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-[#ff6b35]' : step === 'payment' || step === 'confirmation' ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-[#ff6b35]' : step === 'payment' || step === 'confirmation' ? 'bg-green-500' : 'bg-gray-700'}`}>
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
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    autoComplete="tel"
                    className="col-span-2 px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  
                  {/* SMS Consent Checkbox - Optional, A2P compliant */}
                  {shippingAddress.phone && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="col-span-2 mt-2"
                    >
                      <label className="flex items-start gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-[#ff6b35]/10 cursor-pointer hover:border-[#ff6b35]/30 transition-colors [data-theme='light']_&:bg-white">
                        <input
                          type="checkbox"
                          checked={smsConsent}
                          onChange={(e) => setSmsConsent(e.target.checked)}
                          className="mt-1 w-5 h-5 text-[#ff6b35] bg-transparent border-2 border-gray-600 rounded focus:ring-[#ff6b35] focus:ring-2"
                        />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-[#ff6b35]" />
                            <span className="text-white font-medium [data-theme='light']_&:text-black">
                              SMS Order Updates (Optional)
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed [data-theme='light']_&:text-gray-600">
                            I agree to receive transactional SMS updates including order confirmations, shipping updates, and customer support messages from Bespoke Metal Prints. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.
                          </p>
                        </div>
                      </label>
                    </motion.div>
                  )}
                  
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
                    autoComplete="shipping address-line2"
                    className="col-span-2 px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    autoComplete="shipping address-level2"
                    className="px-4 py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    autoComplete="shipping address-level1"
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
                <button
                  onClick={fetchShippingRates}
                  disabled={loadingRates}
                  className="mt-4 px-6 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 [data-theme='light']_&:text-white"
                >
                  {loadingRates ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate Shipping'
                  )}
                </button>
              </div>

              {shippingRates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1a1a1a] rounded-lg p-6 [data-theme='light']_&:bg-gray-100"
                >
                  <h2 className="text-xl mb-4 text-white [data-theme='light']_&:text-black">Select Shipping Method</h2>
                  <div className="space-y-3">
                    {shippingRates.map((rate) => (
                      <div
                        key={rate.id}
                        onClick={() => setSelectedRate(rate)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRate?.id === rate.id
                            ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                            : 'border-[#ff6b35]/20 hover:border-[#ff6b35]/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white [data-theme='light']_&:text-black">{rate.carrier} - {rate.service}</p>
                            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                              Estimated delivery: {rate.delivery_days} days
                            </p>
                          </div>
                          <p className="text-[#ff6b35]">${parseFloat(rate.rate).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedRate && (
                <button
                  onClick={initializePayment}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all [data-theme='light']_&:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  Continue to Payment
                </button>
              )}
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-[#1a1a1a] rounded-lg p-6 [data-theme='light']_&:bg-gray-100">
                <h2 className="text-xl mb-4 text-white [data-theme='light']_&:text-black">Order Summary</h2>
                <div className="space-y-2 text-gray-400 [data-theme='light']_&:text-gray-600">
                  <div className="flex justify-between">
                    <span>Metal Print</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Discount Section */}
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-500">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Discount ({appliedDiscount.code})
                      </span>
                      <span>
                        -${discountAmount.toFixed(2)}
                        {appliedDiscount.type === 'percentage' && ` (${appliedDiscount.value}%)`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Shipping ({selectedRate?.service})</span>
                    <span className={appliedDiscount?.freeShipping ? 'line-through text-gray-500' : ''}>
                      ${shippingCost.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Free Shipping Discount Row */}
                  {appliedDiscount?.freeShipping && shippingCost > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Free Shipping ({appliedDiscount.code})
                      </span>
                      <span>-${shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-[#ff6b35]/20 pt-2 mt-2 flex justify-between text-white text-xl [data-theme='light']_&:text-black">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="text-green-500 text-sm text-center pt-2">
                      You saved ${(discountAmount + (appliedDiscount.freeShipping ? shippingCost : 0)).toFixed(2)}!
                    </div>
                  )}
                </div>
                
                {/* Discount Code Input */}
                <div className="mt-6 pt-6 border-t border-[#ff6b35]/20">
                  <h3 className="text-sm text-gray-400 mb-3 [data-theme='light']_&:text-gray-600">Have a discount code?</h3>
                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setDiscountError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                        className="flex-1 px-4 py-2 bg-[#0a0a0a] text-white rounded-lg border border-[#ff6b35]/20 focus:border-[#ff6b35] outline-none text-sm [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={applyingDiscount || !discountCode.trim()}
                        className="px-6 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 [data-theme='light']_&:text-white"
                      >
                        {applyingDiscount ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Code <strong>{appliedDiscount.code}</strong> applied</span>
                      </div>
                      <button
                        onClick={removeDiscount}
                        className="text-red-500 hover:text-red-400 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {discountError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-red-500 text-sm"
                    >
                      {discountError}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Payment Methods section removed - cards are NOT saved for security */}

              {/* Trust Badges */}
              <div className="mb-8">
                <TrustBadges variant="checkout" />
              </div>

              {/* Stripe Payment Element */}
              {clientSecret ? (
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onSuccess={async () => {
                    console.log('💳 Payment confirmed!');
                    
                    // Immediately show confirmation page - don't wait for background operations
                    setStep('confirmation');
                    if (onComplete) {
                      onComplete();
                    }
                    
                    // Handle background operations without blocking the UI
                    (async () => {
                      try {
                        // 📤 Upload image now that payment is confirmed
                        if (orderDetails.image && !imageUploadedBeforePayment) {
                          console.log('📤 Uploading print-ready image to S3...');
                          try {
                            const compressedImage = await compressImage(orderDetails.image, 0.7);
                            console.log('🗜️ Image compressed:', 
                              Math.round(orderDetails.image.length / 1024), 'KB →',
                              Math.round(compressedImage.length / 1024), 'KB'
                            );
                            const fileName = `order-images/${orderId}.png`;
                            
                            const uploadResponse = await fetch(`${serverUrl}/upload-image`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${publicAnonKey}`,
                              },
                              body: JSON.stringify({
                                imageData: compressedImage,
                                fileName: fileName,
                                orderId: orderId,
                              }),
                            });
                            
                            if (uploadResponse.ok) {
                              const uploadData = await uploadResponse.json();
                              const uploadedImageUrl = uploadData.url;
                              console.log('✅ Image uploaded successfully:', uploadedImageUrl);
                              
                              // Update order with image URL
                              await fetch(`${serverUrl}/update-order`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${publicAnonKey}`,
                                },
                                body: JSON.stringify({
                                  orderId: orderId,
                                  imageUrl: uploadedImageUrl,
                                }),
                              });
                              console.log('✅ Order updated with image URL');
                            } else {
                              console.error('❌ Post-payment image upload failed');
                            }
                          } catch (uploadErr) {
                            console.error('❌ Post-payment image upload error:', uploadErr);
                            // Payment succeeded, so don't block completion
                          }
                        } else {
                          console.log('ℹ️ No image to upload or image already uploaded');
                        }
                        
                        // Update order status to paid
                        await fetch(`${serverUrl}/update-order-status`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${publicAnonKey}`,
                          },
                          body: JSON.stringify({
                            orderId: orderId,
                            status: 'paid',
                            paymentStatus: 'succeeded',
                          }),
                        });

                        // Save order to customer account if logged in
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session) {
                          try {
                            // Create thumbnail for order history display only
                            let thumbnailUrl = null;
                            
                            if (orderDetails.image) {
                              try {
                                console.log('Creating thumbnail for order history display...');
                                thumbnailUrl = await createThumbnail(orderDetails.image, 200, 200, 0.6);
                                console.log('Thumbnail created successfully');
                              } catch (thumbError) {
                                console.error('Failed to create thumbnail:', thumbError);
                              }
                            }
                            
                            await fetch(`${serverUrl}/customer/${session.user.id}/order`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`,
                              },
                              body: JSON.stringify({
                                orderId: orderId,
                                total,
                                items: {
                                  size: orderDetails.size,
                                  finish: orderDetails.finish,
                                  mountType: orderDetails.mountType,
                                  frame: orderDetails.frame,
                                  quantity: 1,
                                },
                                imageUrl: thumbnailUrl, // Small thumbnail for display in order history
                                image: orderDetails.image, // Full original image for reordering and printing
                              }),
                            });
                            
                            // Save address
                            await saveAddress(session.user.id, session.access_token);
                          } catch (err) {
                            console.error('Error saving customer data:', err);
                          }
                        }
                        
                        console.log('✅ All background operations completed');
                      } catch (err) {
                        console.error('Error in background operations:', err);
                      }
                    })(); // Execute immediately but don't await
                  }}
                  onError={(error) => {
                    setError(error);
                  }}
                  onBack={() => setStep('shipping')}
                  billingAddress={useSameAddress ? {
                    name: shippingAddress.name,
                    street1: shippingAddress.street1,
                    street2: shippingAddress.street2,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    zip: shippingAddress.zip,
                    country: shippingAddress.country,
                  } : billingAddress}
                />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
                </div>
              )}
            </motion.div>
          )}

          {step === 'confirmation' && orderId && (
            <OrderConfirmation
              orderId={orderId}
              email={shippingAddress.email}
              onClose={onClose}
              discount={appliedDiscount ? {
                code: appliedDiscount.code,
                type: appliedDiscount.type,
                value: appliedDiscount.value,
                discountAmount: discountAmount,
              } : null}
            />
          )}
        </AnimatePresence>
        
        {/* Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <AuthModal
              onClose={() => {
                setShowAuthModal(false);
              }}
              onSuccess={() => {
                // Called after successful login/signup
                console.log('✅ Auth successful, proceeding to shipping');
                setStep('shipping');
                setShowAuthModal(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}