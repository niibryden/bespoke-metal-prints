import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Droplets, AlertCircle, CheckCircle, Shield, Sun, Wind } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface CareInstructionsPageProps {
  onClose: () => void;
}

export function CareInstructionsPage({ onClose }: CareInstructionsPageProps) {
  const dos = [
    {
      icon: Droplets,
      title: 'Clean with Damp Cloth',
      description: 'Use a soft, lint-free microfiber cloth dampened with water to wipe your print clean.'
    },
    {
      icon: Sparkles,
      title: 'Use Glass Cleaner',
      description: 'For stubborn marks, spray glass cleaner on cloth (not directly on print) and gently wipe.'
    },
    {
      icon: Shield,
      title: 'Handle with Care',
      description: 'Hold prints by the edges when moving to avoid fingerprints on the surface.'
    },
    {
      icon: Sun,
      title: 'Display Anywhere',
      description: 'Safe for direct sunlight, bathrooms, kitchens – ChromaLuxe won\'t fade or warp.'
    }
  ];

  const donts = [
    {
      icon: AlertCircle,
      title: 'No Abrasive Materials',
      description: 'Never use paper towels, rough sponges, or abrasive cleaners that can scratch the surface.'
    },
    {
      icon: AlertCircle,
      title: 'No Harsh Chemicals',
      description: 'Avoid bleach, ammonia-based cleaners, or acetone. Stick to water or gentle glass cleaner.'
    },
    {
      icon: AlertCircle,
      title: 'Don\'t Spray Directly',
      description: 'Never spray liquid directly onto your print. Always spray on cloth first to prevent seepage.'
    },
    {
      icon: AlertCircle,
      title: 'Avoid Extreme Pressure',
      description: 'While durable, don\'t press hard or use sharp objects that could dent the aluminum.'
    }
  ];

  const tips = [
    {
      title: 'Daily Dusting',
      description: 'A quick pass with a dry microfiber cloth is all you need for regular maintenance.',
      frequency: 'As needed'
    },
    {
      title: 'Deep Cleaning',
      description: 'For fingerprints or smudges, use a damp cloth or glass cleaner once every few months.',
      frequency: 'Every 3-6 months'
    },
    {
      title: 'Bathroom Prints',
      description: 'Prints in humid environments may need more frequent cleaning due to water spots.',
      frequency: 'Monthly'
    }
  ];

  const environments = [
    {
      icon: Sun,
      name: 'Direct Sunlight',
      safe: true,
      note: 'UV-resistant coating protects against fading'
    },
    {
      icon: Droplets,
      name: 'Bathrooms',
      safe: true,
      note: '100% waterproof, perfect for humid spaces'
    },
    {
      icon: Wind,
      name: 'Kitchens',
      safe: true,
      note: 'Easy to clean grease and cooking residue'
    },
    {
      icon: Shield,
      name: 'High-Traffic Areas',
      safe: true,
      note: 'Scratch-resistant surface handles daily wear'
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
          <div className="flex items-center gap-4">
            <ReturnToHomeButton onClick={onClose} />
            <div>
              <h1 className="text-gray-900 dark:text-white">Care & Maintenance</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Keep your metal prints looking pristine for 75+ years
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close care instructions"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#ff6b35]/10 text-[#ff6b35] px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span>Minimal Maintenance Required</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">
            Caring for Your <span className="text-[#ff6b35]">ChromaLuxe Print</span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            One of the best things about ChromaLuxe metal prints is how easy they are to maintain. 
            Unlike canvas or paper prints that require special care, your metal print needs only basic cleaning 
            to stay looking brand new for generations.
          </p>
        </motion.div>

        {/* Do's */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            ✅ Best Practices
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {dos.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Don'ts */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            ⚠️ Things to Avoid
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {donts.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/10 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Cleaning Schedule */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            Maintenance Schedule
          </h2>
          <div className="space-y-4">
            {tips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex items-start gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg text-gray-900 dark:text-white">
                      {tip.title}
                    </h3>
                    <span className="text-sm text-[#ff6b35] font-semibold bg-[#ff6b35]/10 px-3 py-1 rounded-full">
                      {tip.frequency}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Safe Environments */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            Display Anywhere with Confidence
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {environments.map((env, index) => {
              const Icon = env.icon;
              return (
                <motion.div
                  key={env.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-gradient-to-br from-[#ff6b35]/5 to-orange-100/10 dark:from-[#ff6b35]/10 dark:to-orange-900/5 rounded-2xl p-6 border border-[#ff6b35]/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b35] to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg text-gray-900 dark:text-white">
                          {env.name}
                        </h3>
                        {env.safe && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {env.note}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Cleaning Guide */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 rounded-2xl p-8 md:p-10 mb-16 border border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-6 text-center">
            Step-by-Step Cleaning Guide
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white mb-1">Prepare Your Materials</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get a soft microfiber cloth and water (or glass cleaner for tougher marks).
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white mb-1">Dampen the Cloth</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lightly dampen your cloth with water or spray glass cleaner onto the cloth (never directly on print).
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white mb-1">Wipe Gently</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Using gentle circular motions, wipe the surface of your print. No need to press hard.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white mb-1">Dry if Needed</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use a dry section of the cloth to buff away any remaining moisture or streaks.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                5
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white mb-1">Admire Your Print!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step back and enjoy your pristine, vibrant metal print. That's it!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-6 text-center">
            Common Care Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                Can I use Windex or other glass cleaners?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! Standard glass cleaners like Windex work great. Just spray on cloth first, never directly on the print.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                Will my print fade if displayed in direct sunlight?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No! ChromaLuxe prints are UV-resistant and won't fade for 75+ years, even in direct sunlight.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                Can I hang my print in the bathroom?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Absolutely! Metal prints are 100% waterproof and perfect for humid environments like bathrooms and kitchens.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                What if I scratch the surface?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                ChromaLuxe is scratch-resistant, but not scratch-proof. Minor surface scratches usually don't affect the image. 
                For significant damage, contact our support team for replacement options.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">
            Ready to Order Your Low-Maintenance Print?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enjoy stunning art without the hassle of special care
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#ff5722] text-white px-8 py-4 rounded-full transition-all shadow-lg shadow-[#ff6b35]/20 transform hover:scale-105"
          >
            <span>Create Your Print</span>
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
            '@type': 'HowTo',
            name: 'How to Clean and Care for Metal Prints',
            description: 'Complete guide to cleaning and maintaining ChromaLuxe metal prints for long-lasting vibrancy',
            step: [
              {
                '@type': 'HowToStep',
                text: 'Prepare a soft microfiber cloth and water or glass cleaner'
              },
              {
                '@type': 'HowToStep',
                text: 'Dampen cloth with water or spray cleaner on cloth'
              },
              {
                '@type': 'HowToStep',
                text: 'Gently wipe the print surface in circular motions'
              },
              {
                '@type': 'HowToStep',
                text: 'Dry with a clean section of cloth to remove streaks'
              }
            ]
          })
        }}
      />
    </motion.div>
  );
}