import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Image as ImageIcon, 
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  FileText,
  AlertCircle,
  Camera,
  LogOut,
  Upload,
  Plus,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { getServerUrl } from '../utils/serverUrl';
import { getSupabaseClient } from '../utils/supabase/client';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DarkModeToggleSwap } from './DarkModeToggle';

interface PhotographerDashboardProps {
  photographerEmail: string;
  onLogout: () => void;
  onUploadClick?: () => void;
}

interface PhotoInfo {
  photoId: string;
  title: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  totalSales: number;
  totalEarnings: number;
  views: number;
  lastSaleDate?: string;
}

interface Transaction {
  id: string;
  photoId: string;
  photoTitle: string;
  orderId: string;
  saleDate: string;
  customerName: string;
  printSize: string;
  quantity: number;
  basePrice: number;
  royaltyAmount: number;
  royaltyPercentage: number;
}

interface DashboardStats {
  totalPhotos: number;
  approvedPhotos: number;
  pendingPhotos: number;
  rejectedPhotos: number;
  totalSales: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  averagePerPhoto: number;
}

export function PhotographerDashboard({ photographerEmail, onLogout, onUploadClick }: PhotographerDashboardProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [photos, setPhotos] = useState<PhotoInfo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'sales' | 'earnings'>('overview');
  const [photographerStatus, setPhotographerStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Listen for photo upload events to refresh the dashboard
    const handlePhotosUpdated = () => {
      console.log('📸 Photos updated event received, refreshing dashboard...');
      loadDashboardData();
    };
    
    window.addEventListener('photographerPhotosUpdated', handlePhotosUpdated);
    
    return () => {
      window.removeEventListener('photographerPhotosUpdated', handlePhotosUpdated);
    };
  }, [photographerEmail]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${getServerUrl()}/marketplace/photographer/dashboard`;
      console.log('📊 Loading dashboard from:', url);
      console.log('📧 Photographer email:', photographerEmail);
      
      // Get the current session
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to view the dashboard');
      }
      
      console.log('🔑 Auth token obtained');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dashboard data loaded:', data);
      
      // Set photographer status
      setPhotographerStatus(data.profile?.status || 'pending');
      
      // Map the new response structure to the old format
      setStats({
        totalPhotos: data.profile?.photoCount || 0,
        approvedPhotos: data.approvedPhotos?.length || 0,
        pendingPhotos: data.pendingPhotos?.length || 0,
        rejectedPhotos: data.rejectedPhotos?.length || 0,
        totalSales: data.profile?.totalSales || 0,
        totalEarnings: data.profile?.totalEarnings || 0,
        thisMonthEarnings: data.profile?.thisMonthEarnings || 0,
        averagePerPhoto: data.profile?.averagePerPhoto || 0,
      });
      
      // Combine all photos for display
      const allPhotos = [
        ...(data.approvedPhotos || []),
        ...(data.pendingPhotos || []),
        ...(data.rejectedPhotos || []),
      ].map((photo: any) => {
        // Use webUrl if available, otherwise fall back to s3Url
        let imageUrl = photo.webUrl || photo.s3Url || '';
        
        return {
          ...photo,
          photoId: photo.id,
          imageUrl,
          uploadedAt: photo.uploadDate,
          totalSales: photo.sales || 0,
          totalEarnings: (photo.sales || 0) * (photo.basePrice || 0) * ((photo.photographerRoyalty || 30) / 100),
          views: photo.views || 0,
        };
      });
      setPhotos(allPhotos);
      
      // Get transactions (sales) - filter from all photos that have sales
      const salesTransactions = allPhotos
        .filter((photo: any) => photo.sales > 0)
        .map((photo: any) => ({
          id: `sale-${photo.id}`,
          photoId: photo.id,
          photoTitle: photo.title,
          amount: photo.sales * (photo.basePrice || 0) * (photo.photographerRoyalty / 100),
          royalty: photo.photographerRoyalty,
          date: photo.uploadDate,
          status: 'completed',
        }));
      setTransactions(salesTransactions);
    } catch (err: any) {
      console.error('❌ Error loading dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const csv = [
      ['Date', 'Order ID', 'Photo Title', 'Print Size', 'Quantity', 'Base Price', 'Royalty %', 'Your Earnings'].join(','),
      ...transactions.map(t => [
        new Date(t.saleDate).toLocaleDateString(),
        t.orderId,
        `"${t.title}"`,
        t.printSize,
        t.quantity,
        `$${(t.basePrice || 0).toFixed(2)}`,
        `${t.royaltyPercentage}%`,
        `$${(t.royaltyAmount || 0).toFixed(2)}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photographer-sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deletePhoto = async (photoId: string, photoTitle: string, photoStatus: string, photoSales: number) => {
    // Check if photo can be deleted
    if (photoStatus === 'approved' && photoSales > 0) {
      alert(`Cannot delete "${photoTitle}" - this photo has ${photoSales} sale(s). Photos with sales history cannot be deleted.`);
      return;
    }

    const confirmMessage = photoStatus === 'approved'
      ? `Delete "${photoTitle}"? This will remove it from the marketplace.`
      : `Delete "${photoTitle}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Get auth token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('You must be logged in to delete photos');
        return;
      }

      const url = `${getServerUrl()}/marketplace/photographer/photo/${photoId}`;
      console.log('🗑️ Deleting photo:', photoId);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete photo');
      }

      console.log('✅ Photo deleted successfully');
      alert(`"${photoTitle}" has been deleted successfully`);

      // Reload dashboard to reflect changes
      await loadDashboardData();
    } catch (err: any) {
      console.error('❌ Error deleting photo:', err);
      alert(`Failed to delete photo: ${err.message}`);
    }
  };

  const deleteSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) {
      alert('No photos selected to delete');
      return;
    }

    const confirmMessage = `Delete ${selectedPhotos.size} selected photo(s)? This will remove them from the marketplace.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeletingMultiple(true);

    try {
      // Get auth token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('You must be logged in to delete photos');
        return;
      }

      const url = `${getServerUrl()}/marketplace/photographer/photos`;
      console.log('🗑️ Deleting selected photos:', Array.from(selectedPhotos));

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoIds: Array.from(selectedPhotos) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete photos');
      }

      console.log('✅ Photos deleted successfully');
      alert(`${selectedPhotos.size} photo(s) have been deleted successfully`);

      // Reload dashboard to reflect changes
      await loadDashboardData();
    } catch (err: any) {
      console.error('❌ Error deleting photos:', err);
      alert(`Failed to delete photos: ${err.message}`);
    } finally {
      setIsDeletingMultiple(false);
      setSelectedPhotos(new Set());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'photos' as const, label: 'My Photos', icon: ImageIcon },
    { id: 'sales' as const, label: 'Sales History', icon: FileText },
    { id: 'earnings' as const, label: 'Earnings', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] pt-[80px]">
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-gray-200 dark:border-[#2a2a2a] fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-xl shadow-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-white font-bold">Photographer Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{photographerEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <div className="scale-90 sm:scale-100">
                <DarkModeToggleSwap />
              </div>
              {/* Upload button */}
              <button
                onClick={() => {
                  if (onUploadClick) {
                    onUploadClick();
                  } else {
                    setShowUploadModal(true);
                  }
                }}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Photo</span>
                <Plus className="w-4 h-4 sm:hidden" />
              </button>
              {/* Logout button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">{/* Removed extra top padding since we already have pt-[80px] on parent */}
        {/* Photographer Status Banner */}
        {photographerStatus === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-8 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2 text-lg">
                  Account Pending Approval
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  Your photographer application is under review. You'll be able to upload photos once your account is approved.
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  We typically review applications within 24 hours. You'll receive an email when your account is approved.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {photographerStatus === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 dark:text-red-100 mb-2 text-lg">
                  Account Not Approved
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Your photographer application was not approved. Please contact support for more information.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:shadow-md'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-gray-200 dark:border-[#2a2a2a]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalPhotos}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Photos Uploaded</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-green-600 dark:text-green-400">{stats.approvedPhotos} approved</span>
                  <span className="text-yellow-600 dark:text-yellow-400">{stats.pendingPhotos} pending</span>
                  {stats.rejectedPhotos > 0 && (
                    <span className="text-red-600 dark:text-red-400">{stats.rejectedPhotos} rejected</span>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-gray-200 dark:border-[#2a2a2a]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  ${(stats.totalEarnings || 0).toFixed(2)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings (25% royalty)</p>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  ${(stats.thisMonthEarnings || 0).toFixed(2)} this month
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-gray-200 dark:border-[#2a2a2a]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalSales}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Prints Sold</p>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  ${(stats.averagePerPhoto || 0).toFixed(2)} avg per photo
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-gray-200 dark:border-[#2a2a2a]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-[#ff6b35]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.approvedPhotos}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Photos in Marketplace</p>
                <div className="mt-2 text-xs text-[#ff6b35]">
                  {stats.approvedPhotos > 0 ? 'Earning royalties' : 'Upload more photos'}
                </div>
              </motion.div>
            </div>

            {/* Top Performing Photos */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#2a2a2a] p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top Performing Photos</h2>
              {photos.filter(p => p.status === 'approved' && p.totalSales > 0).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos
                    .filter(p => p.status === 'approved' && p.totalSales > 0)
                    .sort((a, b) => b.totalEarnings - a.totalEarnings)
                    .slice(0, 6)
                    .map(photo => (
                      <div key={photo.photoId} className="border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-100 dark:bg-[#2a2a2a]">
                          <ImageWithFallback
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 truncate">{photo.title}</h3>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{photo.totalSales} sales</span>
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              ${photo.totalEarnings.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No sales yet. Your photos will appear here once customers start purchasing!
                </p>
              )}
            </div>

            {/* Transparency Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Full Transparency Guarantee</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Every print sold is tracked and recorded. You receive 25% royalty on every sale, calculated from the base print price.
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    View detailed transaction history in the "Sales History" tab. Export your complete sales data anytime for your records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            {/* Upload Instructions */}
            <div className="bg-gradient-to-br from-[#ff6b35]/10 to-[#ff8c42]/10 dark:from-[#ff6b35]/5 dark:to-[#ff8c42]/5 rounded-lg border border-[#ff6b35]/30 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#ff6b35] rounded-lg flex-shrink-0">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    How to Upload & Sell Your Photos
                  </h3>
                  <div className="space-y-2">
                    {[
                      { num: '1', text: 'Click "Upload Photo" button in top-right header' },
                      { num: '2', text: 'Select high-resolution image (min 3000x2000px)' },
                      { num: '3', text: 'Enter photo details (title, description, tags, category)' },
                      { num: '4', text: 'Submit - photo goes to admin for approval' },
                      { num: '5', text: 'Once approved, appears in marketplace' },
                      { num: '6', text: 'Track sales & earnings in dashboard' },
                    ].map((step) => (
                      <div key={step.num} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#ff6b35] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {step.num}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 pt-0.5">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Library */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Photo Library</h2>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {photos.map(photo => (
                    <motion.div
                      key={photo.photoId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      className="group border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-[#0a0a0a]"
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1a1a1a] dark:to-[#2a2a2a] relative overflow-hidden">
                        <ImageWithFallback
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          {photo.status === 'approved' && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                              <CheckCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Approved</span>
                            </span>
                          )}
                          {photo.status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                              <Clock className="w-3 h-3" />
                              <span className="hidden sm:inline">Pending</span>
                            </span>
                          )}
                          {photo.status === 'rejected' && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                              <XCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Rejected</span>
                            </span>
                          )}
                        </div>
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm line-clamp-1">{photo.title}</h3>
                        <div className="space-y-1.5 text-xs mb-3">
                          <div className="flex items-center justify-between py-1 px-2 bg-gray-50 dark:bg-[#1a1a1a] rounded">
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span className="hidden sm:inline">Sales</span>
                            </span>
                            <span className="text-gray-900 dark:text-white font-semibold">{photo.totalSales}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 px-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <span className="text-green-700 dark:text-green-400 flex items-center gap-1 font-medium">
                              <DollarSign className="w-3 h-3" />
                            </span>
                            <span className="text-green-700 dark:text-green-400 font-bold">
                              ${photo.totalEarnings.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deletePhoto(photo.photoId, photo.title, photo.status, photo.totalSales)}
                          disabled={photo.status === 'approved' && photo.totalSales > 0}
                          title={photo.status === 'approved' && photo.totalSales > 0 ? 'Photos with sales cannot be deleted' : 'Delete this photo'}
                          className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg font-medium transition-all duration-200 text-xs ${
                            photo.status === 'approved' && photo.totalSales > 0
                              ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800'
                          } border border-gray-200 dark:border-[#2a2a2a]`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{photo.status === 'approved' && photo.totalSales > 0 ? 'Locked' : 'Delete'}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex p-6 bg-gray-100 dark:bg-[#1a1a1a] rounded-full mb-4">
                    <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                    No photos uploaded yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Start uploading to earn royalties!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sales History Tab */}
        {activeTab === 'sales' && (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#2a2a2a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Complete Sales History</h2>
              {transactions.length > 0 && (
                <button
                  onClick={exportTransactions}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              )}
            </div>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#2a2a2a]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Photo</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Size</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Base Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Royalty</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Your Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id} className="border-b border-gray-100 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {new Date(transaction.saleDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {transaction.photoTitle}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {transaction.orderId.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {transaction.printSize}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                          {transaction.quantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                          ${transaction.basePrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">
                          {transaction.royaltyPercentage}%
                        </td>
                        <td className="py-3 px-4 text-sm text-green-600 dark:text-green-400 font-semibold text-right">
                          ${transaction.royaltyAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                No sales yet. Your transaction history will appear here.
              </p>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && stats && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#2a2a2a] p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Earnings Breakdown</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">All-Time Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${stats.totalEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-6 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This Month</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${stats.thisMonthEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-6 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average per Photo</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${stats.averagePerPhoto.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">How Royalties Work</h3>
                <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>You earn 25% royalty on the base price of every print sold</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Royalties are calculated from the print price (before customer pays shipping/customization)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Every transaction is logged and can be exported for your records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Payments are processed monthly for all sales from the previous month</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}