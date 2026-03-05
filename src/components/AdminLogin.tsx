import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ReturnToHomeButton } from './ReturnToHomeButton';

function getServerUrl() {
  return `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
}

interface AdminLoginProps {
  onLogin: (adminInfo: { email: string; role: string; name: string; permissions: any; accessToken: string }) => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem('christmas-banner-dismissed') === 'true';
  });

  const serverUrl = getServerUrl();
  
  useEffect(() => {
    const handleBannerDismissed = () => setBannerDismissed(true);
    window.addEventListener('banner-dismissed', handleBannerDismissed);
    return () => window.removeEventListener('banner-dismissed', handleBannerDismissed);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('🔐 Attempting admin login to:', `${serverUrl}/admin/login`);
      console.log('📧 Email:', email);
      
      const response = await fetch(`${serverUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get response text first to see what we're actually receiving
      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Response was:', responseText);
        throw new Error('Server returned invalid response. Please check server logs.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check if this was a reset operation
      if (data.resetComplete) {
        alert(data.message);
        setEmail('admin@bespokemetalprints.com');
        setPassword('admin123');
        return;
      }

      console.log('✅ Login successful:', data);

      // CRITICAL: Validate that we received a valid JWT token
      const token = data.access_token || '';
      if (!token || !token.startsWith('eyJ') || token.length < 100) {
        console.error('❌ Invalid JWT token received from server!');
        console.error('❌ Token:', token.substring(0, 50));
        throw new Error('Server returned an invalid authentication token. Please try again.');
      }
      
      console.log('✅ Valid JWT token received, length:', token.length);
      console.log('✅ Token preview:', token.substring(0, 30) + '...');

      // Pass admin info and permissions to parent
      onLogin({
        email: data.user?.email || email,
        role: data.user?.role || 'admin',
        name: data.user?.name || email.split('@')[0],
        permissions: data.permissions || {
          canViewOrders: true,
          canManageInventory: true,
          canExportData: true,
        },
        accessToken: token,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('❌ Login error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0a0a0a] [data-theme='light']_&:bg-white flex items-center justify-center px-4 ${bannerDismissed ? 'pt-24' : 'pt-32'} transition-all duration-300`}>
      {/* Back button */}
      <ReturnToHomeButton
        onClick={onBack}
        className={`fixed ${bannerDismissed ? 'top-6' : 'top-[70px]'} left-6 flex items-center gap-2 text-gray-400 hover:text-[#ff6b35] transition-all duration-300 z-50`}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </ReturnToHomeButton>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl text-[#ff6b35] mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
            Bespoke Metal Prints Management
          </p>
        </div>

        {/* Login form */}
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <div>
              <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[#0a0a0a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#ff6b35]/20 hover:shadow-xl hover:shadow-[#ff6b35]/30 hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}