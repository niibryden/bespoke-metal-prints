import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, UserCircle } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { safeSignIn } from '../utils/supabase/auth-manager';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  onClose: () => void;
}

export function LoginPage({ onClose }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Use useMemo to ensure we only get the client once
  const supabase = useMemo(() => getSupabaseClient(), []);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Attempting sign up for:', email);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      console.log('📊 Signup response status:', response.status);
      
      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      console.log('📊 Response content-type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server error - please try again later');
      }

      const data = await response.json();
      console.log('📊 Signup response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      // Check if user was automatically signed in
      if (data.access_token && data.refresh_token) {
        console.log('✅ User signed in, setting session...');
        
        // User is now signed in, set the session in Supabase client
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          // Fall back to showing success message and manual login
          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false);
        } else {
          console.log('✅ Session set successfully');
          setSuccess('Account created and signed in successfully!');
          
          // Wait a bit and reload to ensure session is fully established
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.reload();
        }
      } else {
        // Manual sign-in required
        setSuccess('Account created successfully! You can now sign in.');
        setIsSignUp(false);
      }

      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      console.error('❌ Sign up error:', err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📊 Sign in response:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user,
        error 
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      if (data.session) {
        console.log('✅ Session established successfully');
        setSuccess('Successfully signed in!');
        
        // Wait a bit to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Trigger a page refresh to update auth state
        window.location.reload();
      } else {
        throw new Error('No session returned from sign in');
      }
    } catch (err: any) {
      console.error('❌ Sign in failed:', err);
      setError(err.message || 'An error occurred during sign in');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Attempting Google sign in...');
      
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail);

      if (error) throw error;

      if (data) {
        setSuccess('Password reset email sent!');
        // Close modal after brief delay
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset');
      console.error('Password reset error:', err);
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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
                <UserCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] outline-none transition-colors"
                    placeholder="Enter full name"
                  />
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                  Email / Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] outline-none transition-colors"
                  placeholder="Enter email or phone"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] outline-none transition-colors"
                    placeholder="Enter password"
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

              {!isSignUp && (
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
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-[#ff6b35] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-600 dark:text-green-400 text-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#ff6b35] text-white font-semibold rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Right Column - Social Sign In (Desktop Only) */}
          <div className="hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-8 md:p-12 border-l border-gray-200 dark:border-[#2a2a2a] relative min-w-[280px]">
            {/* Vertical "OR Sign in with" text */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                OR Sign in with
              </div>
            </div>

            {/* Google Sign In Button */}
            <div className="flex flex-col items-center gap-6 ml-8">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center gap-3 px-8 py-3 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-[#333333] hover:bg-gray-50 dark:hover:bg-[#333333] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                Google
              </button>

              {/* Sign Up Link */}
              <div className="text-center mt-auto">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enjoy New experience{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-[#ff6b35] hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Sign Up/Sign In Toggle - Shows when right column is hidden */}
          <div className="md:hidden px-8 pb-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-[#ff6b35] hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Enjoy New experience{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-[#ff6b35] hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
            
            {/* Mobile Google Sign In */}
            {!isSignUp && (
              <div className="pt-4 border-t border-gray-200 dark:border-[#2a2a2a]">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">OR Sign in with</p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-[#333333] hover:bg-gray-50 dark:hover:bg-[#333333] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  Google
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetPassword && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetPassword(false)}
          >
            <motion.div
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-black dark:text-white">Reset Password</h3>
                <button
                  onClick={() => setShowResetPassword(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#ff6b35] text-white font-semibold rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full py-3 bg-transparent border border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all"
                >
                  Cancel
                </button>
              </form>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-600 dark:text-yellow-400">
                <strong>Note:</strong> Password reset requires email configuration in Supabase. If you don't receive an email, please contact support.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}