import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Camera, Loader2, AlertCircle, Mail, Lock, Eye, EyeOff, UserCircle } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { getServerUrl } from '../utils/serverUrl';

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Use useMemo to ensure we only get the client once
  const supabase = getSupabaseClient();

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

  // Check photographer status on mount (for OAuth redirects)
  useEffect(() => {
    const checkPhotographerStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is logged in, check if they're a photographer
          const response = await fetch(`${getServerUrl()}/marketplace/photographer/check`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.isPhotographer) {
              console.log('✅ Photographer authenticated via OAuth');
              onSuccess(session.user.email || '');
            }
          }
        }
      } catch (err) {
        console.error('Error checking photographer status:', err);
      }
    };

    checkPhotographerStatus();
  }, [supabase, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔑 Initiating Google OAuth for photographer...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: false,
        },
      });

      console.log('Google OAuth response:', { data, error });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      // OAuth will redirect automatically
      // After redirect, the useEffect hook will check photographer status
    } catch (err: any) {
      console.error('Google sign in error details:', err);
      
      // Provide more specific error messages
      if (err.message?.includes('not enabled')) {
        setError('Google sign-in is not enabled. Please configure Google OAuth in your Supabase project settings.');
      } else if (err.message?.includes('redirect')) {
        setError('OAuth redirect URL mismatch. Please check your Google OAuth configuration.');
      } else if (err.message?.includes('access') || err.message?.includes('blocked')) {
        setError('Google OAuth app is in testing mode. Please add your email to the Test Users list in Google Cloud Console, or publish the app.');
      } else {
        setError(err.message || 'An error occurred during Google sign in');
      }
      
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - top right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Two Column Layout */}
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left Column - Main Form */}
          <div className="flex-1 p-8 md:p-12">
            {/* Icon and Title */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[#2563eb] flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                Photographer Sign In
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Access your photographer dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] transition-all outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    minLength={6}
                    className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                  />
                  <span className="text-sm text-[#ff6b35]">Remember me</span>
                </label>
              </div>

              {/* Error Messages */}
              {error && (
                <motion.div 
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#ff6b35] text-white font-semibold rounded-lg hover:bg-[#ff8555] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* OR Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-[#2a2a2a]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400">
                  OR
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-[#333333] hover:bg-gray-50 dark:hover:bg-[#333333] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Not a photographer yet?{' '}
                <button
                  onClick={onSignupClick}
                  className="text-[#ff6b35] hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Right Column - Info Section */}
          <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-[#2563eb] to-[#1e40af] p-12 rounded-r-2xl flex-col justify-center text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
            
            <div className="relative z-10">
              <Camera className="w-16 h-16 mb-6 opacity-90" />
              <h3 className="text-2xl font-bold mb-4">
                Join Our Photographer Marketplace
              </h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Share your stunning photography with customers worldwide and earn royalties on every print sold.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Earn 25% Royalties</h4>
                    <p className="text-sm text-blue-100">Get paid for every print sold featuring your work</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Real-Time Analytics</h4>
                    <p className="text-sm text-blue-100">Track your sales and earnings with live dashboard</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Keep Your Rights</h4>
                    <p className="text-sm text-blue-100">Retain full ownership of your photography</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}