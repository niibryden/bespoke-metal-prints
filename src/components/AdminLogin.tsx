import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

function getServerUrl() {
  return `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
}

interface AdminLoginProps {
  onLogin: (adminInfo: { 
    email: string; 
    role: string; 
    name: string; 
    permissions: any; 
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
  }) => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const serverUrl = getServerUrl();

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
        // Check if we need to bootstrap (no admin users exist)
        if (data.needsBootstrap) {
          setError('No admin users exist. Please create the first admin account using the bootstrap process.');
          // Could also redirect to bootstrap page here if desired
        } else {
          throw new Error(data.error || 'Login failed');
        }
        return;
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
      
      // CRITICAL: Convert expires_at from seconds to milliseconds
      const expiresAtMs = data.expires_at ? data.expires_at * 1000 : undefined;
      if (expiresAtMs) {
        console.log('🕐 Token expiration (from server):', new Date(expiresAtMs).toLocaleString());
        console.log('🕐 Time until expiry:', Math.floor((expiresAtMs - Date.now()) / 1000 / 60), 'minutes');
      }

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
        refreshToken: data.refresh_token, // Store refresh token for automatic refresh
        expiresAt: expiresAtMs, // Already converted to milliseconds
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Back button in top left */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#ff6b35] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header - Clean Design */}
          <div className="relative p-8 pb-6">
            {/* Icon and Title */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#2563eb] flex items-center justify-center mb-4">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                Admin Sign In
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Bespoke Metal Prints Management
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] outline-none transition-colors"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] outline-none transition-colors"
                    placeholder="••••••••"
                    required
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

              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm">
                  <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                  {error.includes('bootstrap') && (
                    <p className="text-gray-600 dark:text-gray-400">
                      Visit <span className="text-[#ff6b35] font-medium">/admin/bootstrap</span> to create your first admin account.
                    </p>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#ff6b35] text-white font-semibold rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
