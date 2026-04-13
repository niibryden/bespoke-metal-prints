import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
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
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      // Check if user was automatically signed in
      if (data.access_token) {
        // User is now signed in, set the session in Supabase client
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.access_token, // Using access_token as refresh since we auto-confirmed
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          // Fall back to showing success message and manual login
          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false);
        } else {
          setSuccess('Account created and signed in successfully!');
          // Close modal after brief delay
          setTimeout(() => {
            onClose();
          }, 1000);
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
      setError(err.message || 'An error occurred during sign up');
      console.error('Sign up error:', err);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setSuccess('Successfully signed in!');
        // Just close the modal - no need to reload
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
      console.error('Sign in error:', err);
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
        className="bg-[#1a1a1a] [data-theme='light']_&:bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#ff6b35]/20 [data-theme='light']_&:border-gray-300"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-300 p-6 flex items-center justify-between dark:bg-[#1a1a1a] dark:border-[#ff6b35]/20">
          <h2 className="text-2xl text-black dark:text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-[#2a2a2a]"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border-2 border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border-2 border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-[#0a0a0a] border-2 border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] outline-none transition-colors"
                  placeholder="••••••••"
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

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium text-center flex items-center justify-center"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            {/* Forgot Password Link - Only show for sign in */}
            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm text-gray-400 hover:text-[#ff6b35] transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-gray-400 hover:text-[#ff6b35] transition-colors"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-[#ff6b35]">Sign in</span></>
              ) : (
                <>Don't have an account? <span className="text-[#ff6b35]">Create one</span></>
              )}
            </button>
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-300 dark:bg-[#1a1a1a] dark:border-[#ff6b35]/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-white border-b border-gray-300 p-6 flex items-center justify-between dark:bg-[#1a1a1a] dark:border-[#ff6b35]/20">
                <h2 className="text-2xl text-black dark:text-white">
                  Reset Password
                </h2>
                <button
                  onClick={() => setShowResetPassword(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-[#2a2a2a]"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6">
                <p className="text-gray-400 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-gray-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border-2 border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] outline-none transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Error/Success Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                      >
                        {success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium"
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
                    className="w-full py-3 bg-transparent border border-gray-600 text-gray-300 rounded-lg hover:bg-[#2a2a2a] transition-all"
                  >
                    Cancel
                  </button>
                </form>

                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400">
                  <strong>Note:</strong> Password reset requires email configuration in Supabase. If you don't receive an email, please contact support.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}