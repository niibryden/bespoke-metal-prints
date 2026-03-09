import { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, AlertTriangle, RefreshCw, CheckCircle, Database, Archive } from 'lucide-react';
import { getServerUrl } from '../../utils/serverUrl';

interface CleanupStats {
  ordersScanned: number;
  ordersWithBase64Images: number;
  base64DataRemoved: number;
  bytesFreed: number;
  s3UrlsPreserved: number;
}

interface S3RecoveryStats {
  scanned: number;
  collectionsFound: number;
  collectionsCreated: number;
  photosRecovered: number;
  photosSkipped: number;
  actions?: string[];
}

interface MigrationStats {
  ordersScanned: number;
  ordersMigrated: number;
  ordersAlreadyCorrect: number;
  ordersNoImage: number;
  errors?: string[];
}

export function DataCleanup({ adminInfo }: { adminInfo: { email: string; accessToken: string } }) {
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<CleanupStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<S3RecoveryStats | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationStats | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  const serverUrl = getServerUrl();
  const getAuthHeader = () => `Bearer ${adminInfo.accessToken}`;

  const recoverFromS3 = async () => {
    if (!confirm('This will scan your S3 bucket and recover photos that are missing from the database. Continue?')) {
      return;
    }

    setRecovering(true);
    setRecoveryError(null);
    setRecoveryResult(null);

    try {
      const response = await fetch(
        `${serverUrl}/admin/recover-from-s3`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: getAuthHeader(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'S3 recovery failed');
      }

      setRecoveryResult(data);
      
      // Notify other components to refresh
      window.dispatchEvent(new Event('collectionsUpdated'));
    } catch (err: any) {
      console.error('S3 recovery error:', err);
      setRecoveryError(err.message || 'Failed to recover from S3');
    } finally {
      setRecovering(false);
    }
  };

  const stripBase64Images = async () => {
    if (!confirm('This will remove base64 image data from order records while preserving S3 URLs. This operation is safe and improves database performance. Continue?')) {
      return;
    }

    setCleaning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${serverUrl}/admin/strip-base64-images`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: getAuthHeader(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Cleanup failed');
      }

      setResult(data.stats);
    } catch (err: any) {
      console.error('Cleanup error:', err);
      setError(err.message || 'Failed to cleanup data');
    } finally {
      setCleaning(false);
    }
  };

  const migrateOrders = async () => {
    if (!confirm('This will migrate orders to the new schema. This operation is safe and improves database performance. Continue?')) {
      return;
    }

    setMigrating(true);
    setMigrationError(null);
    setMigrationResult(null);

    try {
      const response = await fetch(
        `${serverUrl}/admin/migrate-image-urls`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: getAuthHeader(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed');
      }

      setMigrationResult(data.stats);
    } catch (err: any) {
      console.error('Migration error:', err);
      setMigrationError(err.message || 'Failed to migrate orders');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white [data-theme='light']_&:bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-gray-900">Database Cleanup</h2>
            <p className="text-sm text-gray-600">
              Optimize database performance by removing unnecessary data
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important: Disk IO Budget</p>
              <p>
                These cleanup operations help reduce your Supabase Disk IO consumption by removing
                large image data and old records. This can significantly improve database performance
                and prevent timeout errors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strip Base64 Images from Orders */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          Strip Large Images from Orders
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Remove base64 image data from order records to reduce database size. Images stored in S3
          will not be affected. This operation is safe and can significantly improve query performance.
        </p>
        <button
          onClick={stripBase64Images}
          disabled={cleaning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {cleaning ? 'Processing...' : 'Strip Images from Orders'}
        </button>
      </motion.div>

      {/* Recover from S3 */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-green-600" />
          Recover Photos from S3
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Scan your S3 bucket and recover photos that are missing from the database. This helps
          ensure that all photos are available in the database and can be accessed through the
          application. <strong>This action cannot be undone!</strong>
        </p>
        <button
          onClick={recoverFromS3}
          disabled={recovering}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {recovering ? 'Processing...' : 'Recover Photos from S3'}
        </button>
      </motion.div>

      {/* Migrate Orders */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Archive className="w-5 h-5 text-purple-600" />
          Fix Print-Ready Image URLs
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Migrates imageUrl references to ensure print-ready images are visible in the admin panel.
          This fixes orders showing "No Print-Ready Image Found" even though the image exists in S3.
          This operation is safe and does not modify any actual image files.
        </p>
        <button
          onClick={migrateOrders}
          disabled={migrating}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {migrating ? 'Processing...' : 'Fix Image URLs'}
        </button>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          className="bg-green-50 border border-green-200 rounded-lg p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-medium text-green-900 mb-2">Cleanup Complete!</h4>
              <div className="space-y-2 text-sm text-green-800">
                <p>• Orders scanned: <strong>{result.ordersScanned}</strong></p>
                {result.ordersWithBase64Images > 0 && (
                  <p>• Orders with base64 images: <strong>{result.ordersWithBase64Images}</strong></p>
                )}
                {result.base64DataRemoved > 0 && (
                  <p>• Base64 data removed: <strong>{result.base64DataRemoved}</strong></p>
                )}
                {result.s3UrlsPreserved > 0 && (
                  <p>• S3 URLs preserved: <strong>{result.s3UrlsPreserved}</strong></p>
                )}
                {result.bytesFreed > 0 && (
                  <p>• Approximate space freed: <strong>{(result.bytesFreed / 1024 / 1024).toFixed(2)} MB</strong></p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recovery Results */}
      {recoveryResult && (
        <motion.div
          className="bg-green-50 border border-green-200 rounded-lg p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-medium text-green-900 mb-2">Recovery Complete!</h4>
              <div className="space-y-2 text-sm text-green-800">
                <p>• Scanned: <strong>{recoveryResult.scanned}</strong></p>
                {recoveryResult.collectionsFound > 0 && (
                  <p>• Collections found: <strong>{recoveryResult.collectionsFound}</strong></p>
                )}
                {recoveryResult.collectionsCreated > 0 && (
                  <p>• Collections created: <strong>{recoveryResult.collectionsCreated}</strong></p>
                )}
                {recoveryResult.photosRecovered > 0 && (
                  <p>• Photos recovered: <strong>{recoveryResult.photosRecovered}</strong></p>
                )}
                {recoveryResult.photosSkipped > 0 && (
                  <p>• Photos skipped: <strong>{recoveryResult.photosSkipped}</strong></p>
                )}
                {recoveryResult.actions && recoveryResult.actions.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Actions taken:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {recoveryResult.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Migration Results */}
      {migrationResult && (
        <motion.div
          className="bg-green-50 border border-green-200 rounded-lg p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-medium text-green-900 mb-2">Migration Complete!</h4>
              <div className="space-y-2 text-sm text-green-800">
                <p>• Orders scanned: <strong>{migrationResult.ordersScanned}</strong></p>
                {migrationResult.ordersMigrated > 0 && (
                  <p>• Orders migrated: <strong>{migrationResult.ordersMigrated}</strong></p>
                )}
                {migrationResult.ordersAlreadyCorrect > 0 && (
                  <p>• Orders already correct: <strong>{migrationResult.ordersAlreadyCorrect}</strong></p>
                )}
                {migrationResult.ordersNoImage > 0 && (
                  <p>• Orders with no image: <strong>{migrationResult.ordersNoImage}</strong></p>
                )}
                {migrationResult.errors && migrationResult.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-medium mb-1 text-yellow-900">⚠️ Some errors occurred:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-800">
                      {migrationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 mb-1">Cleanup Failed</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recovery Error */}
      {recoveryError && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 mb-1">Recovery Failed</h4>
              <p className="text-sm text-red-800">{recoveryError}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Migration Error */}
      {migrationError && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 mb-1">Migration Failed</h4>
              <p className="text-sm text-red-800">{migrationError}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}