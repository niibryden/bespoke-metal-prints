import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Gift, Star } from 'lucide-react';

interface ExitIntentEmailCaptureProps {
  onEmailCaptured?: (email: string) => void;
}

export function ExitIntentEmailCapture({ onEmailCaptured }: ExitIntentEmailCaptureProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has already seen this popup
    const hasSeenPopup = localStorage.getItem('exit-intent-shown');
    if (hasSeenPopup) {
      setHasShown(true);
      return;
    }

    let exitIntentTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from the top of the viewport
      if (e.clientY <= 0 && !exitIntentTriggered && !hasShown) {
        exitIntentTriggered = true;
        setShowPopup(true);
        setHasShown(true);
        localStorage.setItem('exit-intent-shown', 'true');
      }
    };

    // Wait a few seconds before activating exit intent
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubmitted(true);
      onEmailCaptured?.(email);
      
      // Close popup after 2 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 2000);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101]"
          >
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-8 mx-4 border-2 border-[#ff6b35]">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {!submitted ? (
                <>
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-white" />
                  </div>

                  {/* Heading */}
                  <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                    Wait! Don't Leave Empty-Handed
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    Get <span className="text-[#ff6b35] font-bold">10% OFF</span> your first order + exclusive offers
                  </p>

                  {/* Benefits */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Star className="w-4 h-4 text-[#ff6b35]" />
                      <span>Exclusive discount codes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Star className="w-4 h-4 text-[#ff6b35]" />
                      <span>Early access to new products</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Star className="w-4 h-4 text-[#ff6b35]" />
                      <span>Design tips & inspiration</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-gray-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-lg hover:shadow-xl hover:shadow-[#ff6b35]/30 transition-all font-semibold"
                    >
                      Get My 10% OFF Code
                    </button>
                  </form>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-600 mt-4">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      Welcome to Bespoke!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Check your email for your 10% discount code
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
