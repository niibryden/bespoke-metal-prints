import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Search, Package, Truck, CreditCard, Image, Ruler, HelpCircle } from 'lucide-react';

interface FAQPageProps {
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'ordering' | 'products' | 'shipping' | 'pricing' | 'technical';
}

export function FAQPage({ onClose }: FAQPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'products',
      question: 'What are ChromaLuxe metal prints?',
      answer: 'ChromaLuxe metal prints are premium aluminum prints where your image is infused directly into a specially coated aluminum sheet using dye-sublimation technology. This creates a vibrant, durable print with exceptional color depth and a modern, sleek appearance that will last 75+ years without fading.'
    },
    {
      category: 'products',
      question: 'Do metal prints fade over time?',
      answer: 'High-quality metal prints produced using dye-sublimation on aluminum panels are commonly rated to last 50–60+ years indoors without noticeable fading when properly displayed.'
    },
    {
      category: 'products',
      question: 'Are metal prints suitable for humid environments?',
      answer: 'Metal prints are moisture-resistant and are commonly used for indoor display in environments where humidity may affect paper or canvas prints.'
    },
    {
      category: 'products',
      question: 'How are metal prints produced?',
      answer: 'Metal prints are produced by infusing dyes into coated aluminum panels using a dye-sublimation printing process.'
    },
    {
      category: 'products',
      question: 'What sizes do you offer?',
      answer: 'We offer seven sizes: 5"×7" ($25 - sample size only, cannot be framed), 12"×8" ($49.99), 17"×11" ($69.99), 24"×16" ($109.99), 30"×20" ($149.99), 36"×24" ($199.99), and 40"×30" ($269.99). We also offer custom sizes. All prices shown are before the current 10% discount with code WELCOME10.'
    },
    {
      category: 'products',
      question: 'What\'s the difference between gloss and matte finish?',
      answer: 'Gloss finish provides vibrant, high-contrast colors with a reflective surface - perfect for bold images and modern spaces. Matte finish offers a soft, elegant look with no glare, ideal for viewing in bright lighting conditions and creating a professional, gallery-quality appearance.'
    },
    {
      category: 'products',
      question: 'Can I add a frame to my metal print?',
      answer: 'Yes! We offer three premium framing options: Black ($37+), Gold ($37+), and Natural Wood ($37+). Frame pricing scales with size. Note that our 5"x7" sample size cannot be framed. Frames add a polished, finished look and make hanging even easier.'
    },
    {
      category: 'products',
      question: 'What mounting options are available?',
      answer: 'We offer three mounting options: Stick Tape (free - includes adhesive backing), Float Mount ($4 - creates a floating effect off the wall), and 3D Magnet Mount ($25 - premium magnetic mounting system for easy repositioning).'
    },
    {
      category: 'ordering',
      question: 'How do I place an order?',
      answer: 'Ordering is easy! Just follow our 4-step configurator: 1) Upload your image or choose from our stock photos, 2) Select your size and finish, 3) Add frame and mounting options, 4) Preview and checkout. Our system is available 24/7 for your convenience.'
    },
    {
      category: 'ordering',
      question: 'What image formats do you accept?',
      answer: 'We accept JPG, JPEG, PNG, and WebP formats. For best results, use high-resolution images (at least 1920x1080 pixels). Our configurator includes an image editor so you can crop, adjust, and position your photo perfectly before ordering.'
    },
    {
      category: 'ordering',
      question: 'Can I use my own photos?',
      answer: 'Absolutely! You can upload any personal photos from your device. We also offer a curated collection of professional stock photos if you\'re looking for inspiration or don\'t have your own image ready.'
    },
    {
      category: 'ordering',
      question: 'Do you offer gift options?',
      answer: 'Yes! During checkout, you can add gift wrapping and include a personalized message. Metal prints make excellent gifts for weddings, anniversaries, housewarmings, and holidays. We can ship directly to the recipient if needed.'
    },
    {
      category: 'shipping',
      question: 'How long does production and shipping take?',
      answer: 'Standard production takes 3-5 business days. Shipping varies by location: typically 3-5 business days for standard shipping. Rush production (1-2 business days) is available for an additional fee. You\'ll receive tracking information via email once your order ships.'
    },
    {
      category: 'shipping',
      question: 'Do you ship nationwide?',
      answer: 'Yes! While we\'re based in Kennesaw, Georgia, we ship to all 50 states. We use premium packaging to ensure your metal print arrives in perfect condition, regardless of distance.'
    },
    {
      category: 'shipping',
      question: 'What is your shipping policy?',
      answer: 'We offer FREE shipping on all orders over $100. For orders under $100, standard shipping rates apply based on size and destination. All shipments include tracking and insurance for your peace of mind.'
    },
    {
      category: 'shipping',
      question: 'How are metal prints packaged?',
      answer: 'We take special care in packaging. Each metal print is wrapped in protective foam, placed in a rigid box with corner protectors, and sealed for transit. Large prints receive additional reinforcement. Your print will arrive ready to display.'
    },
    {
      category: 'pricing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) processed securely through Stripe. All transactions are encrypted and PCI-compliant for your security.'
    },
    {
      category: 'pricing',
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees! The price you see in your cart is the price you pay. Shipping is calculated at checkout based on your location. Sales tax may apply depending on your state.'
    },
    {
      category: 'pricing',
      question: 'Do you offer discounts for bulk orders?',
      answer: 'Yes! For orders of 10+ prints, please contact us at info@bespokemetalprints.com for custom bulk pricing. We work with photographers, businesses, and event planners regularly.'
    },
    {
      category: 'technical',
      question: 'How durable are metal prints?',
      answer: 'Extremely durable! Metal prints are waterproof, scratch-resistant, and UV-resistant. They won\'t fade for 75+ years and can withstand environmental factors that would damage paper or canvas prints. They\'re safe for bathrooms, kitchens, and even covered outdoor spaces.'
    },
    {
      category: 'technical',
      question: 'How do I clean my metal print?',
      answer: 'Cleaning is simple! Just wipe with a soft, damp cloth. For stubborn marks, use a gentle glass cleaner. Avoid abrasive materials. The durable surface means your print will look new for decades with minimal care.'
    },
    {
      category: 'technical',
      question: 'How do I hang my metal print?',
      answer: 'All metal prints include mounting hardware on the back. For Stick Tape mounting, simply peel and stick. Float mounts include hidden hangers. 3D Magnet mounts make repositioning easy. We include detailed hanging instructions with every order.'
    },
    {
      category: 'technical',
      question: 'What is the color accuracy like?',
      answer: 'Our ChromaLuxe process provides exceptional color accuracy and vibrancy. Colors often appear more vivid than the original photo due to the reflective properties of aluminum. We use professional color calibration to ensure your print matches your expectations.'
    },
    {
      category: 'technical',
      question: 'Can I see a preview before ordering?',
      answer: 'Yes! Our configurator includes a real-time preview showing exactly how your print will look with your chosen size, finish, and frame. You can adjust cropping and positioning until it\'s perfect.'
    },
    {
      category: 'technical',
      question: 'What if my image quality is too low?',
      answer: 'Our configurator will warn you if your image resolution is too low for the selected size. We recommend using high-resolution images for best results. If you\'re unsure, our support team can review your image before printing.'
    },
    {
      category: 'ordering',
      question: 'What is your refund policy?',
      answer: 'We offer a 30-day satisfaction guarantee. If you\'re not completely satisfied with your metal print, contact us for a full refund or replacement. Please review our full Refund & Cancellation Policy for details on custom orders.'
    },
    {
      category: 'ordering',
      question: 'Can I cancel or modify my order?',
      answer: 'Orders can be cancelled or modified within 2 hours of placement, before production begins. After production starts, cancellations may incur a 25% restocking fee. Contact us immediately at info@bespokemetalprints.com if you need to make changes.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'products', name: 'Products & Materials', icon: Package },
    { id: 'ordering', name: 'Ordering & Customization', icon: Image },
    { id: 'shipping', name: 'Shipping & Delivery', icon: Truck },
    { id: 'pricing', name: 'Pricing & Payments', icon: CreditCard },
    { id: 'technical', name: 'Technical & Care', icon: Ruler },
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 dark:text-white">Frequently Asked Questions</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Everything you need to know about our ChromaLuxe metal prints
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
              aria-label="Return to Home"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                Return to Home
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-[#ff6b35] flex-shrink-0" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No questions found matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-[#ff6b35] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-br from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl text-gray-900 dark:text-white mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our team is here to help! We typically respond within 24 hours.
          </p>
          <a
            href="mailto:info@bespokemetalprints.com"
            className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#ff5722] text-white px-6 py-3 rounded-full transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          })
        }}
      />
    </motion.div>
  );
}