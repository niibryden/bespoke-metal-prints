import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader, CheckCircle, AlertCircle, Database, RefreshCw, FileText, Package, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getServerUrl } from '../../utils/serverUrl';

interface PhotoStats {
  totalCollections: number;
  totalPhotos: number;
  adminPhotos: number;
  marketplacePhotos: number;
  unknownSource: number;
  missingUrl: number;
  missingOriginalUrl: number;
  missingName: number;
  missingId: number;
  photosNeedingMigration: number;
  collectionBreakdown: Array<{
    name: string;
    totalPhotos: number;
    admin: number;
    marketplace: number;
    needsMigration: number;
  }>;
}

export function PhotoArchitecture({ adminInfo }: { adminInfo?: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  const [stats, setStats] = useState<PhotoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken || publicAnonKey}`;
  const serverUrl = getServerUrl();

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/admin/photo-architecture-stats`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        const error = await response.json();
        alert(`Failed to load stats: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      alert('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    if (!confirm('⚠️ PHOTO STRUCTURE MIGRATION\n\nThis will standardize all photo metadata to the unified architecture:\n\n• Add source field (admin/marketplace)\n• Standardize URL fields\n• Ensure all required fields exist\n• Generate missing IDs\n\nThis is safe and non-destructive. Continue?')) {
      return;
    }

    setMigrating(true);
    setMigrationResult(null);

    try {
      const response = await fetch(`${serverUrl}/admin/migrate-photo-structure`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMigrationResult(result);
        
        // Reload stats
        await loadStats();
        
        alert(`✅ Migration Complete!\n\n• Migrated: ${result.migrated}\n• Already Correct: ${result.alreadyMigrated}\n• Errors: ${result.errors}\n• Total Photos: ${result.totalPhotos}`);
      } else {
        const error = await response.json();
        alert(`Failed to migrate: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      alert('Migration failed. Please try again.');
    } finally {
      setMigrating(false);
    }
  };

  const runCleanup = async () => {
    if (!confirm('🗑️ ORPHANED PHOTO CLEANUP\n\nThis will scan all marketplace photos and remove references to files that don\'t exist in S3.\n\n• Checks S3 for file existence\n• Removes broken photo references\n• Keeps admin photos as-is\n\nThis is safe for marketplace photos but cannot be undone. Continue?')) {
      return;
    }

    setCleaning(true);
    setCleanupResult(null);

    try {
      const response = await fetch(`${serverUrl}/admin/cleanup-orphaned-photos`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCleanupResult(result);
        
        // Reload stats
        await loadStats();
        
        alert(`✅ Cleanup Complete!\n\n• Total Photos Scanned: ${result.totalPhotos}\n• Orphaned Photos Removed: ${result.orphanedPhotos}\n• Valid Photos Kept: ${result.validPhotos}\n• Errors: ${result.errors}`);
      } else {
        const error = await response.json();
        alert(`Failed to cleanup: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('Cleanup failed. Please try again.');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl text-white [data-theme='light']_&:text-gray-900 mb-1">Photo Architecture</h2>
        <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
          Unified photo management system with source tracking and metadata standardization
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Load Statistics
            </>
          )}
        </button>

        {stats && stats.photosNeedingMigration > 0 && (
          <button
            onClick={runMigration}
            disabled={migrating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {migrating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Run Migration
              </>
            )}
          </button>
        )}

        {stats && stats.marketplacePhotos > 0 && (
          <button
            onClick={runCleanup}
            disabled={cleaning}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {cleaning ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Clean Orphaned Photos
              </>
            )}
          </button>
        )}
      </div>

      {/* Statistics Display */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Stats */}
          <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
            <h3 className="text-xl text-white [data-theme='light']_&:text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Overall Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-[#ff6b35] mb-1">{stats.totalCollections}</div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Collections</div>
              </div>
              
              <div className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-500 mb-1">{stats.totalPhotos}</div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Total Photos</div>
              </div>
              
              <div className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-500 mb-1">{stats.adminPhotos}</div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Admin Photos</div>
              </div>
              
              <div className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-500 mb-1">{stats.marketplacePhotos}</div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Marketplace Photos</div>
              </div>
            </div>
          </div>

          {/* Data Quality */}
          <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
            <h3 className="text-xl text-white [data-theme='light']_&:text-gray-900 mb-4 flex items-center gap-2">
              {stats.photosNeedingMigration === 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Data Quality - Excellent
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Data Quality - Needs Migration
                </>
              )}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className={`p-4 rounded-lg ${stats.photosNeedingMigration > 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                <div className={`text-2xl font-bold mb-1 ${stats.photosNeedingMigration > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {stats.photosNeedingMigration}
                </div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Needs Migration</div>
              </div>
              
              <div className={`p-4 rounded-lg ${stats.unknownSource > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-[#0f0f0f] [data-theme=\'light\']_&:bg-gray-50'}`}>
                <div className={`text-2xl font-bold mb-1 ${stats.unknownSource > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {stats.unknownSource}
                </div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Missing Source</div>
              </div>
              
              <div className={`p-4 rounded-lg ${stats.missingUrl > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-[#0f0f0f] [data-theme=\'light\']_&:bg-gray-50'}`}>
                <div className={`text-2xl font-bold mb-1 ${stats.missingUrl > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {stats.missingUrl}
                </div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Missing URL</div>
              </div>
              
              <div className={`p-4 rounded-lg ${stats.missingOriginalUrl > 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-[#0f0f0f] [data-theme=\'light\']_&:bg-gray-50'}`}>
                <div className={`text-2xl font-bold mb-1 ${stats.missingOriginalUrl > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                  {stats.missingOriginalUrl}
                </div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Missing Original URL</div>
              </div>
              
              <div className={`p-4 rounded-lg ${stats.missingId > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-[#0f0f0f] [data-theme=\'light\']_&:bg-gray-50'}`}>
                <div className={`text-2xl font-bold mb-1 ${stats.missingId > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {stats.missingId}
                </div>
                <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Missing ID</div>
              </div>
            </div>
          </div>

          {/* Collection Breakdown */}
          <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
            <h3 className="text-xl text-white [data-theme='light']_&:text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Collection Breakdown
            </h3>
            
            <div className="space-y-3">
              {stats.collectionBreakdown.map((col, index) => (
                <div
                  key={index}
                  className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white [data-theme='light']_&:text-gray-900">
                      {col.name}
                    </div>
                    <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                      {col.totalPhotos} photos
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 [data-theme='light']_&:text-gray-600">Admin:</span>
                      <span className="text-green-500 font-medium">{col.admin}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 [data-theme='light']_&:text-gray-600">Marketplace:</span>
                      <span className="text-purple-500 font-medium">{col.marketplace}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 [data-theme='light']_&:text-gray-600">Needs Migration:</span>
                      <span className={`font-medium ${col.needsMigration > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
                        {col.needsMigration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Migration Result */}
          {migrationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-6"
            >
              <h3 className="text-xl text-green-500 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Migration Complete
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-500">{migrationResult.migrated}</div>
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Migrated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">{migrationResult.alreadyMigrated}</div>
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Already Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{migrationResult.errors}</div>
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Errors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white [data-theme='light']_&:text-gray-900">{migrationResult.totalPhotos}</div>
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Total Photos</div>
                </div>
              </div>

              {migrationResult.migrationLog && migrationResult.migrationLog.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-300 [data-theme='light']_&:text-gray-700 mb-2">
                    Migration Log (first 100 entries):
                  </div>
                  <div className="bg-[#0f0f0f] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded p-4 max-h-60 overflow-y-auto font-mono text-xs">
                    {migrationResult.migrationLog.map((line: string, i: number) => (
                      <div key={i} className="text-gray-400 [data-theme='light']_&:text-gray-600">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Cleanup Result */}
          {cleanupResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-6"
            >
              <h3 className="text-xl text-red-500 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Cleanup Complete
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-red-500">{cleanupResult.orphanedPhotos}</div>
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Orphaned Photos Removed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{cleanupResult.validPhotos}</div>
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Valid Photos Kept</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">{cleanupResult.errors}</div>
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Errors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white [data-theme='light']_&:text-gray-900">{cleanupResult.totalPhotos}</div>
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Total Photos Scanned</div>
                </div>
              </div>

              {cleanupResult.cleanupLog && cleanupResult.cleanupLog.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-300 [data-theme='light']_&:text-gray-700 mb-2">
                    Cleanup Log (first 100 entries):
                  </div>
                  <div className="bg-[#0f0f0f] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded p-4 max-h-60 overflow-y-auto font-mono text-xs">
                    {cleanupResult.cleanupLog.map((line: string, i: number) => (
                      <div key={i} className="text-gray-400 [data-theme='light']_&:text-gray-600">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Documentation */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-lg text-blue-400 mb-3 font-medium">Unified Photo Architecture</h3>
        <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 space-y-2">
          <p>
            <strong className="text-white [data-theme='light']_&:text-gray-900">Single Source of Truth:</strong> All photos are stored in <code className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-100 px-2 py-1 rounded">stock:collections</code>
          </p>
          <p>
            <strong className="text-white [data-theme='light']_&:text-gray-900">Source Tracking:</strong> Each photo has a <code className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-100 px-2 py-1 rounded">source</code> field (admin/marketplace) for attribution and royalty calculations
          </p>
          <p>
            <strong className="text-white [data-theme='light']_&:text-gray-900">Dual URLs:</strong> All photos have both <code className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-100 px-2 py-1 rounded">url</code> (display) and <code className="bg-[#0f0f0f] [data-theme='light']_&:bg-gray-100 px-2 py-1 rounded">originalUrl</code> (high-res printing)
          </p>
          <p>
            <strong className="text-white [data-theme='light']_&:text-gray-900">Marketplace Integration:</strong> Approved marketplace photos automatically sync to collections based on category
          </p>
        </div>
      </div>
    </div>
  );
}