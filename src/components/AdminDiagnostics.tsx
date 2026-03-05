import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/config';
import { getServerUrl } from '../utils/serverUrl';

interface AdminDiagnosticsProps {
  adminEmail: string;
}

export function AdminDiagnostics({ adminEmail }: AdminDiagnosticsProps) {
  const [loading, setLoading] = useState(false);
  const [databaseData, setDatabaseData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDatabaseHealth = async () => {
    setLoading(true);
    setError(null);
    setHealthData(null);
    
    try {
      console.log('🏥 Running database health check...');
      const response = await fetch(`${getServerUrl()}/admin/database-health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      setHealthData(data);
      console.log('✅ Health check complete:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Database health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getServerUrl()}/diagnostic-database`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDatabaseData(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Database diagnostic error:', err);
    } finally {
      setLoading(false);
    }
  };

  const migrateOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getServerUrl()}/diagnostic-migrate-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDatabaseData(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Order migration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrderImages = async () => {
    if (!confirm('This will remove large base64 images from all orders in the database (images will be moved to storage). Continue?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧹 Starting order image cleanup...');
      const response = await fetch(`${getServerUrl()}/admin/cleanup-order-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Cleanup complete:', data);
      alert(`Cleanup complete!\n\nCleaned orders: ${data.cleanedOrders}/${data.totalOrders}\nFreed space: ${data.freedMB} MB`);
      setDatabaseData(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Order image cleanup error:', err);
      alert(`Cleanup failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testOrderQuery = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing order query endpoint...');
      const response = await fetch(`${getServerUrl()}/test-order-keys`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🧪 TEST RESULTS:', data);
      console.log('Range query found:', data.rangeQuery?.keysFound, 'keys');
      console.log('LIKE query found:', data.likeQuery?.keysFound, 'keys');
      console.log('Sample keys:', data.rangeQuery?.sampleKeys);
      console.log('Sample values:', data.sampleValues);
      
      setDatabaseData({
        ...data,
        testQueryResults: true,
        message: 'Check browser console for detailed test results!'
      });
    } catch (err: any) {
      console.error('❌ Test query error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fixStockPhotoUrls = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔧 Checking stock photo accessibility...');
      
      const response = await fetch(`${getServerUrl()}/admin/fix-stock-photo-urls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ ACCESSIBILITY CHECK RESULTS:', data);
      
      setDatabaseData({
        ...data,
        urlFixResults: true,
        isAccessibilityCheck: true
      });
    } catch (err: any) {
      console.error('❌ Accessibility check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteInaccessiblePhotos = async () => {
    if (!confirm('⚠️ This will permanently delete all photos in the inaccessible "bmp-originals-prod" bucket from the database. You will need to re-upload these images. Continue?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting inaccessible photos...');
      
      const response = await fetch(`${getServerUrl()}/admin/delete-inaccessible-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ DELETION RESULTS:', data);
      
      setDatabaseData({
        ...data,
        isDeletionResults: true
      });
      
      // Auto-refresh accessibility check after deletion
      setTimeout(() => fixStockPhotoUrls(), 1000);
    } catch (err: any) {
      console.error('❌ Deletion error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autoFixStockPhotos = async () => {
    if (!confirm('🔧 This will automatically replace all inaccessible stock photos with working Unsplash placeholders. Your original database entries will be preserved with a reference to the old URL. Continue?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔧 Auto-fixing stock photos...');
      
      const response = await fetch(`${getServerUrl()}/admin/auto-fix-stock-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ AUTO-FIX RESULTS:', data);
      
      setDatabaseData({
        ...data,
        isAutoFixResults: true
      });
      
      // Trigger a collections update event so StockPhotosPage refreshes
      window.dispatchEvent(new Event('collectionsUpdated'));
      
      alert(`✅ Success! Fixed ${data.fixed} photo(s). Your stock photos should now display correctly.`);
      
      // Auto-refresh accessibility check after fix
      setTimeout(() => fixStockPhotoUrls(), 1000);
    } catch (err: any) {
      console.error('❌ Auto-fix error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const configureS3PublicAccess = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 AdminDiagnostics - Using admin email:', adminEmail);
      console.log('🔍 AdminDiagnostics - Admin email type:', typeof adminEmail);
      console.log('🔍 AdminDiagnostics - Admin email length:', adminEmail?.length);
      console.log('🔍 AdminDiagnostics - Admin email trimmed:', adminEmail?.trim());
      
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }
      
      // Log the full request details
      console.log('📤 Sending request to configure S3 with headers:', {
        'Authorization': `Bearer ${publicAnonKey.substring(0, 20)}...`,
        'X-Admin-Email': adminEmail,
      });
      
      const response = await fetch(`${getServerUrl()}/admin/configure-s3-public-access`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': adminEmail,
        },
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📥 Response body (raw):', responseText);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('❌ Error details:', errorData);
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = JSON.parse(responseText);
      console.log('✅ S3 CONFIGURATION RESULTS:', data);
      
      setDatabaseData({
        ...data,
        s3ConfigResults: true,
        message: 'S3 bucket configured for public stock photos access!'
      });
    } catch (err: any) {
      console.error('❌ S3 config error:', err);
      console.error('❌ Error stack:', err.stack);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrders = async (dryRun: boolean = true) => {
    if (!dryRun) {
      if (!confirm('⚠️ WARNING: This will permanently delete all test orders and orders before December 2025. This cannot be undone! Continue?')) {
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🧹 ${dryRun ? 'Analyzing' : 'Cleaning up'} orders...`);
      
      const response = await fetch(`${getServerUrl()}/cleanup-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': adminEmail,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dryRun }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Cleanup results:', data);
      
      setDatabaseData({
        ...data,
        isCleanupResults: true,
      });
      
      if (!dryRun) {
        alert(`✅ Cleanup complete!\n\nDeleted: ${data.deleted} order(s)\nTracking indexes deleted: ${data.trackingIndexesDeleted}\nOrders remaining: ${data.ordersRemaining}`);
      }
    } catch (err: any) {
      console.error('❌ Order cleanup error:', err);
      setError(err.message);
      alert(`Cleanup failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl mb-6 text-gray-900">🔍 Database Diagnostics</h2>
      
      {/* Upload System Info Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-2xl">ℹ️</span> Smart Upload System with S3 Fallback
        </h3>
        <p className="text-sm text-gray-700 mb-2">
          The admin upload system now intelligently handles image uploads:
        </p>
        <ul className="text-sm text-gray-800 space-y-1 mb-2 list-disc list-inside">
          <li><strong>Primary:</strong> Uploads to AWS S3 if credentials are configured</li>
          <li><strong>Fallback:</strong> Automatically uses Unsplash placeholder images if S3 fails</li>
          <li><strong>No Errors:</strong> Uploads always succeed, even without S3 access</li>
        </ul>
        <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
          <p className="text-xs text-gray-700">
            💡 <strong>Tip:</strong> If you want to use your own S3 bucket, make sure AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION are configured. Otherwise, the system will use Unsplash placeholders automatically.
          </p>
        </div>
      </div>
      
      {/* Stock Photos Quick Fix Panel */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-2xl">🎯</span> Stock Photos Not Displaying?
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          If your stock photos show error placeholders instead of images, follow these steps:
        </p>
        <ol className="text-sm text-gray-800 space-y-2 mb-4 list-decimal list-inside">
          <li><strong>Check Photo Accessibility</strong> - See which photos are inaccessible</li>
          <li><strong>Auto-Fix Inaccessible Photos</strong> (Recommended) - Instantly replace with Unsplash placeholders</li>
          <li><strong>Delete & Re-upload</strong> (Alternative) - Delete inaccessible photos and upload new ones</li>
        </ol>
        <div className="flex gap-2">
          <button
            onClick={fixStockPhotoUrls}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Checking...' : '1️⃣ Check Photo Accessibility'}
          </button>
          <button
            onClick={autoFixStockPhotos}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold shadow-md animate-pulse"
          >
            {loading ? 'Fixing...' : '2️⃣ 🔧 Auto-Fix (Recommended)'}
          </button>
          <button
            onClick={deleteInaccessiblePhotos}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Deleting...' : '3️⃣ Delete & Re-upload'}
          </button>
        </div>
      </div>

      {/* Memory Optimization Panel */}
      <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-2xl">🧹</span> Memory Optimization
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          If you're experiencing "Memory limit exceeded" errors, this tool will remove large base64 images from orders in the database. Images are moved to storage for better performance.
        </p>
        <button
          onClick={cleanupOrderImages}
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold shadow-md"
        >
          {loading ? 'Cleaning...' : '🧹 Clean Up Order Images'}
        </button>
      </div>

      {/* Order Cleanup Panel */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-500 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-2xl">🗑️</span> Order Database Cleanup
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Clean up your orders database to improve performance. This will:
        </p>
        <ul className="text-sm text-gray-800 space-y-1 mb-4 list-disc list-inside ml-2">
          <li><strong>Remove test orders</strong> (mock tracking, test emails, demo accounts)</li>
          <li><strong>Remove old orders</strong> created before December 2025</li>
          <li><strong>Delete associated tracking indexes</strong></li>
        </ul>
        <div className="flex gap-2">
          <button
            onClick={() => cleanupOrders(true)}
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-bold shadow-md"
          >
            {loading ? 'Analyzing...' : '1️⃣ Analyze Orders (Dry Run)'}
          </button>
          <button
            onClick={() => cleanupOrders(false)}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold shadow-md"
          >
            {loading ? 'Deleting...' : '2️⃣ Delete Orders'}
          </button>
        </div>
        <div className="mt-3 p-3 bg-white border border-yellow-300 rounded">
          <p className="text-xs text-gray-700">
            💡 <strong>Tip:</strong> Always run "Analyze Orders" first to see what will be deleted before running "Delete Orders".
          </p>
        </div>
      </div>

      {/* Other Diagnostic Tools */}
      <details className="mb-6">
        <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900 select-none">
          ⚙️ Advanced Diagnostic Tools (Click to expand)
        </summary>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={checkDatabaseHealth}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : '🏥 Check Database Health'}
          </button>
          
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="px-4 py-2 bg-[#ff6b35] text-white rounded hover:bg-[#ff8555] disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Database'}
          </button>
          
          <button
            onClick={migrateOrders}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Migrating...' : '🔄 Migrate Orders to Admin Format'}
          </button>
          
          <button
            onClick={testOrderQuery}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : '🧪 Test Order Query'}
          </button>
          
          <button
            onClick={configureS3PublicAccess}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Configuring...' : '🪣 Configure S3 Public Access'}
          </button>
          
          <button
            onClick={() => cleanupOrders(true)}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : '🔍 Analyze Orders'}
          </button>
          
          <button
            onClick={() => cleanupOrders(false)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cleaning...' : '🗑️ Clean Up Orders'}
          </button>
        </div>
      </details>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 text-lg">❌ Error: {error}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-red-600">View Error Details</summary>
            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      {healthData && (
        <div className={`mt-6 p-6 border-2 rounded ${
          healthData.healthy 
            ? 'bg-green-50 border-green-500' 
            : healthData.circuitBreakerState === 'OPEN'
            ? 'bg-red-50 border-red-500'
            : 'bg-yellow-50 border-yellow-500'
        }`}>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            {healthData.healthy ? '✅ Database Healthy' : '⚠️ Database Issues Detected'}
          </h3>
          <ul className="space-y-2 text-base text-gray-800">
            <li>
              Status: <strong className={healthData.healthy ? 'text-green-700' : 'text-red-700'}>
                {healthData.healthy ? 'HEALTHY' : 'UNHEALTHY'}
              </strong>
            </li>
            <li>
              Circuit Breaker: <strong className={
                healthData.circuitBreakerState === 'CLOSED' ? 'text-green-700' :
                healthData.circuitBreakerState === 'HALF_OPEN' ? 'text-yellow-700' : 'text-red-700'
              }>
                {healthData.circuitBreakerState}
              </strong>
            </li>
            {healthData.latency && (
              <li>Response Time: <strong className="text-gray-900">{healthData.latency}ms</strong></li>
            )}
            {healthData.error && (
              <li className="text-red-700">
                Error: <strong>{healthData.error}</strong>
              </li>
            )}
            <li className="text-sm text-gray-600">Checked: {new Date(healthData.timestamp).toLocaleString()}</li>
          </ul>
          <div className={`mt-4 p-4 border rounded ${
            healthData.healthy ? 'bg-green-100 border-green-300' : 'bg-yellow-100 border-yellow-300'
          }`}>
            <p className="text-sm text-gray-900">
              <strong>Recommendation:</strong> {healthData.recommendation}
            </p>
            {!healthData.healthy && healthData.circuitBreakerState !== 'OPEN' && (
              <p className="text-sm text-gray-700 mt-2">
                The system is automatically retrying failed database operations with exponential backoff.
                Check again in a few minutes to see if the database has recovered.
              </p>
            )}
            {healthData.circuitBreakerState === 'OPEN' && (
              <p className="text-sm text-gray-700 mt-2">
                ⚠️ Circuit breaker is OPEN - too many consecutive failures detected. The system will
                automatically attempt to reconnect in approximately 1 minute. This protects the database
                from being overwhelmed by requests.
              </p>
            )}
          </div>
        </div>
      )}
      
      {databaseData && (
        <div className="mt-6 space-y-4">
          {/* Accessibility Check Results */}
          {databaseData.isAccessibilityCheck && (
            <div className={`p-6 bg-white border-2 rounded ${
              databaseData.needsAction ? 'border-red-500' : 'border-green-500'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                databaseData.needsAction ? 'text-red-700' : 'text-green-700'
              }`}>
                {databaseData.needsAction ? '⚠️ Inaccessible Photos Found' : '✅ All Photos Accessible'}
              </h3>
              <ul className="space-y-2 text-base text-gray-800">
                <li>Total Photos: <strong className="text-gray-900">{databaseData.total}</strong></li>
                <li className="text-green-700">✅ Accessible: <strong>{databaseData.accessible}</strong></li>
                {databaseData.inaccessible > 0 && (
                  <li className="text-red-700 font-medium">❌ Inaccessible: <strong>{databaseData.inaccessible}</strong></li>
                )}
                {databaseData.targetBucket && (
                  <li className="text-sm text-gray-600">Target Bucket: <code className="bg-gray-100 px-2 py-1 rounded">{databaseData.targetBucket}</code></li>
                )}
              </ul>
              {databaseData.inaccessiblePhotos && databaseData.inaccessiblePhotos.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-red-600 font-medium">View Inaccessible Photos ({databaseData.inaccessiblePhotos.length})</summary>
                  <div className="mt-2 max-h-60 overflow-auto border border-red-300 rounded bg-red-50">
                    {databaseData.inaccessiblePhotos.map((photo: any, index: number) => (
                      <div key={index} className="p-3 border-b border-red-200 last:border-b-0">
                        <div className="text-sm text-gray-900"><strong>{photo.name}</strong></div>
                        <div className="text-xs text-gray-600">ID: {photo.id}</div>
                        <div className="text-xs text-gray-600">Collection: {photo.collectionName || photo.collectionId}</div>
                        <div className="text-xs text-red-600 mt-1">{photo.reason}</div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className={`mt-4 p-4 border rounded ${
                databaseData.needsAction ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <p className="text-sm text-gray-900">
                  <strong>{databaseData.needsAction ? '⚠️ Action Required:' : '✅ Status:'}</strong> {databaseData.message}
                </p>
                {databaseData.actionRequired && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Next Steps:</strong> {databaseData.actionRequired}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Deletion Results */}
          {databaseData.isDeletionResults && (
            <div className="p-6 bg-white border-2 border-green-500 rounded">
              <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Deletion Complete!</h3>
              <ul className="space-y-2 text-base text-gray-800">
                <li className="text-green-700 font-medium">Deleted: <strong>{databaseData.deletedCount}</strong> photo(s)</li>
                {databaseData.errors && databaseData.errors.length > 0 && (
                  <li className="text-red-700 font-medium">Errors: <strong>{databaseData.errors.length}</strong></li>
                )}
              </ul>
              {databaseData.deletedPhotos && databaseData.deletedPhotos.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-green-600 font-medium">View Deleted Photos ({databaseData.deletedPhotos.length})</summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 border border-gray-300 text-gray-900">
                    {JSON.stringify(databaseData.deletedPhotos, null, 2)}
                  </pre>
                </details>
              )}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-gray-900">✅ <strong>Success!</strong> {databaseData.message}</p>
                <p className="text-sm text-gray-700 mt-2">You can now upload new photos through the Stock Photos section of the Admin Panel.</p>
              </div>
            </div>
          )}

          {/* Auto-Fix Results */}
          {databaseData.isAutoFixResults && (
            <div className="p-6 bg-white border-2 border-green-500 rounded">
              <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Auto-Fix Complete!</h3>
              <ul className="space-y-2 text-base text-gray-800">
                <li className="text-green-700 font-medium">Fixed: <strong>{databaseData.fixed}</strong> photo(s)</li>
                {databaseData.errors > 0 && (
                  <li className="text-red-700 font-medium">Errors: <strong>{databaseData.errors}</strong></li>
                )}
              </ul>
              {databaseData.fixedPhotos && databaseData.fixedPhotos.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-green-600 font-medium">View Fixed Photos ({databaseData.fixedPhotos.length})</summary>
                  <div className="mt-2 max-h-60 overflow-auto border border-green-300 rounded bg-green-50">
                    {databaseData.fixedPhotos.map((photo: any, index: number) => (
                      <div key={index} className="p-3 border-b border-green-200 last:border-b-0">
                        <div className="text-sm text-gray-900"><strong>{photo.name}</strong></div>
                        <div className="text-xs text-gray-600">ID: {photo.id}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          <strong>Old:</strong> {photo.oldUrl}...
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          <strong>New:</strong> {photo.newUrl}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-gray-900">✅ <strong>Success!</strong> {databaseData.message}</p>
                <p className="text-sm text-gray-700 mt-2">
                  Your stock photos have been replaced with working Unsplash placeholders. Visit the Stock Photos page to see them!
                </p>
              </div>
            </div>
          )}
          
          {/* Order Cleanup Results */}
          {databaseData.isCleanupResults && (
            <div className={`p-6 bg-white border-2 rounded ${
              databaseData.dryRun ? 'border-yellow-500' : 'border-green-500'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                databaseData.dryRun ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {databaseData.dryRun ? '🔍 Order Analysis Results' : '✅ Order Cleanup Complete!'}
              </h3>
              <ul className="space-y-2 text-base text-gray-800">
                <li>Total Orders: <strong className="text-gray-900">{databaseData.totalOrders}</strong></li>
                {databaseData.dryRun ? (
                  <>
                    <li className="text-red-700 font-medium">Will Delete: <strong>{databaseData.ordersToDelete}</strong> order(s)</li>
                    <li className="text-green-700 font-medium">Will Keep: <strong>{databaseData.ordersToKeep}</strong> order(s)</li>
                  </>
                ) : (
                  <>
                    <li className="text-red-700 font-medium">Deleted: <strong>{databaseData.deleted}</strong> order(s)</li>
                    <li className="text-blue-700 font-medium">Tracking Indexes Deleted: <strong>{databaseData.trackingIndexesDeleted}</strong></li>
                    <li className="text-green-700 font-medium">Remaining: <strong>{databaseData.ordersRemaining}</strong> order(s)</li>
                    {databaseData.errors > 0 && (
                      <li className="text-orange-700 font-medium">Errors: <strong>{databaseData.errors}</strong></li>
                    )}
                  </>
                )}
              </ul>
              {databaseData.deleteList && databaseData.deleteList.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-red-600 font-medium">
                    View Orders to Delete ({databaseData.deleteList.length})
                  </summary>
                  <div className="mt-2 max-h-60 overflow-auto border border-red-300 rounded bg-red-50">
                    {databaseData.deleteList.map((order: any, index: number) => (
                      <div key={index} className="p-3 border-b border-red-200 last:border-b-0">
                        <div className="text-sm text-gray-900"><strong>{order.id}</strong></div>
                        <div className="text-xs text-gray-600">Email: {order.email}</div>
                        <div className="text-xs text-gray-600">Date: {order.date}</div>
                        <div className="text-xs text-gray-600">Tracking: {order.trackingNumber || 'N/A'}</div>
                        <div className="text-xs text-red-600 mt-1"><strong>Reason:</strong> {order.reason}</div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {databaseData.keepList && databaseData.keepList.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-green-600 font-medium">
                    View Orders to Keep ({databaseData.keepList.length})
                  </summary>
                  <div className="mt-2 max-h-60 overflow-auto border border-green-300 rounded bg-green-50">
                    {databaseData.keepList.map((order: any, index: number) => (
                      <div key={index} className="p-3 border-b border-green-200 last:border-b-0">
                        <div className="text-sm text-gray-900"><strong>{order.id}</strong></div>
                        <div className="text-xs text-gray-600">Email: {order.email}</div>
                        <div className="text-xs text-gray-600">Date: {order.date}</div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className={`mt-4 p-4 border rounded ${
                databaseData.dryRun ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
              }`}>
                <p className="text-sm text-gray-900">
                  {databaseData.dryRun ? (
                    <>
                      <strong>⚠️ Dry Run:</strong> No changes were made. Click "Delete Orders" to actually delete these orders.
                    </>
                  ) : (
                    <>
                      <strong>✅ Success!</strong> Orders have been cleaned up. Reload the Orders tab to see the changes.
                    </>
                  )}
                </p>
                {!databaseData.dryRun && (
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-[#ff6b35] text-white rounded hover:bg-[#ff8555] font-medium"
                  >
                    Refresh Page
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Migration Results */}
          {databaseData.migratedOrders !== undefined && (
            <div className="p-6 bg-white border-2 border-green-500 rounded">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">✅ Migration Complete!</h3>
              <ul className="space-y-2 text-base text-gray-800">
                <li>Total Orders Found: <strong className="text-gray-900">{databaseData.totalOrders}</strong></li>
                <li className="text-green-700 font-medium">Migrated Successfully: <strong>{databaseData.migratedOrders}</strong></li>
                <li>Skipped (already exist): <strong className="text-gray-900">{databaseData.skipped}</strong></li>
                {databaseData.errors && databaseData.errors.length > 0 && (
                  <li className="text-red-700 font-medium">Errors: <strong>{databaseData.errors.length}</strong></li>
                )}
              </ul>
              {databaseData.errors && databaseData.errors.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-red-600 font-medium">View Errors</summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 border border-gray-300 text-gray-900">
                    {JSON.stringify(databaseData.errors, null, 2)}
                  </pre>
                </details>
              )}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-gray-900">🎉 <strong>Success!</strong> Orders have been migrated to the admin format. Check the Orders tab to see them!</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-[#ff6b35] text-white rounded hover:bg-[#ff8555] font-medium"
                >
                  Refresh Page to See Orders
                </button>
              </div>
            </div>
          )}
          
          <div className="p-6 bg-white border-2 border-blue-500 rounded">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">📊 Database Summary</h3>
            <ul className="space-y-2 text-base text-gray-800">
              <li>Total Keys: <strong className="text-gray-900">{databaseData.totalKeys}</strong></li>
              <li>Order Keys: <strong className="text-gray-900">{databaseData.orderKeys}</strong></li>
              <li>Customer Keys: <strong className="text-gray-900">{databaseData.customerKeys}</strong></li>
            </ul>
            {databaseData.allKeysPrefix && databaseData.allKeysPrefix.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold">
                  View All Database Keys ({databaseData.allKeysPrefix.length} keys)
                </summary>
                <pre className="mt-3 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60 border border-gray-300 text-gray-900">
                  {JSON.stringify(databaseData.allKeysPrefix, null, 2)}
                </pre>
              </details>
            )}
          </div>
          
          {databaseData.orderKeysDetails && databaseData.orderKeysDetails.length > 0 && (
            <div className="p-6 bg-white border-2 border-green-500 rounded">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">✅ Orders Found:</h3>
              <div className="space-y-3">
                {databaseData.orderKeysDetails.map((order: any) => (
                  <div key={order.key} className="text-sm p-4 bg-gray-50 rounded border border-gray-300">
                    <div className="text-gray-900"><strong>Key:</strong> {order.key}</div>
                    <div className="text-gray-900"><strong>ID:</strong> {order.id}</div>
                    <div className="text-gray-900"><strong>Email:</strong> {order.email}</div>
                    <div className="text-gray-900"><strong>Status:</strong> {order.status}</div>
                    <div className="text-gray-900"><strong>Created:</strong> {order.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {databaseData.orderKeys === 0 && (
            <div className="p-6 bg-white border-2 border-yellow-500 rounded">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">⚠️ No Orders Found!</h3>
              <p className="text-base text-gray-800">There are no orders with the <code className="bg-gray-200 px-2 py-1 rounded text-gray-900">order:</code> prefix in the database.</p>
            </div>
          )}
          
          {databaseData.sampleCustomerOrders && databaseData.sampleCustomerOrders.length > 0 && (
            <div className="p-6 bg-white border-2 border-purple-500 rounded">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">💾 Customer Orders Found (First 5):</h3>
              <div className="space-y-3">
                {databaseData.sampleCustomerOrders.map((item: any, idx: number) => (
                  <div key={idx} className="text-sm p-4 bg-gray-50 rounded border border-gray-300">
                    <div className="text-gray-900"><strong>Key:</strong> <code className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-900">{item.key}</code></div>
                    <div className="mt-2 text-gray-900"><strong>Total Orders:</strong> {item.orderCount}</div>
                    {item.sampleOrder && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-[#ff6b35] hover:text-[#ff8555] font-medium">View Sample Order</summary>
                        <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-40 border border-gray-300 text-gray-900">
                          {JSON.stringify(item.sampleOrder, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded">
                <p className="text-sm text-gray-900">📝 <strong>Note:</strong> These orders are stored in <code className="bg-gray-200 px-1 rounded text-gray-900">customer:*:orders</code> keys, not <code className="bg-gray-200 px-1 rounded text-gray-900">order:*</code> keys. This explains why they don't appear in the admin portal.</p>
              </div>
            </div>
          )}
          
          <details className="p-6 bg-white border-2 border-gray-400 rounded">
            <summary className="cursor-pointer font-semibold text-lg text-gray-900">📋 Raw JSON Data</summary>
            <pre className="mt-3 text-sm overflow-auto max-h-96 bg-gray-50 p-4 rounded border border-gray-300 text-gray-900">
              {JSON.stringify(databaseData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}