import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Truck, MapPin, Clock, Globe, DollarSign, Package } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface ShippingPolicyPageProps {
  onBack: () => void;
  onTrackingClick?: () => void;
}

export function ShippingPolicyPage({ onBack, onTrackingClick }: ShippingPolicyPageProps) {
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem('christmas-banner-dismissed') === 'true';
  });
  
  useEffect(() => {
    const handleBannerDismissed = () => setBannerDismissed(true);
    window.addEventListener('banner-dismissed', handleBannerDismissed);
    return () => window.removeEventListener('banner-dismissed', handleBannerDismissed);
  }, []);

  return (
    <div className={`min-h-screen bg-[#0a0a0a] ${bannerDismissed ? 'pt-24' : 'pt-32'} pb-16 [data-theme='light']_&:bg-white transition-all duration-300`}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Return to Home Button */}
        <div className="mb-8">
          <ReturnToHomeButton onClick={onBack} />
        </div>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Truck className="w-8 h-8 text-[#ff6b35]" />
            <h1 className="text-4xl md:text-5xl text-white [data-theme='light']_&:text-black">
              Shipping Policy
            </h1>
          </div>
          <p className="text-gray-400 text-lg [data-theme='light']_&:text-gray-600">
            Last updated: November 10, 2025
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Overview */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <Package className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Overview</h2>
                <p className="text-gray-300 leading-relaxed [data-theme='light']_&:text-gray-700">
                  We ship our premium metal prints worldwide with care and precision. Each print is carefully packaged to ensure 
                  it arrives in perfect condition. All orders include tracking and insurance for your peace of mind.
                </p>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Processing & Production Time</h2>
                <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
                  <p className="leading-relaxed">
                    Each metal print is custom-made to order. Our typical production timeline is:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Standard Orders</h3>
                      <p className="text-[#ff6b35] text-2xl mb-1">3-5 business days</p>
                      <p className="text-sm">Production time before shipping</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Rush Orders</h3>
                      <p className="text-[#ff6b35] text-2xl mb-1">1-2 business days</p>
                      <p className="text-sm">Available for additional fee</p>
                    </div>
                  </div>
                  <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4">
                    <p className="text-sm">
                      <strong className="text-[#ff6b35]">Note:</strong> Production time does not include shipping time. 
                      Business days exclude weekends and holidays. You'll receive a tracking number once your order ships.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Methods */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <Truck className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Shipping Methods (US Domestic)</h2>
                <div className="space-y-4">
                  <div className="bg-[#0a0a0a] p-6 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg text-white [data-theme='light']_&:text-black">Standard Shipping</h3>
                      <span className="text-[#ff6b35]">$14.99+</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 [data-theme='light']_&:text-gray-700">5-7 business days delivery</p>
                    <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                      Most economical option. Tracking included. Price varies by size and weight.
                    </p>
                  </div>

                  <div className="bg-[#0a0a0a] p-6 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg text-white [data-theme='light']_&:text-black">Express Shipping</h3>
                      <span className="text-[#ff6b35]">$29.99+</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 [data-theme='light']_&:text-gray-700">2-3 business days delivery</p>
                    <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                      Faster delivery with priority handling. Tracking and signature confirmation included.
                    </p>
                  </div>

                  <div className="bg-[#0a0a0a] p-6 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg text-white [data-theme='light']_&:text-black">Overnight Shipping</h3>
                      <span className="text-[#ff6b35]">$59.99+</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 [data-theme='light']_&:text-gray-700">Next business day delivery</p>
                    <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                      Fastest option available. Requires rush production. Orders must be placed before 12pm EST.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8c42]/10 p-6 rounded-lg border border-[#ff6b35]/30">
                    <h3 className="text-lg text-white mb-2 [data-theme='light']_&:text-black">Free Shipping</h3>
                    <p className="text-gray-300 text-sm [data-theme='light']_&:text-gray-700">
                      <strong className="text-[#ff6b35]">Enjoy free standard shipping on orders over $150!</strong> Automatically 
                      applied at checkout. Cannot be combined with other shipping promotions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* International Shipping */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <Globe className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">International Shipping</h2>
                <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
                  <p className="leading-relaxed">
                    We ship to most countries worldwide. International shipping rates are calculated at checkout based on 
                    destination, size, and weight.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Canada</h3>
                      <p className="text-sm mb-2">7-12 business days</p>
                      <p className="text-[#ff6b35]">From $29.99</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Europe</h3>
                      <p className="text-sm mb-2">10-15 business days</p>
                      <p className="text-[#ff6b35]">From $49.99</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Australia/NZ</h3>
                      <p className="text-sm mb-2">12-18 business days</p>
                      <p className="text-[#ff6b35]">From $59.99</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Rest of World</h3>
                      <p className="text-sm mb-2">15-25 business days</p>
                      <p className="text-[#ff6b35]">From $69.99</p>
                    </div>
                  </div>

                  <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4">
                    <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Important International Information:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b35]">•</span>
                        <span>Customers are responsible for all customs duties, taxes, and import fees</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b35]">•</span>
                        <span>Delivery times may vary due to customs processing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b35]">•</span>
                        <span>All international shipments include tracking and insurance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b35]">•</span>
                        <span>We declare accurate values on all customs forms</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tracking */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Order Tracking</h2>
                <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
                  <p className="leading-relaxed">
                    Once your order ships, you'll receive a tracking number via email. You can track your order:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Using the tracking link in your shipping confirmation email</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>In your account dashboard under "Order History"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>On our website using the "Track Order" page</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Directly on the carrier's website</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Packaging */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Packaging & Protection</h2>
            <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
              <p className="leading-relaxed">
                We take great care in packaging your metal print to ensure safe delivery:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Protected with foam corners and edge protectors</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Wrapped in protective plastic sleeves</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Boxed in sturdy corrugated cardboard</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>All orders fully insured during transit</span>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Issues */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Shipping Issues</h2>
            <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
              <div>
                <h3 className="text-lg text-white mb-2 [data-theme='light']_&:text-black">Delayed Shipments</h3>
                <p className="leading-relaxed">
                  While rare, shipments can occasionally be delayed due to weather, carrier issues, or customs. If your order 
                  hasn't arrived within the expected timeframe, please contact us and we'll investigate with the carrier.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg text-white mb-2 [data-theme='light']_&:text-black">Lost or Stolen Packages</h3>
                <p className="leading-relaxed">
                  All shipments are insured. If tracking shows your package was delivered but you didn't receive it, please 
                  contact us within 48 hours. We'll file a claim with the carrier and send a replacement.
                </p>
              </div>

              <div>
                <h3 className="text-lg text-white mb-2 [data-theme='light']_&:text-black">Damaged in Transit</h3>
                <p className="leading-relaxed">
                  If your print arrives damaged, please take photos of the damage and packaging, then contact us within 7 days. 
                  We'll arrange a replacement at no cost to you.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8c42]/10 rounded-2xl p-8 border border-[#ff6b35]/30 text-center">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Shipping Questions?</h2>
            <p className="text-gray-300 mb-6 [data-theme='light']_&:text-gray-700">
              Need help with shipping or tracking? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:shipping@bespokemetalprints.com"
                className="px-6 py-3 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all inline-block"
              >
                Email Shipping Support
              </a>
              <button
                onClick={onTrackingClick}
                className="px-6 py-3 bg-[#0a0a0a] text-white rounded-full border border-[#ff6b35]/30 hover:border-[#ff6b35] transition-all inline-block [data-theme='light']_&:bg-white [data-theme='light']_&:text-black"
              >
                Track Your Order
              </button>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}