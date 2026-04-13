import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, CreditCard } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import '../styles/stripe.css';
import { motion } from 'motion/react';

// Stripe promise will be initialized after fetching the publishable key
let stripePromiseCache: Promise<any> | null = null;

const getStripePromise = async () => {
  if (stripePromiseCache) {
    return stripePromiseCache;
  }

  stripePromiseCache = (async () => {
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
      const response = await fetch(`${serverUrl}/stripe-config`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Stripe configuration');
      }

      const { publishableKey } = await response.json();
      
      if (!publishableKey) {
        throw new Error('No publishable key returned');
      }

      return loadStripe(publishableKey);
    } catch (error) {
      console.error('Error loading Stripe:', error);
      throw error;
    }
  })();

  return stripePromiseCache;
};

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
  billingAddress?: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  onBillingAddressChange?: (address: any) => void;
}

function CheckoutForm({ onSuccess, onError, onBack, billingAddress, onBillingAddressChange }: Omit<PaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [localBillingAddress, setLocalBillingAddress] = useState(billingAddress || {
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      console.log('💳 Confirming payment with Stripe...');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('💳 Stripe payment error:', error);
        onError(error.message || 'Payment failed');
        setLoading(false);
      } else {
        console.log('💳 Payment confirmed successfully:', paymentIntent?.status);
        onSuccess();
      }
    } catch (err: any) {
      console.error('💳 Unexpected payment error:', err);
      onError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#1a1a1a] rounded-lg p-6 [data-theme='light']_&:bg-gray-100">
        <h2 className="text-xl mb-4 text-white flex items-center gap-2 [data-theme='light']_&:text-black">
          <CreditCard className="w-5 h-5" />
          Payment Information
        </h2>
        
        {/* Payment Methods Info */}
        <div className="mb-4 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
          <p className="mb-2 text-xs">We accept the following payment methods:</p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Visa */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center">
              <svg className="h-3.5" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.12 19.84L19.36 12.16H22.08L19.84 19.84H17.12Z" fill="#1434CB"/>
                <path d="M29.44 12.32C28.88 12.08 27.92 11.84 26.72 11.84C24.08 11.84 22.24 13.12 22.24 15.04C22.24 16.48 23.6 17.28 24.64 17.76C25.68 18.24 26.08 18.56 26.08 19.04C26.08 19.76 25.2 20.08 24.4 20.08C23.2 20.08 22.56 19.92 21.6 19.52L21.2 19.36L20.8 22.24C21.52 22.56 22.88 22.88 24.32 22.88C27.12 22.88 28.96 21.6 28.96 19.6C28.96 18.48 28.24 17.6 26.64 16.88C25.68 16.4 25.12 16.08 25.12 15.6C25.12 15.12 25.68 14.64 26.88 14.64C27.84 14.64 28.56 14.88 29.12 15.12L29.44 15.28L29.84 12.32Z" fill="#1434CB"/>
                <path d="M33.36 12.16H31.28C30.56 12.16 30.08 12.32 29.76 13.04L25.6 19.84H28.4L28.96 18.4H32.32L32.64 19.84H35.04L33.36 12.16ZM29.84 16.32C30 15.92 30.72 14.08 30.72 14.08C30.72 14.08 30.88 13.68 30.96 13.44L31.12 14.24L31.76 16.32H29.84Z" fill="#1434CB"/>
                <path d="M15.84 12.16L13.12 17.92L12.8 16.32C12.24 14.56 10.56 12.64 8.64 11.76L11.04 19.84H13.92L18.72 12.16H15.84Z" fill="#1434CB"/>
                <path d="M10.56 12.16H6.24L6.16 12.48C9.52 13.28 11.84 15.28 12.8 17.68L11.84 13.04C11.68 12.4 11.2 12.24 10.56 12.16Z" fill="#FCA121"/>
              </svg>
            </div>
            
            {/* Mastercard */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center">
              <svg className="h-3.5" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                <path d="M24 9.6C22.4 11 21.3 13.1 21.3 15.5C21.3 17.9 22.4 20 24 21.4C25.6 20 26.7 17.9 26.7 15.5C26.7 13.1 25.6 11 24 9.6Z" fill="#FF5F00"/>
              </svg>
            </div>
            
            {/* American Express */}
            <div className="h-6 px-2 bg-[#006FCF] rounded flex items-center justify-center">
              <svg className="h-3.5" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="4" y="20" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
              </svg>
            </div>
            
            {/* Discover */}
            <div className="h-6 px-2 bg-[#FF6000] rounded flex items-center justify-center">
              <svg className="h-3" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="2" y="18" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">DISCOVER</text>
              </svg>
            </div>
            
            {/* Klarna */}
            <div className="h-6 px-2 bg-[#FFB3C7] rounded flex items-center justify-center">
              <svg className="h-3" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="2" y="12" fill="#000" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">klarna</text>
              </svg>
            </div>
            
            {/* Affirm */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center border border-gray-200">
              <svg className="h-3" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="2" y="12" fill="#000" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">affirm</text>
              </svg>
            </div>
            
            {/* Cash App */}
            <div className="h-6 px-2 bg-[#00D632] rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">$</span>
            </div>
            
            {/* Link */}
            <div className="h-6 px-2 bg-[#00D66F] rounded flex items-center justify-center">
              <svg className="h-3" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="4" y="12" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">Link</text>
              </svg>
            </div>
            
            {/* Afterpay */}
            <div className="h-6 px-2 bg-[#B2FCE4] rounded flex items-center justify-center border border-gray-200">
              <svg className="h-3" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="12" fill="#000" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">afterpay</text>
              </svg>
            </div>
            
            {/* Bank Account */}
            <div className="h-6 px-2 bg-blue-100 rounded flex items-center justify-center border border-blue-200">
              <svg className="h-3" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="4" y="12" fill="#1e40af" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">Bank</text>
              </svg>
            </div>
          </div>
          <p className="mt-2 text-[10px] opacity-75">Select your preferred payment method in the form below. Additional options may appear based on your location.</p>
        </div>

        {/* Billing Address Checkbox */}
        <div className="mb-4 pb-4 border-b border-gray-700 [data-theme='light']_&:border-gray-300">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={!useSameAddress}
              onChange={(e) => setUseSameAddress(!e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-[#ff6b35] focus:ring-[#ff6b35] focus:ring-offset-0 bg-[#0a0a0a] [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
            />
            <span className="text-white [data-theme='light']_&:text-black">Use different billing address</span>
          </label>
        </div>

        {/* Billing Address Form */}
        {!useSameAddress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mb-6"
          >
            <h3 className="text-white font-medium [data-theme='light']_&:text-black">Billing Address</h3>
            
            <div>
              <label className="block text-sm mb-2 text-gray-400 [data-theme='light']_&:text-gray-600">
                Full Name *
              </label>
              <input
                type="text"
                value={localBillingAddress.name}
                onChange={(e) => {
                  const updated = { ...localBillingAddress, name: e.target.value };
                  setLocalBillingAddress(updated);
                  onBillingAddressChange?.(updated);
                }}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b35] [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-400 [data-theme='light']_&:text-gray-600">
                Street Address *
              </label>
              <input
                type="text"
                value={localBillingAddress.street1}
                onChange={(e) => {
                  const updated = { ...localBillingAddress, street1: e.target.value };
                  setLocalBillingAddress(updated);
                  onBillingAddressChange?.(updated);
                }}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b35] [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-400 [data-theme='light']_&:text-gray-600">
                Apartment, suite, etc. (optional)
              </label>
              <input
                type="text"
                value={localBillingAddress.street2}
                onChange={(e) => {
                  const updated = { ...localBillingAddress, street2: e.target.value };
                  setLocalBillingAddress(updated);
                  onBillingAddressChange?.(updated);
                }}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b35] [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-400 [data-theme='light']_&:text-gray-600">
                  City *
                </label>
                <input
                  type="text"
                  value={localBillingAddress.city}
                  onChange={(e) => {
                    const updated = { ...localBillingAddress, city: e.target.value };
                    setLocalBillingAddress(updated);
                    onBillingAddressChange?.(updated);
                  }}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b35] [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-400 [data-theme='light']_&:text-gray-600">
                  State *
                </label>
                <input
                  type="text"
                  value={localBillingAddress.state}
                  onChange={(e) => {
                    const updated = { ...localBillingAddress, state: e.target.value };
                    setLocalBillingAddress(updated);
                    onBillingAddressChange?.(updated);
                  }}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b35] [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
                  placeholder="CA"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-400 [data-theme='light']_&:text-gray-600">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={localBillingAddress.zip}
                  onChange={(e) => {
                    const updated = { ...localBillingAddress, zip: e.target.value };
                    setLocalBillingAddress(updated);
                    onBillingAddressChange?.(updated);
                  }}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b35] [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
                  placeholder="12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-400 [data-theme='light']_&:text-gray-600">
                  Country *
                </label>
                <select
                  value={localBillingAddress.country}
                  onChange={(e) => {
                    const updated = { ...localBillingAddress, country: e.target.value };
                    setLocalBillingAddress(updated);
                    onBillingAddressChange?.(updated);
                  }}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b35] [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
                  required
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        <div className="stripe-payment-element">
          <PaymentElement 
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card', 'cashapp', 'link', 'affirm', 'klarna', 'afterpay_clearpay', 'us_bank_account'],
            }}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all [data-theme='light']_&:bg-gray-300 [data-theme='light']_&:text-black"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-6 py-4 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 [data-theme='light']_&:text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay Now`
          )}
        </button>
      </div>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, onSuccess, onError, onBack, billingAddress }: PaymentFormProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    // Only initialize stripe once
    if (!stripePromise) {
      setStripePromise(getStripePromise());
    }
    
    // Log billing address for debugging
    if (billingAddress && billingAddress.name) {
      console.log('💳 Stripe Payment Form: Pre-populating billing address:', billingAddress);
    } else {
      console.log('💳 Stripe Payment Form: No saved billing address to pre-populate');
    }
  }, [billingAddress]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#ff6b35',
        colorBackground: '#0a0a0a',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
    ...(billingAddress && billingAddress.name ? {
      defaultValues: {
        billingDetails: {
          name: billingAddress.name,
          address: {
            line1: billingAddress.street1,
            line2: billingAddress.street2 || undefined,
            city: billingAddress.city,
            state: billingAddress.state,
            postal_code: billingAddress.zip,
            country: billingAddress.country || 'US',
          },
        },
      },
    } : {}),
  };

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm onSuccess={onSuccess} onError={onError} onBack={onBack} />
    </Elements>
  );
}