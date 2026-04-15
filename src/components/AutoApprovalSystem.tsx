import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Clock, Zap, Settings, Image, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { getServerUrl } from '../utils/serverUrl';

interface AutoApprovalSettings {
  enabled: boolean;
  min_resolution_width: number;
  min_resolution_height: number;
  max_file_size_mb: number;
  allowed_formats: string[];
  auto_approve_trusted_photographers: boolean;
  trust_threshold_sales: number;
  require_metadata: boolean;
  check_duplicates: boolean;
  ai_quality_check: boolean;
  min_quality_score: number;
}

interface ApprovalStats {
  total_pending: number;
  auto_approved_today: number;
  auto_rejected_today: number;
  manual_review_needed: number;
  average_processing_time_seconds: number;
}

export function AutoApprovalSystem() {
  const [settings, setSettings] = useState<AutoApprovalSettings>({
    enabled: true,
    min_resolution_width: 3000,
    min_resolution_height: 2000,
    max_file_size_mb: 50,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    auto_approve_trusted_photographers: true,
    trust_threshold_sales: 10,
    require_metadata: false,
    check_duplicates: true,
    ai_quality_check: true,
    min_quality_score: 75,
  });

  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const supabase = getSupabaseClient();

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const serverUrl = getServerUrl();
      
      if (!session || !serverUrl) {
        console.log('Not authenticated or no server, using default settings');
        return;
      }

      const response = await fetch(`${serverUrl}/make-server-3e3a9cd7/admin/auto-approval-settings`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      // Use default settings on error
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const serverUrl = getServerUrl();
      
      if (!session || !serverUrl) {
        // Use mock stats if not authenticated or no server
        console.log('Not authenticated or no server, using mock stats');
        setStats({
          total_pending: 12,
          auto_approved_today: 34,
          auto_rejected_today: 5,
          manual_review_needed: 3,
          average_processing_time_seconds: 2.4,
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${serverUrl}/make-server-3e3a9cd7/admin/auto-approval-stats`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        throw new Error('Failed to load stats');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      // Use mock stats as fallback
      setStats({
        total_pending: 12,
        auto_approved_today: 34,
        auto_rejected_today: 5,
        manual_review_needed: 3,
        average_processing_time_seconds: 2.4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please log in to save settings');
        return;
      }

      const response = await fetch(`${getServerUrl()}/make-server-3e3a9cd7/admin/auto-approval-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Auto-approval settings saved successfully!');
      
      // Reload stats to see impact
      await loadStats();
      
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestApproval = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${getServerUrl()}/make-server-3e3a9cd7/admin/test-auto-approval`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Test completed: ${data.approved} approved, ${data.rejected} rejected out of ${data.total} pending photos`);
        await loadStats();
      }
    } catch (err) {
      console.error('Error testing approval:', err);
      setError('Failed to run test approval');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#ff6b35]" />
            Auto-Approval System
          </h1>
          <p className="text-gray-400 mt-1 [data-theme='light']_&:text-gray-600">
            Automatically approve photographer submissions based on quality criteria
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleTestApproval}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            aria-label="Test auto-approval on pending photos"
          >
            <Zap className="w-4 h-4" />
            Test Run
          </button>
          
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
            aria-label="Save auto-approval settings"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-500 text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-500 text-sm">{success}</p>
        </motion.div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Pending Review</p>
            <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
              {stats.total_pending}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Auto-Approved Today</p>
            <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
              {stats.auto_approved_today}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Auto-Rejected Today</p>
            <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
              {stats.auto_rejected_today}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Avg. Process Time</p>
            <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
              {stats.average_processing_time_seconds.toFixed(1)}s
            </p>
          </motion.div>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300">
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-[#ff6b35]" />
              <div>
                <p className="text-white font-semibold [data-theme='light']_&:text-gray-900">
                  Enable Auto-Approval
                </p>
                <p className="text-sm text-gray-500">
                  Automatically approve photos that meet all criteria
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
                aria-label="Enable auto-approval"
              />
              <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ff6b35]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#ff6b35]"></div>
            </label>
          </div>

          {/* Resolution Requirements */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 [data-theme='light']_&:text-gray-900">
              <Image className="w-5 h-5 text-[#ff6b35]" />
              Image Quality Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="min-width" className="block text-sm font-medium text-gray-300 mb-2 [data-theme='light']_&:text-gray-700">
                  Minimum Width (pixels)
                </label>
                <input
                  id="min-width"
                  type="number"
                  value={settings.min_resolution_width}
                  onChange={(e) => setSettings({ ...settings, min_resolution_width: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-gray-900"
                  min="1000"
                  aria-label="Minimum image width"
                />
              </div>

              <div>
                <label htmlFor="min-height" className="block text-sm font-medium text-gray-300 mb-2 [data-theme='light']_&:text-gray-700">
                  Minimum Height (pixels)
                </label>
                <input
                  id="min-height"
                  type="number"
                  value={settings.min_resolution_height}
                  onChange={(e) => setSettings({ ...settings, min_resolution_height: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-gray-900"
                  min="1000"
                  aria-label="Minimum image height"
                />
              </div>

              <div>
                <label htmlFor="max-filesize" className="block text-sm font-medium text-gray-300 mb-2 [data-theme='light']_&:text-gray-700">
                  Maximum File Size (MB)
                </label>
                <input
                  id="max-filesize"
                  type="number"
                  value={settings.max_file_size_mb}
                  onChange={(e) => setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-gray-900"
                  min="1"
                  max="200"
                  aria-label="Maximum file size"
                />
              </div>

              <div>
                <label htmlFor="min-quality" className="block text-sm font-medium text-gray-300 mb-2 [data-theme='light']_&:text-gray-700">
                  Minimum Quality Score (%)
                </label>
                <input
                  id="min-quality"
                  type="number"
                  value={settings.min_quality_score}
                  onChange={(e) => setSettings({ ...settings, min_quality_score: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-gray-900"
                  min="0"
                  max="100"
                  aria-label="Minimum quality score"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 [data-theme='light']_&:text-gray-900">
              <Settings className="w-5 h-5 text-[#ff6b35]" />
              Advanced Options
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg cursor-pointer [data-theme='light']_&:bg-gray-50">
                <div>
                  <p className="text-white font-medium [data-theme='light']_&:text-gray-900">
                    Auto-Approve Trusted Photographers
                  </p>
                  <p className="text-sm text-gray-500">
                    Photographers with {settings.trust_threshold_sales}+ sales auto-approved
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auto_approve_trusted_photographers}
                  onChange={(e) => setSettings({ ...settings, auto_approve_trusted_photographers: e.target.checked })}
                  className="w-5 h-5 text-[#ff6b35] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#ff6b35] focus:ring-2"
                  aria-label="Auto-approve trusted photographers"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg cursor-pointer [data-theme='light']_&:bg-gray-50">
                <div>
                  <p className="text-white font-medium [data-theme='light']_&:text-gray-900">
                    AI Quality Check
                  </p>
                  <p className="text-sm text-gray-500">
                    Use AI to detect blur, noise, and composition quality
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ai_quality_check}
                  onChange={(e) => setSettings({ ...settings, ai_quality_check: e.target.checked })}
                  className="w-5 h-5 text-[#ff6b35] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#ff6b35] focus:ring-2"
                  aria-label="Enable AI quality check"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg cursor-pointer [data-theme='light']_&:bg-gray-50">
                <div>
                  <p className="text-white font-medium [data-theme='light']_&:text-gray-900">
                    Check for Duplicates
                  </p>
                  <p className="text-sm text-gray-500">
                    Reject photos that are too similar to existing ones
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.check_duplicates}
                  onChange={(e) => setSettings({ ...settings, check_duplicates: e.target.checked })}
                  className="w-5 h-5 text-[#ff6b35] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#ff6b35] focus:ring-2"
                  aria-label="Check for duplicate photos"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg cursor-pointer [data-theme='light']_&:bg-gray-50">
                <div>
                  <p className="text-white font-medium [data-theme='light']_&:text-gray-900">
                    Require Metadata
                  </p>
                  <p className="text-sm text-gray-500">
                    Photos must have title and description
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.require_metadata}
                  onChange={(e) => setSettings({ ...settings, require_metadata: e.target.checked })}
                  className="w-5 h-5 text-[#ff6b35] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#ff6b35] focus:ring-2"
                  aria-label="Require photo metadata"
                />
              </label>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-500">
                <p className="font-semibold mb-1">How Auto-Approval Works</p>
                <ul className="list-disc list-inside space-y-1 text-blue-400">
                  <li>Photos are checked against all criteria when uploaded</li>
                  <li>If all checks pass, photo is automatically approved</li>
                  <li>If any check fails, photo goes to manual review queue</li>
                  <li>Trusted photographers bypass most checks for faster approval</li>
                  <li>System runs every 5 minutes on pending photos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}