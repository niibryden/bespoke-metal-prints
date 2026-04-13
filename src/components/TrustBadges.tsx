import { Shield, Lock, CreditCard, Award, Truck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface TrustBadgesProps {
  variant?: 'default' | 'compact' | 'checkout';
  className?: string;
}

export function TrustBadges({ variant = 'default', className = '' }: TrustBadgesProps) {
  if (variant === 'checkout') {
    return (
      <div className={`bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {/* SSL Encrypted */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Lock className="w-5 h-5 text-green-500" />
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                SSL Encrypted
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Secure Checkout
              </div>
            </div>
          </motion.div>

          {/* Stripe Verified */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Shield className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Verified by Stripe
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                PCI Compliant
              </div>
            </div>
          </motion.div>

          {/* Satisfaction Guarantee */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Award className="w-5 h-5 text-[#ff6b35]" />
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                100% Guaranteed
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Money Back Promise
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-4 md:gap-6 ${className}`}>
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
          <Lock className="w-4 h-4 text-green-500" />
          <span className="hidden sm:inline">SSL Secure</span>
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
          <Shield className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:inline">Stripe Verified</span>
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
          <CheckCircle2 className="w-4 h-4 text-[#ff6b35]" />
          <span className="hidden sm:inline">Guaranteed</span>
        </div>
      </div>
    );
  }

  // Default variant - full badges with descriptions
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {/* Secure Checkout */}
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20 shadow-sm hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Secure Checkout
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              256-bit SSL encryption protects your payment information
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stripe Verified */}
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20 shadow-sm hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Verified by Stripe
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              PCI-DSS compliant payment processing you can trust
            </p>
          </div>
        </div>
      </motion.div>

      {/* Money Back Guarantee */}
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20 shadow-sm hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Award className="w-6 h-6 text-[#ff6b35]" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              100% Satisfaction
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Not happy? Get a full refund within 30 days
            </p>
          </div>
        </div>
      </motion.div>

      {/* Fast Shipping */}
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20 shadow-sm hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Free Shipping
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fast, tracked delivery to your door at no extra cost
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quality Guarantee */}
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20 shadow-sm hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Premium Quality
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Museum-grade metal prints crafted with precision
            </p>
          </div>
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20 shadow-sm hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Flexible Payment
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cards, Apple Pay, Google Pay - pay your way
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
