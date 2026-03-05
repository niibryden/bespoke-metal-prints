import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText, MessageSquare } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
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
        {/* Back Button */}
        <ReturnToHomeButton onClick={onBack} variant="dark" className="mb-8" />

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#ff6b35]" />
            <h1 className="text-4xl md:text-5xl text-white [data-theme='light']_&:text-black">
              Privacy Policy
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
              <Lock className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Overview</h2>
                <p className="text-gray-300 leading-relaxed [data-theme='light']_&:text-gray-700">
                  At Bespoke Metal Prints, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                  disclose, and safeguard your information when you visit our website or purchase our products. Please read this 
                  policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <Database className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Information We Collect</h2>
                <div className="space-y-6 text-gray-300 [data-theme='light']_&:text-gray-700">
                  <div>
                    <h3 className="text-lg text-white mb-3 [data-theme='light']_&:text-black">Personal Information</h3>
                    <p className="mb-3 leading-relaxed">
                      When you create an account or place an order, we collect information that identifies you:
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Name and contact information (email, phone number, shipping/billing address)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Payment information (processed securely through Stripe - we never store full card details)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Account credentials (email and encrypted password)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Order history and preferences</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg text-white mb-3 [data-theme='light']_&:text-black">Images and Content</h3>
                    <p className="leading-relaxed">
                      When you upload images for printing, we temporarily store these files to process your order. Images are 
                      securely stored and are only used for fulfilling your order. We do not use your images for any other purpose 
                      without your explicit consent.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg text-white mb-3 [data-theme='light']_&:text-black">Automatically Collected Information</h3>
                    <p className="mb-3 leading-relaxed">
                      When you visit our website, we automatically collect certain information about your device and usage:
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>IP address and browser type</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Operating system and device information</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Pages viewed and time spent on pages</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Referring website and search terms used</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg text-white mb-3 [data-theme='light']_&:text-black">Cookies and Tracking</h3>
                    <p className="leading-relaxed">
                      We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and 
                      remember your preferences. You can control cookies through your browser settings, though disabling them 
                      may affect site functionality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">How We Use Your Information</h2>
                <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
                  <p className="leading-relaxed">We use the information we collect to:</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Order Processing</h3>
                      <p className="text-sm">Process and fulfill your orders, including printing, shipping, and customer support</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Communication</h3>
                      <p className="text-sm">Send order confirmations, shipping updates, and respond to inquiries</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Account Management</h3>
                      <p className="text-sm">Maintain your account, order history, and saved preferences</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Site Improvement</h3>
                      <p className="text-sm">Analyze usage patterns to improve our website and services</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Marketing</h3>
                      <p className="text-sm">Send promotional emails (only with your consent - you can opt out anytime)</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ff6b35]/10 [data-theme='light']_&:bg-white">
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Legal Compliance</h3>
                      <p className="text-sm">Comply with legal obligations and protect our legal rights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <UserCheck className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Information Sharing and Disclosure</h2>
                <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
                  <p className="leading-relaxed">
                    We do not sell your personal information. We may share your information only in the following circumstances:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Service Providers</h3>
                      <p className="text-sm leading-relaxed">
                        We work with trusted third-party service providers who assist us in operating our website and processing 
                        orders (e.g., payment processors like Stripe, shipping carriers like EasyPost, and hosting providers like 
                        Supabase). These providers only have access to information needed to perform their services.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Legal Requirements</h3>
                      <p className="text-sm leading-relaxed">
                        We may disclose your information if required by law, court order, or governmental request, or to protect 
                        our rights, property, or safety.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">Business Transfers</h3>
                      <p className="text-sm leading-relaxed">
                        In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new 
                        owner, subject to the same privacy protections.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-white mb-2 [data-theme='light']_&:text-black">With Your Consent</h3>
                      <p className="text-sm leading-relaxed">
                        We may share your information for any other purpose with your explicit consent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SMS Communications */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <MessageSquare className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">SMS Communications</h2>
                <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
                  <p className="leading-relaxed">
                    If you opt in to receive SMS communications from Bespoke Metal Prints, we may send transactional messages 
                    such as order confirmations, shipping updates, and customer support messages.
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong className="text-white [data-theme='light']_&:text-black">Message frequency varies</strong> based on your order activity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong className="text-white [data-theme='light']_&:text-black">Message and data rates may apply</strong> depending on your mobile carrier</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>You may <strong className="text-white [data-theme='light']_&:text-black">opt out at any time by replying STOP</strong> to any SMS message</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Request assistance by <strong className="text-white [data-theme='light']_&:text-black">replying HELP</strong> to any SMS message</span>
                    </li>
                  </ul>
                  <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4 mt-4">
                    <p className="text-sm">
                      <strong className="text-[#ff6b35]">Your Privacy:</strong> We do not sell or share SMS consent with third 
                      parties for marketing purposes. SMS communications are only used for order-related transactional messages 
                      and customer support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Data Security</h2>
            <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
              <p className="leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>SSL/TLS encryption for all data transmission</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Secure, encrypted password storage</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>PCI-DSS compliant payment processing through Stripe</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Regular security audits and updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Restricted access to personal information on a need-to-know basis</span>
                </li>
              </ul>
              <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong className="text-[#ff6b35]">Important:</strong> While we strive to protect your personal information, 
                  no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Your Privacy Rights</h2>
                <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
                  <p className="leading-relaxed">Depending on your location, you may have the following rights:</p>
                  <div className="space-y-3 ml-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-white mb-1 [data-theme='light']_&:text-black">Right to Access</h3>
                        <p className="text-sm">Request a copy of the personal information we hold about you</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-white mb-1 [data-theme='light']_&:text-black">Right to Correction</h3>
                        <p className="text-sm">Request correction of inaccurate or incomplete information</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-white mb-1 [data-theme='light']_&:text-black">Right to Deletion</h3>
                        <p className="text-sm">Request deletion of your personal information (subject to legal obligations)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-white mb-1 [data-theme='light']_&:text-black">Right to Opt-Out</h3>
                        <p className="text-sm">Unsubscribe from marketing communications at any time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-white mb-1 [data-theme='light']_&:text-black">Right to Data Portability</h3>
                        <p className="text-sm">Request transfer of your data to another service</p>
                      </div>
                    </div>
                  </div>
                  <p className="leading-relaxed mt-4">
                    To exercise these rights, please contact us at{' '}
                    <a href="mailto:privacy@bespokemetalprints.com" className="text-[#ff6b35] hover:underline">
                      privacy@bespokemetalprints.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Data Retention</h2>
            <div className="space-y-4 text-gray-300 [data-theme='light']_&:text-gray-700">
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, 
                unless a longer retention period is required or permitted by law.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Order information: Retained for 7 years for tax and legal purposes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Uploaded images: Deleted 90 days after order completion</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Account data: Retained until you request deletion</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Analytics data: Anonymized after 26 months</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed [data-theme='light']_&:text-gray-700">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information 
              from children under 13. If you believe we have collected information from a child under 13, please contact us 
              immediately and we will delete it.
            </p>
          </section>

          {/* International Users */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed [data-theme='light']_&:text-gray-700">
              Your information may be transferred to and processed in countries other than your country of residence. These 
              countries may have data protection laws different from your country. By using our services, you consent to the 
              transfer of your information to the United States and other countries where we operate.
            </p>
          </section>

          {/* Updates */}
          <section className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ff6b35]/20 [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-200">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed [data-theme='light']_&:text-gray-700">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy 
              policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically. 
              Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8c42]/10 rounded-2xl p-8 border border-[#ff6b35]/30 text-center">
            <h2 className="text-2xl text-white mb-4 [data-theme='light']_&:text-black">Contact Us About Privacy</h2>
            <p className="text-gray-300 mb-6 [data-theme='light']_&:text-gray-700">
              If you have questions or concerns about this privacy policy or our data practices, please contact us:
            </p>
            <div className="space-y-3 text-gray-300 [data-theme='light']_&:text-gray-700">
              <p>
                <strong className="text-white [data-theme='light']_&:text-black">Email:</strong>{' '}
                <a href="mailto:privacy@bespokemetalprints.com" className="text-[#ff6b35] hover:underline">
                  privacy@bespokemetalprints.com
                </a>
              </p>
              <p>
                <strong className="text-white [data-theme='light']_&:text-black">Mail:</strong> Bespoke Metal Prints<br />
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