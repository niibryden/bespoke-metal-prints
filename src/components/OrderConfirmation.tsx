import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Package, Mail, Calendar, Download, Sparkles, Gift, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OrderConfirmationProps {
  orderId: string;
  email: string;
  onClose: () => void;
  discount?: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
  } | null;
}

export function OrderConfirmation({ orderId, email, onClose, discount }: OrderConfirmationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const [countdown, setCountdown] = useState(7); // Changed from 3 to 7 seconds

  // Scroll to top and generate confetti when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Generate confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setConfetti(pieces);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-white via-white to-[#ff6b35]/5 dark:from-[#0a0a0a] dark:via-[#0a0a0a] dark:to-[#ff6b35]/5 z-[9999] flex flex-col overflow-y-auto"
    >
      {/* Confetti Animation */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            backgroundColor: ['#ff6b35', '#ffd700', '#00c853', '#2196f3'][Math.floor(Math.random() * 4)],
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, 360],
            opacity: [1, 0],
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Header */}
      <div className="relative py-6 px-4 sm:px-6 border-b border-[#ff6b35]/20 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#ff6b35] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl">
            <span className="text-[#ff6b35]">BESPOKE</span>
            <br />
            <span className="text-black dark:text-white text-sm sm:text-base">METAL PRINTS</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon with Animation */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <motion.div
              className="relative inline-block"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 15, 0]
                }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <PartyPopper className="w-8 h-8 text-[#ff6b35]" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-[#ff6b35]" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-black dark:text-white">
                Order Confirmed!
              </h2>
              <Sparkles className="w-6 h-6 text-[#ff6b35]" />
            </div>
            <motion.p
              className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Thank you for your order! We're excited to create your beautiful metal print.
            </motion.p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            className="mb-12 bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-[#2a2a2a]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {/* Shipping */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <span className="text-green-600 dark:text-green-400 font-medium text-sm sm:text-base">Shipping</span>
              </motion.div>

              {/* Connector */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8 }}
                className="h-1 w-8 sm:w-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
              />

              {/* Payment */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <span className="text-green-600 dark:text-green-400 font-medium text-sm sm:text-base">Payment</span>
              </motion.div>

              {/* Connector */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1 }}
                className="h-1 w-8 sm:w-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
              />

              {/* Confirmation */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.3, type: 'spring' }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <span className="text-green-600 dark:text-green-400 font-medium text-sm sm:text-base">Confirmed</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-[#2a2a2a] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#ff6b35]" />
              Order Details
            </h3>
            
            <div className="space-y-4">
              {/* Order ID */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-[#ff6b35]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Number</p>
                    <p className="font-mono text-lg font-semibold text-black dark:text-white">{orderId}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#ff6b35]/10 text-[#ff6b35] rounded-lg hover:bg-[#ff6b35]/20 transition-colors text-sm font-medium">
                  Copy
                </button>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Confirmation Email Sent To</p>
                  <p className="font-medium text-black dark:text-white">{email}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Delivery</p>
                  <p className="font-medium text-black dark:text-white">5-7 Business Days</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You'll receive tracking information once shipped</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Christmas Promo */}
          {discount && (
            <motion.div
              className="bg-gradient-to-r from-red-500/10 via-green-500/10 to-red-500/10 dark:from-red-500/5 dark:via-green-500/5 dark:to-red-500/5 rounded-2xl p-6 border border-red-500/20 dark:border-red-500/10 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-6 h-6 text-red-500" />
                <h4 className="text-lg font-semibold text-black dark:text-white">
                  Discount Applied!
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You saved <span className="font-semibold text-green-500">${discount.discountAmount.toFixed(2)}</span> on this order with code <span className="font-mono font-semibold text-[#ff6b35]">{discount.code}</span>
                {discount.type === 'percentage' && ` (${discount.value}% off)`}
              </p>
            </motion.div>
          )}

          {/* What's Next */}
          <motion.div
            className="bg-gradient-to-br from-[#ff6b35]/5 to-[#ff6b35]/10 rounded-2xl p-6 sm:p-8 border border-[#ff6b35]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <h3 className="text-xl font-semibold text-black dark:text-white mb-6">What Happens Next?</h3>
            
            <div className="space-y-4">
              {[
                { step: 1, title: 'Order Processing', desc: 'We\'ll begin preparing your metal print', icon: '📋' },
                { step: 2, title: 'Quality Check', desc: 'Each print goes through rigorous quality control', icon: '✨' },
                { step: 3, title: 'Shipping', desc: 'Your order will be carefully packaged and shipped', icon: '📦' },
                { step: 4, title: 'Delivery', desc: 'Receive your beautiful metal print!', icon: '🎉' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  className="flex items-start gap-4 p-4 bg-white dark:bg-[#1a1a1a] rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                >
                  <div className="w-10 h-10 bg-[#ff6b35] text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-black dark:text-white mb-1 flex items-center gap-2">
                      <span>{item.icon}</span>
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.button
              onClick={onClose}
              className="px-8 py-4 bg-[#ff6b35] text-white font-semibold rounded-xl hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/30 inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue Shopping
              <Sparkles className="w-5 h-5" />
            </motion.button>
            
            {/* Reset Notice */}
            <motion.p
              className="mt-4 text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              The configurator will reset automatically in {countdown} seconds...
            </motion.p>
            
            {/* Countdown Progress Bar */}
            <motion.div
              className="mt-4 max-w-xs mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <div className="h-2 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8555]"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 7, ease: 'linear' }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}