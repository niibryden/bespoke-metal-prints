import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/config';
import { getServerUrl } from '../utils/serverUrl';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = useMemo(() => getSupabaseClient(), []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Login - use Supabase directly
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          // Provide more helpful error messages
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          }
          throw signInError;
        }

        setSuccess('Login successful! You can now proceed to checkout.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Sign up - use backend API
        if (!formData.name) {
          throw new Error('Please enter your name');
        }

        const response = await fetch(`${getServerUrl()}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Sign up failed');
        }

        setSuccess('Account created successfully! You can now proceed to checkout.');
        
        // If we got an access token, sign in with it
        if (data.access_token) {
          // User is already signed in via the backend
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          // Need to sign in manually
          setTimeout(async () => {
            try {
              await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
              });
              onClose();
            } catch (err) {
              console.error('Auto sign-in failed:', err);
              setError('Account created, but auto sign-in failed. Please sign in manually.');
              setIsLogin(true);
            }
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl shadow-2xl w-full max-w-md border border-[#ff6b35]/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-[#ff6b35] p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:bg-black/10 rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl text-black pr-8">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-black/80 text-sm mt-1">
            {isLogin 
              ? 'Sign in to continue to checkout' 
              : 'Sign up to complete your order'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name field for signup */}
          {!isLogin && (
            <div>
              <label className="block text-gray-300 text-sm mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none transition-colors"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-12 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
            >
              {success}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          {/* Toggle between login/signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-[#ff6b35] hover:text-[#ff8c42] text-sm transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <div className="p-4 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg">
            <p className="text-gray-400 text-xs text-center">
              {isLogin 
                ? 'Existing customers: Sign in to access your order history and saved preferences.' 
                : 'New customers: Create an account to track your orders and enjoy faster checkout.'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}