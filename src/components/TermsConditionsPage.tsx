import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, ShieldCheck, Scale, AlertCircle, Package, CreditCard, MessageSquare } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface TermsConditionsPageProps {
  onBack: () => void;
}

export function TermsConditionsPage({ onBack }: TermsConditionsPageProps) {
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
            <FileText className="w-8 h-8 text-[#ff6b35]" />
            <h1 className="text-4xl md:text-5xl text-black dark:text-white">
              Terms & Conditions
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
          {/* Agreement */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Agreement to Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Welcome to Bespoke Metal Prints. By accessing our website and placing orders with us, you agree to be bound 
                  by these Terms and Conditions. Please read them carefully before using our services. If you do not agree with 
                  any part of these terms, you may not use our website or services.
                </p>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <Package className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Services</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="leading-relaxed">
                    Bespoke Metal Prints provides custom metal printing services for your photos and artwork. Our services include:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Custom metal print production in various sizes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Multiple finish options (Gloss, Matte, Satin)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Various mounting and framing options</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Image editing and enhancement services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Nationwide shipping via trusted carriers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Orders and Payment */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <CreditCard className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Orders and Payment</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Order Acceptance</h3>
                    <p className="leading-relaxed">
                      All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order 
                      for any reason, including but not limited to product availability, errors in product or pricing information, 
                      or issues with payment processing.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Pricing</h3>
                    <p className="leading-relaxed">
                      All prices are in USD and are subject to change without notice. The price you pay is the price displayed 
                      at the time of order placement. We do not offer price matching or retroactive price adjustments.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Payment</h3>
                    <p className="leading-relaxed mb-2">
                      Payment is processed securely through Stripe. We accept:
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Credit cards (Visa, Mastercard, American Express, Discover)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Debit cards</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Digital wallets (Apple Pay, Google Pay)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg text-black dark:text-white mb-2">Discounts and Promotions</h3>
                    <p className="leading-relaxed">
                      Discount codes and promotional offers may be subject to specific terms and conditions. Only one discount 
                      code may be used per order unless otherwise specified. Discount codes cannot be applied retroactively to 
                      completed orders.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Image Guidelines */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <h2 className="text-2xl text-black dark:text-white mb-4">Image Upload Guidelines</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-lg text-black dark:text-white mb-2">Your Responsibility</h3>
                <p className="leading-relaxed mb-2">
                  When uploading images for printing, you represent and warrant that:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                    <span>You own the copyright to the image or have obtained proper authorization to reproduce it</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                    <span>The image does not violate any third-party intellectual property rights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                    <span>The image does not contain illegal, offensive, or inappropriate content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                    <span>You are legally authorized to print and reproduce the image</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg text-black dark:text-white mb-2">Image Quality</h3>
                <p className="leading-relaxed">
                  We recommend high-resolution images for best print quality. While we will print images of any resolution, 
                  we cannot guarantee quality results for low-resolution images. We are not responsible for poor print quality 
                  resulting from low-resolution source images.
                </p>
              </div>

              <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4">
                <p className="text-sm">
                  <strong className="text-[#ff6b35]">Copyright Notice:</strong> You assume all liability for copyright 
                  infringement. We reserve the right to refuse to print any image that we believe may violate copyright or 
                  other intellectual property rights.
                </p>
              </div>
            </div>
          </section>

          {/* Production and Shipping */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <h2 className="text-2xl text-black dark:text-white mb-4">Production and Shipping</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-lg text-black dark:text-white mb-2">Production Time</h3>
                <p className="leading-relaxed">
                  Standard production time is 5-7 business days. Rush order upgrades are available for 2-3 business day production. 
                  Production times do not include shipping transit time.
                </p>
              </div>

              <div>
                <h3 className="text-lg text-black dark:text-white mb-2">Shipping</h3>
                <p className="leading-relaxed">
                  We ship via trusted carriers (USPS, UPS, FedEx) based on your selected shipping speed. Once shipped, you will 
                  receive tracking information via email. Shipping times are estimates and not guaranteed. We are not responsible 
                  for delays caused by the carrier or weather conditions.
                </p>
              </div>

              <div>
                <h3 className="text-lg text-black dark:text-white mb-2">Order Modifications</h3>
                <p className="leading-relaxed">
                  Orders cannot be modified or canceled once production has begun. Please review your order carefully before 
                  completing checkout. Contact us immediately if you need to make changes to an order that has not yet entered 
                  production.
                </p>
              </div>
            </div>
          </section>

          {/* Quality and Guarantee */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <h2 className="text-2xl text-black dark:text-white mb-4">Quality Guarantee</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                We stand behind the quality of our products. If you receive a defective or damaged product, or if there was 
                an error on our part, please contact us within 7 days of delivery. We will:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Replace the product at no charge, or</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Issue a full refund to your original payment method</span>
                </li>
              </ul>
              <p className="leading-relaxed">
                Our quality guarantee does not cover issues resulting from:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Low-resolution source images</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Color variations inherent to the printing process</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Damage occurring after delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Subjective color preference differences</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <Scale className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Limitation of Liability</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="leading-relaxed">
                    To the maximum extent permitted by law, Bespoke Metal Prints shall not be liable for any indirect, incidental, 
                    special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or 
                    indirectly, or any loss of data, use, goodwill, or other intangible losses.
                  </p>
                  <p className="leading-relaxed">
                    Our total liability to you for any claim arising out of or relating to these terms or our services shall not 
                    exceed the amount you paid us for the specific order giving rise to the claim.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <h2 className="text-2xl text-black dark:text-white mb-4">Intellectual Property</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                All content on this website, including but not limited to text, graphics, logos, images, and software, is the 
                property of Bespoke Metal Prints or its content suppliers and is protected by United States and international 
                copyright laws.
              </p>
              <p className="leading-relaxed">
                You may not reproduce, modify, distribute, or republish any content from this website without our express written 
                permission.
              </p>
            </div>
          </section>

          {/* SMS Terms of Service */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <MessageSquare className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">SMS Terms of Service</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="leading-relaxed">
                    By opting in to SMS communications from <strong className="text-black dark:text-white">Bespoke Metal Prints</strong>, 
                    you agree to receive transactional text messages including order confirmations, shipping updates, and customer support communications.
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong className="text-black dark:text-white">Message frequency varies</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong className="text-black dark:text-white">Message and data rates may apply</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Reply <strong className="text-black dark:text-white">STOP</strong> to opt out</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Reply <strong className="text-black dark:text-white">HELP</strong> for help</span>
                    </li>
                  </ul>
                  <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4 mt-4">
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong className="text-[#ff6b35]">Support:</strong> For assistance, contact{' '}
                        <a href="mailto:support@bespokemetalprints.com" className="text-[#ff6b35] hover:underline">
                          support@bespokemetalprints.com
                        </a>
                      </p>
                      <p>
                        <strong className="text-[#ff6b35]">Privacy:</strong> See our{' '}
                        <a href="?page=privacy-policy" className="text-[#ff6b35] hover:underline">
                          Privacy Policy
                        </a>
                        {' '}for information on how we protect your data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <h2 className="text-2xl text-black dark:text-white mb-4">Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of Georgia, 
              United States, without regard to its conflict of law provisions. Any legal action or proceeding arising under these 
              terms shall be brought exclusively in the courts located in Georgia.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-200 dark:border-[#ff6b35]/20">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-black dark:text-white mb-4">Changes to Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately 
                  upon posting to the website. Your continued use of our services after changes are posted constitutes your 
                  acceptance of the modified terms. We encourage you to review these terms periodically.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8c42]/10 rounded-2xl p-8 border border-[#ff6b35]/30 text-center">
            <h2 className="text-2xl text-black dark:text-white mb-4">Questions About These Terms?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              If you have questions about these Terms and Conditions, please contact us:
            </p>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                <strong className="text-black dark:text-white">Email:</strong>{' '}
                <a href="mailto:info@bespokemetalprints.com" className="text-[#ff6b35] hover:underline">
                  info@bespokemetalprints.com
                </a>
              </p>
              <p>
                <strong className="text-black dark:text-white">Phone:</strong>{' '}
                <a href="tel:+18578582288" className="text-[#ff6b35] hover:underline">
                  (857) 858-2288
                </a>
              </p>
              <p>
                <strong className="text-black dark:text-white">Mail:</strong> Bespoke Metal Prints<br />
                4920 Bells Ferry Road<br />
                Ste 134-2081<br />
                Kennesaw GA 30144<br />
                United States
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}