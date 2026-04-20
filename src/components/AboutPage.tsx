import React from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Heart, Award, Users, Clock, Shield, Sparkles } from 'lucide-react';

interface AboutPageProps {
  onClose: () => void;
}

export function AboutPage({ onClose }: AboutPageProps) {
  const values = [
    {
      icon: Heart,
      title: 'Quality First',
      description: 'We use only premium ChromaLuxe aluminum and professional-grade printing technology to ensure every print exceeds expectations.'
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'Your satisfaction is our priority. We offer 24/7 online ordering, responsive support, and a 30-day satisfaction guarantee on every order.'
    },
    {
      icon: Award,
      title: 'Craftsmanship',
      description: 'Each metal print is carefully produced, inspected, and packaged by hand to ensure it arrives in perfect condition, ready to display.'
    },
    {
      icon: Shield,
      title: 'Reliability',
      description: 'With 75+ year fade resistance and waterproof durability, our metal prints are built to preserve your memories for generations.'
    }
  ];

  const stats = [
    { value: '1,000+', label: 'Happy Customers' },
    { value: '2,000+', label: 'Prints Delivered' },
    { value: '4.9/5', label: 'Average Rating' },
    { value: '24/7', label: 'Online Availability' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 dark:text-white">About Bespoke Metal Prints</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Preserving memories with premium metal art from Kennesaw, GA
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
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#ff6b35]/10 text-[#ff6b35] px-4 py-2 rounded-full mb-6">
            <MapPin className="w-5 h-5" />
            <span>Based in Kennesaw, Georgia</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">
            Your Memories Deserve the <span className="text-[#ff6b35]">Best</span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            At Bespoke Metal Prints, we believe your most cherished moments deserve to be displayed beautifully. 
            That's why we specialize in premium ChromaLuxe metal prints – a modern, durable, and stunning way to 
            transform your photos into works of art that will last a lifetime.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-gradient-to-br from-[#ff6b35]/5 to-orange-100/10 dark:from-[#ff6b35]/10 dark:to-orange-900/5 rounded-2xl border border-[#ff6b35]/20"
            >
              <div className="text-3xl md:text-4xl text-[#ff6b35] mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Our Story */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 text-center">
            Our Story
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Founded in Kennesaw, Georgia, Bespoke Metal Prints was born from a simple idea: photos are more than 
              just images – they're memories, stories, and emotions captured in time. We wanted to create a way for 
              people to display these precious moments in a format that's as extraordinary as the memories themselves.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              After extensive research into printing technologies, we discovered ChromaLuxe metal prints – a process 
              that infuses images directly into aluminum using dye-sublimation. The results were stunning: vibrant 
              colors, incredible depth, and a modern aesthetic that traditional prints simply couldn't match.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Today, we're proud to serve customers across the United States with our 24/7 online ordering system, 
              offering premium quality metal prints that preserve memories for 75+ years. Every print we create is 
              handled with care and crafted with pride, right here in Georgia.
            </p>
          </div>
        </motion.section>

        {/* Our Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#ff6b35]/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#ff6b35]" />
                  </div>
                  <h3 className="text-xl text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Why ChromaLuxe */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            Why ChromaLuxe Metal Prints?
          </h2>
          <div className="bg-gradient-to-br from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10 rounded-2xl p-8 md:p-10">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">💎</div>
                <h4 className="text-lg text-gray-900 dark:text-white mb-2">
                  Unmatched Vibrancy
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The aluminum surface creates depth and luminosity that makes colors pop like never before
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🛡️</div>
                <h4 className="text-lg text-gray-900 dark:text-white mb-2">
                  Built to Last
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Waterproof, scratch-resistant, and fade-resistant for 75+ years – perfect for any environment
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">✨</div>
                <h4 className="text-lg text-gray-900 dark:text-white mb-2">
                  Modern Elegance
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sleek, frameless design that complements any decor style from contemporary to classic
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Local & National */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-12 text-center border border-gray-700/50">
            <div className="inline-flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-full mb-6">
              <Clock className="w-5 h-5" />
              <span>Local Business, Global Service</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-white mb-6">
              Proudly Serving from Kennesaw, Georgia
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
              While we're locally based in Kennesaw, our mission is nationwide. We combine the personal touch 
              of a local business with the convenience of 24/7 online ordering and shipping to all 50 states. 
              Whether you're down the street or across the country, you'll receive the same quality, care, and attention to detail.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#ff6b35]" />
                <span>Kennesaw, GA</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#ff6b35]" />
                <span>24/7 Online</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-4">
            Ready to Create Your Metal Print?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their favorite photos into stunning metal art. 
            Get started in minutes with our easy 4-step configurator.
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#ff5722] text-white px-8 py-4 rounded-full transition-all shadow-lg shadow-[#ff6b35]/20 transform hover:scale-105"
          >
            <span>Start Designing Now</span>
            <Sparkles className="w-5 h-5" />
          </button>
        </motion.section>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            mainEntity: {
              '@type': 'LocalBusiness',
              name: 'Bespoke Metal Prints',
              description: 'Premium ChromaLuxe metal print services based in Kennesaw, Georgia. We create stunning, durable aluminum prints that preserve your memories for 75+ years.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Kennesaw',
                addressRegion: 'GA',
                addressCountry: 'US'
              },
              areaServed: 'United States',
              availableLanguage: 'English',
              priceRange: '$$',
              foundingLocation: 'Kennesaw, Georgia'
            }
          })
        }}
      />
    </motion.div>
  );
}