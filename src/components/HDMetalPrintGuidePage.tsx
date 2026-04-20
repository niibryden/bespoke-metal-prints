import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Shield, Droplets, Sun, Zap, Award, CheckCircle, ArrowRight } from 'lucide-react';

interface HDMetalPrintGuidePageProps {
  onClose: () => void;
}

export function HDMetalPrintGuidePage({ onClose }: HDMetalPrintGuidePageProps) {
  const benefits = [
    {
      icon: Shield,
      title: '75+ Year Lifespan',
      description: 'Fade-resistant for generations. Unlike paper or canvas prints that fade in 5-10 years, HD Metal Prints maintain their vibrancy for 75+ years.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Droplets,
      title: '100% Waterproof',
      description: 'Safe for any environment including bathrooms, kitchens, and even covered outdoor spaces. Clean with a damp cloth.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Scratch Resistant',
      description: 'Durable aluminum surface resists scratches, dents, and damage. Perfect for high-traffic areas and commercial spaces.',
      color: 'from-gray-500 to-gray-700'
    },
    {
      icon: Sun,
      title: 'UV Resistant',
      description: 'Direct sunlight won\'t fade your print. The dye-sublimation process infuses color into the aluminum, not on top of it.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Sparkles,
      title: 'Exceptional Vibrancy',
      description: 'Colors are more vibrant than any other medium. The aluminum surface creates depth and luminosity that makes images pop.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Lightweight & Modern',
      description: 'Easier to hang than framed glass. Sleek, frameless design complements any decor style from contemporary to classic.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const process = [
    {
      step: 1,
      title: 'Image Preparation',
      description: 'Your high-resolution photo is color-corrected and optimized for metal printing to ensure perfect results.'
    },
    {
      step: 2,
      title: 'Dye Sublimation',
      description: 'Special dyes are heated to 400°F, turning from solid directly to gas without becoming liquid (sublimation).'
    },
    {
      step: 3,
      title: 'Infusion Process',
      description: 'The gaseous dyes penetrate the specially-coated aluminum surface, becoming part of the metal itself.'
    },
    {
      step: 4,
      title: 'Permanent Bond',
      description: 'As the aluminum cools, the dyes solidify within the coating, creating a permanent, fade-proof image.'
    },
    {
      step: 5,
      title: 'Quality Control',
      description: 'Each print is inspected for color accuracy, clarity, and finish quality before being packaged for shipping.'
    }
  ];

  const comparisons = [
    {
      feature: 'Lifespan',
      hdMetalPrint: '75+ years',
      canvas: '5-10 years',
      paper: '3-5 years'
    },
    {
      feature: 'Waterproof',
      hdMetalPrint: 'Yes ✓',
      canvas: 'No ✗',
      paper: 'No ✗'
    },
    {
      feature: 'UV Resistant',
      hdMetalPrint: 'Yes ✓',
      canvas: 'Limited',
      paper: 'No ✗'
    },
    {
      feature: 'Scratch Resistant',
      hdMetalPrint: 'Yes ✓',
      canvas: 'No ✗',
      paper: 'No ✗'
    },
    {
      feature: 'Color Vibrancy',
      hdMetalPrint: 'Exceptional',
      canvas: 'Good',
      paper: 'Fair'
    },
    {
      feature: 'Maintenance',
      hdMetalPrint: 'Wipe clean',
      canvas: 'Dust only',
      paper: 'Dust only'
    }
  ];

  const finishes = [
    {
      name: 'Gloss Finish',
      description: 'High-contrast, vibrant colors with a reflective surface',
      bestFor: ['Bold images', 'Modern spaces', 'High color saturation', 'Contemporary art'],
      image: '✨'
    },
    {
      name: 'Matte Finish',
      description: 'Soft, elegant look with no glare',
      bestFor: ['Professional displays', 'Bright lighting', 'Portraits', 'Gallery settings'],
      image: '🎨'
    }
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
            <h1 className="text-gray-900 dark:text-white">What are HD Metal Prints?</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Understanding the science behind premium metal prints
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close HD Metal Print guide"
          >
            <X className="w-6 h-6" />
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
            <Award className="w-5 h-5" />
            <span>Industry-Leading Technology</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">
            The Gold Standard in <span className="text-[#ff6b35]">Metal Printing</span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            HD Metal Prints are premium aluminum photo panels, trusted by professional photographers, 
            galleries, and museums worldwide. Using advanced dye-sublimation technology, HD Metal Prints create prints 
            that are more vibrant, durable, and long-lasting than any other printing method.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            Why HD Metal Prints?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#ff6b35]/50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* The Process */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            The Dye-Sublimation Process
          </h2>
          <div className="space-y-4">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex gap-4 items-start bg-gradient-to-r from-[#ff6b35]/5 to-transparent dark:from-[#ff6b35]/10 rounded-2xl p-6 border-l-4 border-[#ff6b35]"
              >
                <div className="w-12 h-12 rounded-full bg-[#ff6b35] text-white flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{step.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < process.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-3" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            HD Metal Prints vs Traditional Prints
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10">
                    <th className="text-left py-4 px-6 text-gray-900 dark:text-white">Feature</th>
                    <th className="text-center py-4 px-6 text-[#ff6b35]">HD Metal Print</th>
                    <th className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">Canvas</th>
                    <th className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">Paper</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comp, index) => (
                    <tr
                      key={comp.feature}
                      className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                    >
                      <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">
                        {comp.feature}
                      </td>
                      <td className="text-center py-4 px-6 text-[#ff6b35] font-semibold">
                        {comp.hdMetalPrint}
                      </td>
                      <td className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">
                        {comp.canvas}
                      </td>
                      <td className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">
                        {comp.paper}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Finish Options */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            Choose Your Finish
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {finishes.map((finish, index) => (
              <motion.div
                key={finish.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-[#ff6b35]/50 transition-colors"
              >
                <div className="text-5xl mb-4 text-center">{finish.image}</div>
                <h3 className="text-2xl text-gray-900 dark:text-white mb-3 text-center">
                  {finish.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  {finish.description}
                </p>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-3 text-center">
                    BEST FOR:
                  </p>
                  <ul className="space-y-2">
                    {finish.bestFor.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-[#ff6b35] flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Care Instructions Preview */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 rounded-2xl p-8 mb-16 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl text-gray-900 dark:text-white mb-3">
                Easy Care & Maintenance
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                HD Metal Prints require minimal maintenance. Simply wipe with a soft, damp cloth to clean. 
                For stubborn marks, use a gentle glass cleaner. No special care needed – your print will look 
                brand new for decades.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Wipe with damp cloth</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Use glass cleaner</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No fading over time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">
            Experience HD Metal Print Quality
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've discovered the beauty and durability of HD Metal Prints. 
            Try our 5"×7" sample size for just $25 (10% off with code WELCOME10).
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#ff5722] text-white px-8 py-4 rounded-full transition-all shadow-lg shadow-[#ff6b35]/20 transform hover:scale-105"
          >
            <span>Start Your Print</span>
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'What are HD Metal Prints? Understanding Metal Print Technology',
            description: 'Complete guide to HD Metal Prints: the dye-sublimation process, benefits, durability, and why HD Metal Prints are the gold standard in metal printing.',
            author: {
              '@type': 'Organization',
              name: 'Bespoke Metal Prints'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Bespoke Metal Prints',
              logo: {
                '@type': 'ImageObject',
                url: 'https://bespokemetalprints.com/logo.png'
              }
            },
            keywords: 'HD Metal Print, metal prints, dye sublimation, aluminum prints, photo printing technology',
            articleBody: 'HD Metal Prints are premium aluminum photo panels using dye-sublimation technology to create prints that last 75+ years...'
          })
        }}
      />
    </motion.div>
  );
}