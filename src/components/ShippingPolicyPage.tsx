import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Truck, Package, MapPin, Clock, DollarSign, AlertCircle, ShieldCheck } from 'lucide-react';
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
    <div className={`min-h-screen bg-white dark:bg-[#0a0a0a] ${bannerDismissed ? 'pt-24' : 'pt-32'} pb-16 transition-all duration-300`}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <ReturnToHomeButton onClick={onBack} className="mb-8" />

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Truck className="w-8 h-8 text-[#ff6b35]" />
            <h1 className="text-4xl md:text-5xl text-black dark:text-white">
              Shipping Policy
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Last updated: February 5, 2026
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
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <Package className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Shipping Overview</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  At Bespoke Metal Prints, we carefully package and ship your custom metal prints to ensure they arrive in 
                  perfect condition. We partner with trusted carriers (USPS, UPS, FedEx) to deliver your order safely and 
                  efficiently. All orders are shipped from our production facility in Georgia, USA.
                </p>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Production & Processing Time</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Standard Production</h3>
                    <p className="leading-relaxed">
                      Standard production time is <strong className="text-[#ff6b35]">5-7 business days</strong>. This is the time 
                      needed to create your custom metal print from the moment your order is placed. Production time does not include 
                      shipping transit time.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Rush Order Upgrade</h3>
                    <p className="leading-relaxed mb-2">
                      Need your print faster? We offer rush production for <strong className="text-[#ff6b35]">2-3 business days</strong> 
                      for an additional fee. Rush orders are given priority in our production queue.
                    </p>
                    <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4 mt-3">
                      <p className="text-sm">
                        <strong className="text-[#ff6b35]">Note:</strong> Rush production is available during checkout. Select the 
                        rush option before completing your order.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">When Production Begins</h3>
                    <p className="leading-relaxed">
                      Most orders enter production within <strong className="text-[#ff6b35]">24 hours</strong> of order placement. 
                      You will receive an email notification when production begins and another when your order ships with tracking information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Options */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <Truck className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Shipping Options & Transit Times</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-lg border border-gray-200 dark:border-[#ff6b35]/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-[#ff6b35]" />
                        <h3 className="text-lg text-black dark:text-white">Standard</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong className="text-black dark:text-white">5-7 business days</strong>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Most economical option. Transit time may vary by location.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-lg border border-gray-200 dark:border-[#ff6b35]/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Truck className="w-5 h-5 text-[#ff6b35]" />
                        <h3 className="text-lg text-black dark:text-white">Expedited</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong className="text-black dark:text-white">2-3 business days</strong>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Faster delivery for time-sensitive orders.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-lg border border-gray-200 dark:border-[#ff6b35]/10">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-5 h-5 text-[#ff6b35]" />
                        <h3 className="text-lg text-black dark:text-white">Express</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong className="text-black dark:text-white">1-2 business days</strong>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Fastest delivery option available.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong className="text-[#ff6b35]">Important:</strong> Transit times are estimates and begin after production 
                      is complete. Actual delivery may vary based on carrier performance and destination. Remote or rural areas may 
                      experience longer delivery times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Costs */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <DollarSign className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Shipping Costs</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="leading-relaxed">
                    Shipping costs are calculated in real-time based on your order size, weight, destination, and selected 
                    shipping speed. You will see the exact shipping cost before completing checkout.
                  </p>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Factors Affecting Shipping Cost</h3>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong className="text-black dark:text-white">Size & Weight:</strong> Larger prints cost more to ship</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong className="text-black dark:text-white">Destination:</strong> Distance from Georgia affects cost</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong className="text-black dark:text-white">Speed:</strong> Faster shipping options cost more</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong className="text-black dark:text-white">Special Options:</strong> Signature required or insurance adds cost</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Free Shipping</h3>
                    <p className="leading-relaxed">
                      <strong className="text-[#ff6b35]">🎉 Free shipping is automatically applied to all orders over $100!</strong> 
                      No discount code required - just add $100 or more to your cart and enjoy free shipping on your order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Locations */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Shipping Locations</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Domestic Shipping (USA)</h3>
                    <p className="leading-relaxed">
                      We ship to all 50 states, including Alaska and Hawaii. Please note that Alaska, Hawaii, and US territories 
                      may have longer transit times and higher shipping costs.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">International Shipping</h3>
                    <p className="leading-relaxed mb-2">
                      We currently ship to select international destinations. International shipping costs and transit times vary 
                      significantly by country. Additional customs fees, duties, or taxes may apply and are the responsibility of 
                      the recipient.
                    </p>
                    <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4 mt-3">
                      <p className="text-sm">
                        <strong className="text-[#ff6b35]">Customs & Duties:</strong> International customers are responsible for 
                        all customs fees, import duties, and taxes charged by their country. We have no control over these charges.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">PO Boxes & APO/FPO Addresses</h3>
                    <p className="leading-relaxed">
                      We ship to PO Boxes and military APO/FPO addresses via USPS. Please allow additional transit time for 
                      military addresses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tracking */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <h2 className="text-2xl text-black dark:text-white mb-4">Order Tracking</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                Once your order ships, you will receive an email with tracking information. You can use this tracking number to 
                monitor your shipment's progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white dark:bg-[#0a0a0a] p-4 rounded-lg border border-gray-200 dark:border-[#ff6b35]/10">
                  <h3 className="text-lg text-black dark:text-white mb-2">Track Your Order</h3>
                  <p className="text-sm mb-4">
                    Enter your order number or tracking number to see the current status of your shipment.
                  </p>
                  {onTrackingClick && (
                    <button
                      onClick={onTrackingClick}
                      className="px-6 py-2 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all"
                    >
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Packaging */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <h2 className="text-2xl text-black dark:text-white mb-4">Packaging & Protection</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                Your metal prints are valuable, and we take great care in packaging them for safe delivery:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Protective corner guards and edge protection</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Foam padding and cushioning materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Sturdy corrugated cardboard boxes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Weatherproof outer wrapping</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Clear "Fragile" and "Handle with Care" labels</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Delivery Issues */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Delivery Issues</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Lost or Stolen Packages</h3>
                    <p className="leading-relaxed">
                      If tracking shows your package was delivered but you did not receive it, please check with neighbors, your 
                      building manager, or household members. If the package cannot be located, contact us within 7 days and we 
                      will work with the carrier to file a claim.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Damaged in Transit</h3>
                    <p className="leading-relaxed mb-2">
                      If your metal print arrives damaged, please:
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Take photos of the damaged packaging and product</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Keep all packaging materials</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Contact us within 7 days with photos and order details</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>We will arrange a replacement or refund at no cost to you</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Address Errors</h3>
                    <p className="leading-relaxed">
                      Please ensure your shipping address is correct and complete before placing your order. We cannot be 
                      responsible for orders shipped to incorrect addresses provided by the customer. If you need to update 
                      your address, contact us immediately - we can only make changes before the order ships.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8c42]/10 rounded-2xl p-8 border border-[#ff6b35]/30 text-center">
            <h2 className="text-2xl text-black dark:text-white mb-4">Questions About Shipping?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              If you have questions about shipping options, tracking, or delivery, we're here to help.
            </p>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                <strong className="text-black dark:text-white">Email:</strong>{' '}
                <a href="mailto:shipping@bespokemetalprints.com" className="text-[#ff6b35] hover:underline">
                  shipping@bespokemetalprints.com
                </a>
              </p>
              <p>
                <strong className="text-black dark:text-white">Phone:</strong>{' '}
                <a href="tel:+18578582288" className="text-[#ff6b35] hover:underline">
                  (857) 858-2288
                </a>
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
