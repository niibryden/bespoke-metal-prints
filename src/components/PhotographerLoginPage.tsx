import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Camera, Loader2, AlertCircle, Mail, Lock } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { getServerUrl } from '../utils/serverUrl';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface PhotographerLoginPageProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
  onSignupClick: () => void;
}

export function PhotographerLoginPage({ onClose, onSuccess, onSignupClick }: PhotographerLoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();

      // Sign in with Supabase
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (!session) {
        throw new Error('Failed to create session');
      }

      // Verify photographer registration
      const response = await fetch(`${getServerUrl()}/marketplace/photographer/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      // Read response as text first, then try to parse as JSON
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Failed to verify photographer status';
        
        try {
          const data = JSON.parse(responseText);
          errorMessage = data.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use the raw text response
          console.error('❌ Non-JSON response from server:', responseText.substring(0, 200));
          errorMessage = `Server error (${response.status})`;
        }
        
        if (response.status === 404 || errorMessage.includes('not registered')) {
          throw new Error('You are not registered as a photographer. Please sign up first.');
        }
        throw new Error(errorMessage);
      }

      // Parse the successful response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', responseText.substring(0, 200));
        throw new Error('Invalid server response');
      }

      if (!data.isPhotographer) {
        throw new Error('You are not registered as a photographer. Please sign up first.');
      }

      console.log('✅ Photographer login successful');
      onSuccess(session.user.email || '');
    } catch (err: any) {
      console.error('❌ Photographer login error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

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
              Photographer Login
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

      <div className="container mx-auto px-6 py-12 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-gray-200 dark:border-[#2a2a2a] shadow-xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-[#ff6b35]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your photographer dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                />
              </div>
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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2a2a2a] text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Not a photographer yet?{' '}
              <button
                onClick={onSignupClick}
                className="text-[#ff6b35] hover:text-[#ff8555] font-semibold transition-colors"
              >
                Sign Up Now
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}