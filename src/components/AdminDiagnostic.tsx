import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DiagnosticData {
  success: boolean;
  summary?: {
    kvAdminsCount: number;
    authUsersCount: number;
  };
  kvAdmins?: Array<{
    email: string;
    name: string;
    role: string;
    userId: string;
    createdAt: string;
  }>;
  authUsers?: Array<{
    id: string;
    email: string;
    createdAt: string;
    emailConfirmed: boolean;
    metadata: any;
  }>;
  error?: string;
}

export function AdminDiagnostic({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [error, setError] = useState('');

  const fetchDiagnostic = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/admin/diagnostic`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      console.log('🔍 Diagnostic result:', result);
      setData(result);
    } catch (err: any) {
      console.error('❌ Diagnostic error:', err);
      setError(err.message || 'Failed to fetch diagnostic data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostic();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#ff6b35]" />
              Admin Account Diagnostic
            </h2>
            <button
              onClick={fetchDiagnostic}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Checking admin accounts...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!loading && data && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">KV Store Admins</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {data.summary?.kvAdminsCount || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Supabase Auth Users</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {data.summary?.authUsersCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {data.summary && (
                <div className={`rounded-lg p-4 ${
                  data.summary.kvAdminsCount > 0 && data.summary.authUsersCount > 0
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  {data.summary.kvAdminsCount > 0 && data.summary.authUsersCount > 0 ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">Admin accounts exist!</p>
                        <p className="text-sm text-green-700">
                          You should be able to log in. If you're getting login errors, check the credentials below.
                        </p>
                      </div>
                    </div>
                  ) : data.summary.kvAdminsCount === 0 && data.summary.authUsersCount === 0 ? (
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-900 mb-1">No admin accounts found</p>
                        <p className="text-sm text-yellow-700">
                          You need to create an admin account using the Bootstrap page or the setup form on the login page.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-900 mb-1">Partial setup detected</p>
                        <p className="text-sm text-yellow-700">
                          KV: {data.summary.kvAdminsCount} | Auth: {data.summary.authUsersCount}. 
                          The admin account may be incomplete. Try creating a new one.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* KV Store Admins */}
              {data.kvAdmins && data.kvAdmins.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">KV Store Admin Configs</h3>
                  <div className="space-y-2">
                    {data.kvAdmins.map((admin, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2 font-medium text-gray-900">{admin.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="ml-2 font-medium text-gray-900">{admin.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Role:</span>
                            <span className="ml-2 font-medium text-gray-900">{admin.role}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">User ID:</span>
                            <span className="ml-2 font-mono text-xs text-gray-700">{admin.userId.substring(0, 20)}...</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supabase Auth Users */}
              {data.authUsers && data.authUsers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Supabase Auth Users</h3>
                  <div className="space-y-2">
                    {data.authUsers.map((user, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2 font-medium text-gray-900">{user.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Confirmed:</span>
                            <span className={`ml-2 font-medium ${user.emailConfirmed ? 'text-green-600' : 'text-red-600'}`}>
                              {user.emailConfirmed ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">ID:</span>
                            <span className="ml-2 font-mono text-xs text-gray-700">{user.id.substring(0, 20)}...</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <span className="ml-2 text-gray-700">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {user.metadata && Object.keys(user.metadata).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-gray-600 text-xs">Metadata:</span>
                            <pre className="text-xs text-gray-700 mt-1 overflow-x-auto">
                              {JSON.stringify(user.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.location.href = '?page=admin-bootstrap'}
              className="flex-1 px-6 py-3 bg-[#ff6b35] text-white rounded-lg font-semibold hover:bg-[#ff5722] transition-colors"
            >
              Go to Bootstrap
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
