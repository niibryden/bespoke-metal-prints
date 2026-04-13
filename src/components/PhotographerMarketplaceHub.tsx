import React from 'react';
import { motion } from 'motion/react';
import { X, Camera, TrendingUp, DollarSign, Users, LogIn, UserPlus } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface PhotographerMarketplaceHubProps {
  onClose: () => void;
  onSignupClick: () => void;
  onLoginClick: () => void;
}

export function PhotographerMarketplaceHub({ onClose, onSignupClick, onLoginClick }: PhotographerMarketplaceHubProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white dark:bg-black overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-[#ff6b35]/20 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-[#ff6b35]" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Photographer Marketplace
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-[#ff6b35] hover:text-black transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-[#ff6b35]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Turn Your Photography Into Income
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our marketplace and earn 25% royalties on every print sold. We handle printing, shipping, and customer service.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: DollarSign,
              title: 'Earn 25% Royalties',
              description: 'Receive 25% commission on every print sold with no upfront costs.',
            },
            {
              icon: Users,
              title: 'Reach More Customers',
              description: 'Your photos appear in our marketplace, reaching thousands of buyers.',
            },
            {
              icon: TrendingUp,
              title: 'Premium Quality',
              description: 'We print on ChromaLuxe aluminum - the highest quality available.',
            },
          ].map((benefit) => (
            <motion.div
              key={benefit.title}
              className="bg-gradient-to-br from-[#ff6b35]/10 to-[#ff8c42]/10 dark:from-[#ff6b35]/5 dark:to-[#ff8c42]/5 rounded-xl p-6 border border-[#ff6b35]/20"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#ff6b35] flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action - Two Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* New Photographers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border-2 border-[#ff6b35] shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-8 h-8 text-[#ff6b35]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              New Photographer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Start selling your photography through our platform. Apply now and get approved within 24 hours.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Quick application process</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Upload unlimited photos</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Track sales & earnings</span>
              </li>
            </ul>
            <motion.button
              onClick={onSignupClick}
              className="w-full px-8 py-4 bg-[#ff6b35] text-white rounded-xl hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/30 font-semibold text-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="w-5 h-5" />
              Sign Up Now
            </motion.button>
          </motion.div>

          {/* Existing Photographers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-gray-200 dark:border-[#2a2a2a] shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              Existing Photographer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Already registered? Access your dashboard to upload photos, track sales, and manage your earnings.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Upload new photos</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>View real-time sales</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Export earnings reports</span>
              </li>
            </ul>
            <motion.button
              onClick={onLoginClick}
              className="w-full px-8 py-4 bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] transition-all font-semibold text-lg flex items-center justify-center gap-2 border border-gray-300 dark:border-[#3a3a3a]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="w-5 h-5" />
              Log In
            </motion.button>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Apply & Get Approved', description: 'Submit your application and get approved within 24 hours' },
              { step: '2', title: 'Upload Your Photos', description: 'Add high-quality images to our marketplace catalog' },
              { step: '3', title: 'Earn Royalties', description: 'Get paid 25% for every print sold automatically' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff6b35] text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PhotographerMarketplaceHub;