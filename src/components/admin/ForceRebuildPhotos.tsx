import { projectId, publicAnonKey } from '../../utils/supabase/config';
import { getServerUrl } from '../../utils/server-config';

interface Photo {
  id: string;
  name: string;
  url: string;
  optimizedUrl?: string;
  collectionId: string;
  uploadedAt: string;
}

interface Collection {
  id: string;
  name: string;
}

export function ForceRebuildPhotos() {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildError, setRebuildError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const serverUrl = getServerUrl();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${serverUrl}/admin/database-diagnostic`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Get all photos
        const allPhotosResponse = await fetch(`${serverUrl}/admin/get-all-photos`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Email': 'admin@bespokemetalprints.com',
          },
        });

        if (allPhotosResponse.ok) {
          const photosData = await allPhotosResponse.json();
          setPhotos(photosData.photos || []);
        }

        setCollections(data.collections || []);
        
        console.log('Loaded data:', {
          photos: photos.length,
          collections: collections.length,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load data');
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (photoId: string, collectionId: string) => {
    setAssignments(prev => ({
      ...prev,
      [photoId]: collectionId,
    }));
  };

  const rebuildAssignments = async () => {
    setRebuilding(true);
    setRebuildError(null);
    setStatusMessage('');

    try {
      const response = await fetch(`${serverUrl}/admin/force-reassign-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMessage(`✅ Successfully reassigned ${data.reassignedCount} photos!`);
        
        // Refresh data
        await loadData();
        
        // Notify other components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const errorData = await response.json();
        setRebuildError(errorData.error || 'Failed to rebuild assignments');
      }
    } catch (err) {
      console.error('Failed to rebuild:', err);
      setRebuildError('Failed to rebuild assignments. Please try again.');
    } finally {
      setRebuilding(false);
    }
  };

  const assignedCount = Object.keys(assignments).length;
  const canRebuild = assignedCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">
            Force Rebuild Photo Assignments
          </h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
            Manually assign photos to collections to fix database issues
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={rebuildAssignments}
            disabled={!canRebuild || rebuilding}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rebuilding ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Rebuilding...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Rebuild {assignedCount > 0 ? `(${assignedCount})` : ''}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-500 font-medium mb-1">Error</h3>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-green-500 font-medium mb-1">Success</h3>
            <p className="text-sm text-green-400">{statusMessage}</p>
          </div>
        </div>
      )}

      {rebuildError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-500 font-medium mb-1">Error</h3>
            <p className="text-sm text-red-400">{rebuildError}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-[#ff6b35]" />
        </div>
      ) : (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-4">
            Photos ({photos.length}) - Assign to Collections
          </h3>

          {photos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" />
              <p>No photos found in database</p>
            </div>
          ) : (
            <div className="space-y-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg flex items-center gap-4"
                >
                  {/* Photo Preview */}
                  <div className="w-20 h-20 rounded overflow-hidden border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 flex-shrink-0">
                    <img
                      src={photo.optimizedUrl || photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Photo Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white [data-theme='light']_&:text-gray-900 font-medium truncate">
                      {photo.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Current Collection ID: <span className="font-mono">{photo.collectionId || 'None'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Collection Selector */}
                  <div className="w-64 flex-shrink-0">
                    <select
                      value={assignments[photo.id] || photo.collectionId || ''}
                      onChange={(e) => handleAssignmentChange(photo.id, e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 text-sm"
                    >
                      <option value="">Select Collection...</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {assignments[photo.id] ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : photo.collectionId ? (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {photos.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-blue-400 font-medium mb-2">How to Use</h3>
          <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
            <li>Review each photo and select the correct collection from the dropdown</li>
            <li>Photos with a green checkmark will be reassigned</li>
            <li>Click "Rebuild" to save all assignments</li>
            <li>Check the Browse tab to verify photos appear in collections</li>
          </ol>
        </div>
      )}
    </div>
  );
}