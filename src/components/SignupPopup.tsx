import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Gift, Sparkles, Copy, Check, Tag, ChevronRight } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getServerUrl } from '../utils/serverUrl';

export function SignupPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed or signed up
    const dismissed = localStorage.getItem('signup-popup-dismissed');
    const signedUp = localStorage.getItem('signup-popup-completed');
    
    if (!dismissed && !signedUp) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('signup-popup-dismissed', 'true');
  };

  const handleNoThanks = () => {
    setIsVisible(false);
    localStorage.setItem('signup-popup-dismissed', 'true');
  };

  const handleRevealReward = () => {
    setShowReward(true);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText('WELCOME10');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setSubmitMessage('⚠️ Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Save email to newsletter list
      const response = await fetch(`${getServerUrl()}/newsletter-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          discountCode: 'WELCOME10',
          source: 'popup',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }
      
      localStorage.setItem('signup-popup-completed', 'true');
      localStorage.setItem('newsletter-email', email);
      setSubmitMessage('✅ Success! Your discount code is ready to use.');
      
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      console.error('Newsletter signup error:', error);
      // Still show success to user and save locally
      localStorage.setItem('signup-popup-completed', 'true');
      localStorage.setItem('newsletter-email', email);
      setSubmitMessage('✅ Code saved! You can use WELCOME10 at checkout.');
      
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100000]"
            onClick={handleClose}
          />

          {/* Popup Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: 'spring', 
              damping: 20, 
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] mx-4 z-[100001]"
          >
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-[#ff6b35]/30">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ff6b35] to-orange-600 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-500 to-[#ff6b35] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all border border-white/20"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Content */}
              <div className="relative z-10 p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: 'spring', 
                      damping: 15, 
                      stiffness: 200,
                      delay: 0.1 
                    }}
                    className="mb-4 inline-block"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#ff6b35] blur-xl opacity-50 animate-pulse" />
                      <Gift className="w-16 h-16 text-[#ff6b35] relative" />
                    </div>
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight"
                  >
                    Welcome Gift! 🎉
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-300 text-lg"
                  >
                    Get <span className="text-[#ff6b35] font-bold">10% OFF</span> your first order
                  </motion.p>
                </div>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                  {!showReward ? (
                    // Reveal Button State
                    <motion.div
                      key="reveal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-[#ff6b35] to-orange-600 rounded-2xl p-1"
                      >
                        <div className="bg-slate-900 rounded-2xl p-6 text-center">
                          <Sparkles className="w-12 h-12 text-[#ff6b35] mx-auto mb-3" />
                          <p className="text-white font-semibold text-lg mb-2">
                            Your exclusive discount awaits!
                          </p>
                          <p className="text-gray-400 text-sm">
                            Click below to unlock your code
                          </p>
                        </div>
                      </motion.div>

                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255, 107, 53, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRevealReward}
                        className="w-full py-5 px-8 bg-gradient-to-r from-[#ff6b35] to-orange-600 text-white text-xl font-bold rounded-2xl shadow-xl relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <Tag className="w-6 h-6" />
                          REVEAL MY CODE
                          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-[#ff6b35] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    // Code Revealed State
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-5"
                    >
                      {/* Discount Code Display */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="bg-gradient-to-r from-[#ff6b35] to-orange-600 rounded-2xl p-1"
                      >
                        <div className="bg-slate-900 rounded-2xl p-6">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                            <p className="text-[#ff6b35] font-bold text-sm uppercase tracking-wider">
                              Your Discount Code
                            </p>
                            <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                          </div>
                          
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35] to-orange-600 opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                            <div className="relative bg-black/40 backdrop-blur-sm border-2 border-[#ff6b35]/50 rounded-xl p-4 flex items-center justify-between">
                              <div className="text-center flex-1">
                                <p className="text-4xl font-mono font-bold text-white tracking-wider">
                                  WELCOME10
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCopyCode}
                                className="ml-4 p-3 bg-[#ff6b35] hover:bg-orange-600 rounded-lg transition-colors"
                                title="Copy code"
                              >
                                {copied ? (
                                  <Check className="w-5 h-5 text-white" />
                                ) : (
                                  <Copy className="w-5 h-5 text-white" />
                                )}
                              </motion.button>
                            </div>
                          </div>
                          
                          {copied && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-green-400 text-sm text-center mt-2 font-semibold"
                            >
                              ✓ Code copied to clipboard!
                            </motion.p>
                          )}
                        </div>
                      </motion.div>

                      {/* Email Form */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Mail className="w-5 h-5 text-[#ff6b35]" />
                          <p className="text-white font-semibold">
                            Get exclusive offers & updates
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setSubmitMessage('');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                            className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent backdrop-blur-sm transition-all"
                            disabled={isSubmitting}
                          />

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubscribe}
                            disabled={isSubmitting || !email}
                            className="w-full py-4 bg-gradient-to-r from-[#ff6b35] to-orange-600 hover:from-orange-600 hover:to-[#ff6b35] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                                SUBSCRIBING...
                              </>
                            ) : (
                              <>
                                <Mail className="w-5 h-5" />
                                CLAIM MY DISCOUNT
                              </>
                            )}
                          </motion.button>

                          {submitMessage && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`text-center text-sm font-semibold ${
                                submitMessage.includes('✅') ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {submitMessage}
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* No Thanks Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNoThanks}
                  className="w-full text-center text-gray-400 hover:text-white mt-5 text-sm font-medium transition-colors"
                >
                  No thanks, I'll pay full price
                </motion.button>

                {/* Fine Print */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-xs text-gray-500 text-center mt-4 leading-relaxed"
                >
                  *10% discount applies to orders over $29.99. Cannot be combined with other offers.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}