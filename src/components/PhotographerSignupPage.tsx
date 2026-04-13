import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Camera, TrendingUp, DollarSign, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { getServerUrl } from '../utils/serverUrl';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface PhotographerSignupPageProps {
  onClose: () => void;
  onSuccess?: (email: string) => void;
}

export function PhotographerSignupPage({ onClose, onSuccess }: PhotographerSignupPageProps) {
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    portfolioUrl: '',
    instagramHandle: '',
  });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const scrollY = window.scrollY;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current user session
      const supabase = getSupabaseClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('You must be logged in to become a photographer. Please sign in first.');
        setLoading(false);
        return;
      }

      // Register as photographer
      const response = await fetch(`${getServerUrl()}/marketplace/photographer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      // Read response as text first, then parse as JSON
      const responseText = await response.text();
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Non-JSON response from server:', responseText.substring(0, 200));
        throw new Error(`Server error (${response.status}): Invalid response format`);
      }

      if (!response.ok) {
        // If already registered, treat it as success and redirect to dashboard
        if (data.error === 'Already registered as photographer') {
          console.log('✅ Already registered as photographer, redirecting to dashboard');
          setStep('success');
          if (onSuccess) {
            setTimeout(() => onSuccess(session.user.email), 1000);
          }
          return;
        }
        throw new Error(data.error || 'Failed to register');
      }

      console.log('✅ Photographer registration successful');
      setStep('success');
      
      // Call success callback after a delay
      if (onSuccess) {
        setTimeout(() => onSuccess(session.user.email), 2000);
      }
    } catch (err: any) {
      console.error('❌ Photographer registration error:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white dark:bg-black flex items-center justify-center overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-20 p-2 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-[#ff6b35] hover:text-black transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Return to Home - top left */}
      <div className="fixed top-6 left-6 z-20">
        <ReturnToHomeButton onClick={onClose} />
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {step === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero */}
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Sell Your Photography Through Bespoke Metal Prints
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Turn your art into income. We handle printing, shipping, and customer service.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: DollarSign,
                  title: 'Earn 25% Royalties',
                  description: 'Receive 25% commission on every print sold. No upfront costs.',
                },
                {
                  icon: Users,
                  title: 'Reach More Customers',
                  description: 'Your photos appear in our marketplace, reaching thousands of buyers.',
                },
                {
                  icon: TrendingUp,
                  title: 'Premium Quality',
                  description: 'We print on ChromaLuxe aluminum - the highest quality metal prints available.',
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

            {/* How it works */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-gray-200 dark:border-[#2a2a2a]">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                How It Works
              </h3>
              <div className="space-y-4">
                {[
                  'Apply to become a photographer (we review within 24 hours)',
                  'Upload your high-resolution photos to our marketplace',
                  'We review and approve your photos for quality',
                  'Customers discover and purchase your art',
                  'We handle printing, shipping, and customer service',
                  'You receive 25% royalties deposited to your account',
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ff6b35] flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Photo Requirements
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Minimum 3000 x 2000 pixels (6MP+)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Original work - you own full rights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Professional quality composition and lighting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  No watermarks (we protect your work)
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center">
              <motion.button
                onClick={() => setStep('form')}
                className="px-8 py-4 bg-[#ff6b35] text-white rounded-xl hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/30 font-semibold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply Now - It's Free!
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => setStep('info')}
              className="mb-6 text-gray-600 dark:text-gray-400 hover:text-[#ff6b35] transition-colors flex items-center gap-2"
            >
              ← Back to Info
            </button>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-gray-200 dark:border-[#2a2a2a]">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Photographer Application
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="How you want to be known"
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about your photography style and experience..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input
                      type="text"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      placeholder="yourhandle"
                      className="w-full pl-8 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    By submitting this application, you confirm that you own the rights to all photos you'll upload
                    and agree to our photographer terms of service.
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-[#ff6b35] text-white rounded-xl hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/30 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>

            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Application Submitted!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              We'll review your application within 24 hours and send you an email with next steps.
            </p>

            <motion.button
              onClick={onClose}
              className="px-8 py-3 bg-[#ff6b35] text-white rounded-xl hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/30 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}