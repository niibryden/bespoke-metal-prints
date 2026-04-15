import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Clock, Camera, Image as ImageIcon, User, Mail, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { getServerUrl } from '../utils/serverUrl';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

interface AdminMarketplaceApprovalsProps {
  adminEmail: string;
}

interface PendingPhotographer {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  portfolioUrl: string;
  instagramHandle: string;
  joinedDate: string;
  status: string;
}

interface PendingPhoto {
  id: string;
  photographerId: string;
  photographerName: string;
  title: string;
  description: string;
  s3Url: string;
  category: string;
  tags: string[];
  uploadDate: string;
  status: string;
}

export function AdminMarketplaceApprovals({ adminEmail }: AdminMarketplaceApprovalsProps) {
  const [activeTab, setActiveTab] = useState<'photographers' | 'photos' | 'approved'>('photographers');
  const [pendingPhotographers, setPendingPhotographers] = useState<PendingPhotographer[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [approvedPhotos, setApprovedPhotos] = useState<PendingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingItems();
  }, []);

  useEffect(() => {
    // Load approved photos when switching to approved tab
    if (activeTab === 'approved' && approvedPhotos.length === 0) {
      loadApprovedPhotos();
    }
  }, [activeTab]);

  const loadPendingItems = async () => {
    setLoading(true);
    setError('');

    try {
      // Load pending photographers
      console.log('🔄 Loading pending photographers from:', `${getServerUrl()}/marketplace/admin/pending-photographers`);
      const photographersResponse = await fetch(`${getServerUrl()}/marketplace/admin/pending-photographers`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': adminEmail,
        },
      });

      console.log('📊 Photographers response status:', photographersResponse.status);
      
      if (photographersResponse.ok) {
        const photographersData = await photographersResponse.json();
        console.log('📸 Photographers data received:', photographersData);
        console.log('📸 Number of photographers:', photographersData.photographers?.length || 0);
        
        if (photographersData.photographers && photographersData.photographers.length > 0) {
          console.log('✅ First photographer:', photographersData.photographers[0]);
        }
        
        setPendingPhotographers(photographersData.photographers || []);
      } else {
        const errorText = await photographersResponse.text();
        console.error('❌ Failed to load photographers:', photographersResponse.status, errorText);
        setError(`Failed to load photographers: ${photographersResponse.status}`);
      }

      // Load pending photos
      const photosResponse = await fetch(`${getServerUrl()}/marketplace/admin/pending-photos`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': adminEmail,
        },
      });

      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        setPendingPhotos(photosData.photos || []);
      }
    } catch (err: any) {
      console.error('❌ Failed to load pending items:', err);
      setError(err.message || 'Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const loadApprovedPhotos = async () => {
    setLoading(true);
    setError('');

    try {
      // Load approved photos
      console.log('🔄 Loading approved photos from:', `${getServerUrl()}/marketplace/admin/approved-photos`);
      const photosResponse = await fetch(`${getServerUrl()}/marketplace/admin/approved-photos`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': adminEmail,
        },
      });

      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        setApprovedPhotos(photosData.photos || []);
      }
    } catch (err: any) {
      console.error('❌ Failed to load approved photos:', err);
      setError(err.message || 'Failed to load approved photos');
    } finally {
      setLoading(false);
    }
  };

  const checkDebugInfo = async () => {
    try {
      const response = await fetch(`${getServerUrl()}/marketplace/admin/debug/photographers`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': adminEmail,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG INFO:', data.debug);
        
        // Build detailed debug message
        const profiles = data.debug.profileDetails.map((p: any) => 
          `${p.displayName || 'Unnamed'} (${p.email || 'no email'})\n  Status: ${p.status}\n  User ID: ${p.userId}\n  Joined: ${p.joinedDate ? new Date(p.joinedDate).toLocaleDateString() : 'unknown'}`
        ).join('\n\n');
        
        const summary = `
DATABASE STATUS:
━━━━━━━━━━━━━━━━━━━━━━━
📋 Pending List: ${data.debug.pendingListCount} IDs
👥 Total Profiles: ${data.debug.allProfilesCount}

PENDING IDS:
${data.debug.pendingList.length > 0 ? data.debug.pendingList.join(', ') : 'None'}

ALL PHOTOGRAPHER PROFILES:
━━━━━━━━━━━━━━━━━━━━━━━
${profiles || 'No profiles found'}
        `.trim();
        
        console.log('📊 FULL DEBUG:\n' + summary);
        
        toast.info('Debug Information (Check Console)', {
          description: `Pending: ${data.debug.pendingListCount} | Total Profiles: ${data.debug.allProfilesCount}`,
          duration: 5000,
        });
      }
    } catch (err: any) {
      console.error('❌ Debug check failed:', err);
      toast.error('Debug check failed', {
        description: err.message,
      });
    }
  };

  const syncPendingList = async () => {
    try {
      console.log('🔄 Syncing pending list with admin email:', adminEmail);
      
      toast.loading('Syncing pending list...', { id: 'sync' });
      
      const response = await fetch(`${getServerUrl()}/marketplace/admin/sync-pending`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': adminEmail || 'admin@bespokeprints.com',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Sync failed with status:', response.status, errorData);
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ SYNC RESULT:', data);
      
      toast.success('Synced pending list!', {
        id: 'sync',
        description: `Found ${data.syncedCount} pending photographer(s). Reloading list...`,
        duration: 3000,
      });
      
      await loadPendingItems();
    } catch (err: any) {
      console.error('❌ Sync failed:', err);
      toast.error('Sync failed', {
        id: 'sync',
        description: err.message,
      });
    }
  };

  const handlePhotographerAction = async (photographerId: string, action: 'approved' | 'rejected', reason?: string) => {
    setProcessingId(photographerId);

    try {
      const response = await fetch(`${getServerUrl()}/marketplace/admin/photographer/${photographerId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          'X-Admin-Email': adminEmail,
        },
        body: JSON.stringify({
          status: action,
          reason: reason || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update photographer status');
      }

      // Remove from pending list
      setPendingPhotographers(prev => prev.filter(p => p.id !== photographerId));

      toast.success(`Photographer ${action}!`, {
        description: `Successfully ${action} the photographer`,
        duration: 3000,
      });

      console.log(`✅ Photographer ${action}:`, photographerId);
    } catch (err: any) {
      console.error('❌ Failed to update photographer:', err);
      toast.error(`Failed to ${action} photographer`, {
        description: err.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handlePhotoAction = async (photoId: string, action: 'approved' | 'rejected', featured: boolean = false, reason?: string) => {
    setProcessingId(photoId);

    try {
      const response = await fetch(`${getServerUrl()}/marketplace/admin/photo/${photoId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          'X-Admin-Email': adminEmail,
        },
        body: JSON.stringify({
          status: action,
          featured,
          reason: reason || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update photo status');
      }

      // Remove from pending list
      setPendingPhotos(prev => prev.filter(p => p.id !== photoId));

      toast.success(`Photo ${action}${featured ? ' as featured' : ''}!`, {
        description: `Successfully ${action} the photo`,
        duration: 3000,
      });

      console.log(`✅ Photo ${action}:`, photoId);
    } catch (err: any) {
      console.error('❌ Failed to update photo:', err);
      toast.error(`Failed to ${action} photo`, {
        description: err.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#ff6b35] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white [data-theme=light]_&:text-gray-900 mb-2">
          Marketplace Approvals
        </h2>
        <p className="text-gray-400 [data-theme=light]_&:text-gray-600">
          Review and approve photographer applications and photo submissions
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2a2a2a] [data-theme=light]_&:border-gray-200">
        <button
          onClick={() => setActiveTab('photographers')}
          className={`px-4 py-2 font-medium transition-all relative ${
            activeTab === 'photographers'
              ? 'text-[#ff6b35]'
              : 'text-gray-400 [data-theme=light]_&:text-gray-600 hover:text-white [data-theme=light]_&:hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Photographers
            {pendingPhotographers.length > 0 && (
              <span className="px-2 py-0.5 bg-[#ff6b35] text-white text-xs font-semibold rounded-full">
                {pendingPhotographers.length}
              </span>
            )}
          </div>
          {activeTab === 'photographers' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b35]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 font-medium transition-all relative ${
            activeTab === 'photos'
              ? 'text-[#ff6b35]'
              : 'text-gray-400 [data-theme=light]_&:text-gray-600 hover:text-white [data-theme=light]_&:hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Photos
            {pendingPhotos.length > 0 && (
              <span className="px-2 py-0.5 bg-[#ff6b35] text-white text-xs font-semibold rounded-full">
                {pendingPhotos.length}
              </span>
            )}
          </div>
          {activeTab === 'photos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b35]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium transition-all relative ${
            activeTab === 'approved'
              ? 'text-[#ff6b35]'
              : 'text-gray-400 [data-theme=light]_&:text-gray-600 hover:text-white [data-theme=light]_&:hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved
            {approvedPhotos.length > 0 && (
              <span className="px-2 py-0.5 bg-[#ff6b35] text-white text-xs font-semibold rounded-full">
                {approvedPhotos.length}
              </span>
            )}
          </div>
          {activeTab === 'approved' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b35]" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'photographers' ? (
        <div className="space-y-4">
          {/* Debug Button */}
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${getServerUrl()}/marketplace/admin/debug/photographers`, {
                    headers: {
                      'Authorization': `Bearer ${publicAnonKey}`,
                      'X-Admin-Email': adminEmail,
                    },
                  });
                  
                  if (!response.ok) {
                    throw new Error(`API request failed: ${response.statusText}`);
                  }
                  
                  const data = await response.json();
                  
                  if (!data.debug || !data.debug.profileDetails) {
                    throw new Error('Invalid response from debug endpoint');
                  }
                  
                  // Find all photographers with status='pending'
                  const pendingProfiles = data.debug.profileDetails.filter((p: any) => p.status === 'pending');
                  
                  if (pendingProfiles.length > 0) {
                    const shouldApprove = window.confirm(`Found ${pendingProfiles.length} pending photographer(s). Approve all?`);
                    if (shouldApprove) {
                      toast.loading(`Approving ${pendingProfiles.length} photographers...`, { id: 'approve-all' });
                      
                      for (const profile of pendingProfiles) {
                        const userId = profile.key.replace('photographer:profile:', '');
                        await handlePhotographerAction(userId, 'approved');
                      }
                      
                      await loadPendingItems();
                      
                      toast.success('All pending photographers approved!', {
                        id: 'approve-all',
                        duration: 3000,
                      });
                    }
                  } else {
                    toast.info('No pending photographers found in database');
                  }
                } catch (error: any) {
                  console.error('❌ Error approving photographers:', error);
                  toast.error('Error approving photographers', {
                    description: error.message,
                  });
                }
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              ✅ Approve All Pending
            </button>
            <button
              onClick={checkDebugInfo}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              🔍 Debug Database
            </button>
            <button
              onClick={syncPendingList}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              🔄 Sync Pending List
            </button>
          </div>

          {pendingPhotographers.length === 0 ? (
            <div className="text-center py-16 bg-[#1a1a1a] [data-theme=light]_&:bg-gray-50 rounded-xl border-2 border-dashed border-[#2a2a2a] [data-theme=light]_&:border-gray-300">
              <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white [data-theme=light]_&:text-gray-900 mb-2">
                No Pending Photographers
              </h3>
              <p className="text-gray-400 [data-theme=light]_&:text-gray-600">
                All photographer applications have been reviewed
              </p>
            </div>
          ) : (
            pendingPhotographers.map((photographer) => (
              <motion.div
                key={photographer.id}
                className="bg-[#1a1a1a] [data-theme=light]_&:bg-white border border-[#2a2a2a] [data-theme=light]_&:border-gray-200 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#ff6b35]/20 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-[#ff6b35]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white [data-theme=light]_&:text-gray-900 mb-1">
                        {photographer.displayName}
                      </h3>
                      <p className="text-sm text-gray-400 [data-theme=light]_&:text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {photographer.email}
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-yellow-900/20 text-yellow-400 [data-theme=light]_&:bg-yellow-100 [data-theme=light]_&:text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400 [data-theme=light]_&:text-gray-600 mb-1">Bio</p>
                    <p className="text-white [data-theme=light]_&:text-gray-900">{photographer.bio}</p>
                  </div>

                  {photographer.portfolioUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-400 [data-theme=light]_&:text-gray-600 mb-1">Portfolio</p>
                      <a
                        href={photographer.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ff6b35] hover:underline flex items-center gap-1"
                      >
                        {photographer.portfolioUrl}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {photographer.instagramHandle && (
                    <div>
                      <p className="text-sm font-medium text-gray-400 [data-theme=light]_&:text-gray-600 mb-1">Instagram</p>
                      <a
                        href={`https://instagram.com/${photographer.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ff6b35] hover:underline flex items-center gap-1"
                      >
                        @{photographer.instagramHandle}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-400 [data-theme=light]_&:text-gray-600">
                      Applied: {new Date(photographer.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#2a2a2a] [data-theme=light]_&:border-gray-200">
                  <button
                    onClick={() => handlePhotographerAction(photographer.id, 'approved')}
                    disabled={processingId === photographer.id}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    {processingId === photographer.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      if (reason !== null) {
                        handlePhotographerAction(photographer.id, 'rejected', reason);
                      }
                    }}
                    disabled={processingId === photographer.id}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : activeTab === 'photos' ? (
        <div className="space-y-4">
          {pendingPhotos.length === 0 ? (
            <div className="text-center py-16 bg-[#1a1a1a] [data-theme=light]_&:bg-gray-50 rounded-xl border-2 border-dashed border-[#2a2a2a] [data-theme=light]_&:border-gray-300">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white [data-theme=light]_&:text-gray-900 mb-2">
                No Pending Photos
              </h3>
              <p className="text-gray-400 [data-theme=light]_&:text-gray-600">
                All photo submissions have been reviewed
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  className="bg-[#1a1a1a] [data-theme=light]_&:bg-white border border-[#2a2a2a] [data-theme=light]_&:border-gray-200 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="aspect-square relative bg-[#0a0a0a] [data-theme=light]_&:bg-gray-100">
                    <ImageWithFallback
                      src={photo.s3Url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white [data-theme=light]_&:text-gray-900 mb-1">
                      {photo.title}
                    </h3>
                    <p className="text-sm text-gray-400 [data-theme=light]_&:text-gray-600 mb-2 flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      by {photo.photographerName}
                    </p>

                    {photo.description && (
                      <p className="text-sm text-gray-300 [data-theme=light]_&:text-gray-700 mb-3 line-clamp-2">
                        {photo.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {photo.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-[#2a2a2a] [data-theme=light]_&:bg-gray-100 text-gray-400 [data-theme=light]_&:text-gray-600 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePhotoAction(photo.id, 'approved', false)}
                          disabled={processingId === photo.id}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-1"
                        >
                          {processingId === photo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handlePhotoAction(photo.id, 'approved', true)}
                          disabled={processingId === photo.id}
                          className="px-3 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          title="Approve as Featured"
                        >
                          ⭐
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason !== null && reason.trim()) {
                            handlePhotoAction(photo.id, 'rejected', false, reason);
                          }
                        }}
                        disabled={processingId === photo.id}
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 [data-theme=light]_&:text-gray-400 mt-2">
                      Uploaded: {new Date(photo.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {approvedPhotos.length === 0 ? (
            <div className="text-center py-16 bg-[#1a1a1a] [data-theme=light]_&:bg-gray-50 rounded-xl border-2 border-dashed border-[#2a2a2a] [data-theme=light]_&:border-gray-300">
              <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white [data-theme=light]_&:text-gray-900 mb-2">
                No Approved Photos
              </h3>
              <p className="text-gray-400 [data-theme=light]_&:text-gray-600">
                No photos have been approved yet
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {approvedPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  className="bg-[#1a1a1a] [data-theme=light]_&:bg-white border border-[#2a2a2a] [data-theme=light]_&:border-gray-200 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="aspect-square relative bg-[#0a0a0a] [data-theme=light]_&:bg-gray-100">
                    <ImageWithFallback
                      src={photo.s3Url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white [data-theme=light]_&:text-gray-900 mb-1">
                      {photo.title}
                    </h3>
                    <p className="text-sm text-gray-400 [data-theme=light]_&:text-gray-600 mb-2 flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      by {photo.photographerName}
                    </p>

                    {photo.description && (
                      <p className="text-sm text-gray-300 [data-theme=light]_&:text-gray-700 mb-3 line-clamp-2">
                        {photo.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {photo.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-[#2a2a2a] [data-theme=light]_&:bg-gray-100 text-gray-400 [data-theme=light]_&:text-gray-600 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 [data-theme=light]_&:text-gray-400 mt-2">
                      Uploaded: {new Date(photo.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}