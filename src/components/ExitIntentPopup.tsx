import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles } from 'lucide-react';

interface ExitIntentPopupProps {
  onClose: () => void;
  onApplyDiscount: (code: string) => void;
}

export function ExitIntentPopup({ onClose, onApplyDiscount }: ExitIntentPopupProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleApplyDiscount = () => {
    onApplyDiscount('WELCOME10');
    handleClose();
  };

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Gradient background decoration */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] opacity-10" />

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Icon */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>

              {/* Headline */}
              <motion.h2
                className="text-3xl font-bold mb-3 text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Wait! Don't Leave Empty-Handed
              </motion.h2>

              {/* Subheadline */}
              <motion.p
                className="text-lg text-gray-600 dark:text-gray-400 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Get <span className="text-[#ff6b35] font-bold">10% OFF</span> your first order!
              </motion.p>

              {/* Discount code box */}
              <motion.div
                className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8c42]/10 border-2 border-dashed border-[#ff6b35] rounded-xl p-6 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Your Exclusive Code
                  </p>
                  <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                </div>
                <div className="text-4xl font-bold text-[#ff6b35] tracking-wider font-mono">
                  WELCOME10
                </div>
              </motion.div>

              {/* Benefits */}
              <motion.div
                className="text-left space-y-2 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm">Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm">100% satisfaction guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm">Premium museum-quality prints</span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  onClick={handleApplyDiscount}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#ff6b35]/30 transition-all transform hover:scale-105"
                >
                  Claim My 10% Discount
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  No thanks, I'll pay full price
                </button>
              </motion.div>

              {/* Small print */}
              <motion.p
                className="mt-6 text-xs text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Code automatically applied at checkout. One-time use per customer.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to detect exit intent
export function useExitIntent(callback: () => void, options: { enabled: boolean; delay?: number } = { enabled: true, delay: 0 }) {
  useEffect(() => {
    if (!options.enabled) return;

    let hasShown = false;
    const delay = options.delay || 0;
    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from the top of the viewport
      if (e.clientY <= 0 && !hasShown) {
        hasShown = true;
        timeoutId = setTimeout(() => {
          callback();
        }, delay);
      }
    };

    // Add a small delay before activating to avoid triggering immediately
    const activateTimeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000); // Don't show for first 3 seconds

    return () => {
      clearTimeout(activateTimeout);
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [callback, options.enabled, options.delay]);
}
