import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Package, Clock, AlertCircle } from 'lucide-react';

interface RefundPolicyPageProps {
  onBack: () => void;
}

export function RefundPolicyPage({ onBack }: RefundPolicyPageProps) {
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
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#ff6b35]" />
            <h1 className="text-4xl md:text-5xl text-black dark:text-white">
              Refund & Cancellation Policy
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
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
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Overview</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  At Bespoke Metal Prints, we take pride in creating custom, high-quality metal prints tailored specifically to your order. 
                  Due to the personalized nature of our products, we have specific policies regarding refunds and cancellations.
                </p>
              </div>
            </div>
          </section>

          {/* Order Cancellation */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Order Cancellation</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Before Production</h3>
                    <p className="leading-relaxed">
                      Orders can be cancelled for a full refund within <strong className="text-[#ff6b35]">24 hours</strong> of placement, 
                      provided production has not yet begun. To cancel your order, please contact us immediately at 
                      <a href="mailto:support@bespokemetalprints.com" className="text-[#ff6b35] hover:underline ml-1">
                        support@bespokemetalprints.com
                      </a> with your order number.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">After Production Begins</h3>
                    <p className="leading-relaxed">
                      Once production has started (typically 24 hours after order placement), orders cannot be cancelled as materials 
                      have been committed and the printing process has commenced. We begin production quickly to ensure fast delivery.
                    </p>
                  </div>
                  <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4">
                    <p className="text-sm">
                      <strong className="text-[#ff6b35]">Production Timeline:</strong> Most orders enter production within 24 hours. 
                      You will receive an email notification when production begins.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Policy */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <Package className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Refund Policy</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Defective or Damaged Products</h3>
                    <p className="leading-relaxed mb-2">
                      We stand behind the quality of our products. If your metal print arrives damaged or with a manufacturing defect, 
                      we will provide a full refund or replacement at no additional cost.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Report damage or defects within <strong className="text-[#ff6b35]">7 days</strong> of delivery</li>
                      <li>Provide photos of the damaged or defective item</li>
                      <li>Include your order number and description of the issue</li>
                      <li>We will arrange return shipping at our expense</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Customer Error</h3>
                    <p className="leading-relaxed">
                      If you uploaded an incorrect image, selected wrong specifications, or made an error during the ordering process, 
                      we unfortunately cannot offer refunds as each print is custom-made to your exact specifications. 
                      We recommend carefully reviewing your order before completing checkout.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Quality Not As Expected</h3>
                    <p className="leading-relaxed mb-2">
                      We strive for 100% customer satisfaction. If you're unsatisfied with the quality of your print (not due to 
                      image resolution or customer error), please contact us within 14 days of delivery. We review these cases 
                      individually and may offer:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>A partial refund</li>
                      <li>Store credit for future orders</li>
                      <li>A replacement print with adjustments</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Lost or Missing Orders</h3>
                    <p className="leading-relaxed">
                      If your order doesn't arrive within the expected delivery window and tracking shows it as lost, we will 
                      issue a full refund or send a replacement at no charge. Please allow 2-3 business days after the expected 
                      delivery date before reporting as lost.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <h2 className="text-2xl text-black dark:text-white mb-4">Refund Process</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-lg border border-gray-200 dark:border-[#ff6b35]/10">
                  <div className="text-3xl text-[#ff6b35] mb-2">1</div>
                  <h3 className="text-black dark:text-white mb-2">Contact Us</h3>
                  <p className="text-sm">Email us with your order details and issue description within the applicable timeframe.</p>
                </div>
                <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-lg border border-gray-200 dark:border-[#ff6b35]/10">
                  <div className="text-3xl text-[#ff6b35] mb-2">2</div>
                  <h3 className="text-black dark:text-white mb-2">Review</h3>
                  <p className="text-sm">Our team reviews your request within 1-2 business days and may request additional information.</p>
                </div>
                <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-lg border border-gray-200 dark:border-[#ff6b35]/10">
                  <div className="text-3xl text-[#ff6b35] mb-2">3</div>
                  <h3 className="text-black dark:text-white mb-2">Resolution</h3>
                  <p className="text-sm">Approved refunds are processed within 5-7 business days to your original payment method.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8c42]/10 rounded-2xl p-8 border border-[#ff6b35]/30">
            <h2 className="text-2xl text-black dark:text-white mb-4">Important Notes</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                <span>All custom orders are final sale unless defective or damaged in transit</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                <span>Refunds do not include original shipping costs unless the return is due to our error</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                <span>Sale or promotional items follow the same refund policy as regular items</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                <span>We reserve the right to refuse service to customers who abuse our refund policy</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20 text-center">
            <h2 className="text-2xl text-black dark:text-white mb-4">Questions About Our Policy?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              If you have any questions about our refund and cancellation policy, please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@bespokemetalprints.com"
                className="px-6 py-3 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all inline-block"
              >
                Email Support
              </a>
              <a
                href="tel:+1-555-PRINTS-1"
                className="px-6 py-3 bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-full border border-gray-200 dark:border-[#ff6b35]/30 hover:border-[#ff6b35] transition-all inline-block"
              >
                Call Us
              </a>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}