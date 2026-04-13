import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getServerUrl } from '../../utils/server-config';

interface OrphanedCollection {
  collectionId: string;
  photoCount: number;
  samplePhotoNames: string[];
  photos: Array<{
    id: string;
    name: string;
    url: string;
    optimizedUrl?: string;
    uploadedAt: string;
  }>;
}

interface RecoverData {
  orphanedCount: number;
  deletedCollectionsCount: number;
  deletedCollections: OrphanedCollection[];
  canRecover: boolean;
}

export function RecoverOrphanedPhotos() {
  const [loading, setLoading] = useState(false);
  const [recoverData, setRecoverData] = useState<RecoverData | null>(null);
  const [recovering, setRecovering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const serverUrl = getServerUrl();

  // Load orphaned photos on mount
  useEffect(() => {
    scanForOrphans();
  }, []);

  const scanForOrphans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${serverUrl}/admin/recover-orphaned-photos`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com', // You may need to pass actual admin email
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecoverData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to scan for orphaned photos');
      }
    } catch (err) {
      console.error('Failed to scan for orphans:', err);
      setError('Failed to scan for orphaned photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const recoverCollection = async (orphanedCollectionId: string, suggestedName: string) => {
    setRecovering(orphanedCollectionId);
    try {
      const collectionName = prompt(
        `Enter a name for the recovered collection:\n\n${suggestedName}`,
        suggestedName
      );

      if (!collectionName) {
        setRecovering(null);
        return;
      }

      const response = await fetch(`${serverUrl}/admin/create-collection-from-orphans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName,
          description: 'Recovered collection',
          orphanedCollectionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Success! Recovered ${data.photosRecovered} photos into collection "${collectionName}"`);
        
        // Refresh the scan
        await scanForOrphans();
        
        // Notify other components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const errorData = await response.json();
        alert(`Failed to recover collection: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to recover collection:', err);
      alert('Failed to recover collection. Please try again.');
    } finally {
      setRecovering(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">
            Recover Orphaned Photos
          </h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
            Find and restore photos from deleted collections
          </p>
        </div>
        <button
          onClick={scanForOrphans}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Scan for Orphans
            </>
          )}
        </button>
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

      {recoverData && (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4">
              {recoverData.canRecover ? (
                <>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-lg font-medium">
                      {recoverData.orphanedCount} Orphaned Photos Found
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-6 h-6" />
                    <span className="text-lg font-medium">
                      No Orphaned Photos Found
                    </span>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-2">
              {recoverData.canRecover
                ? `Found ${recoverData.deletedCollectionsCount} deleted collection(s) with photos still in the database`
                : 'All photos are properly associated with collections'}
            </p>
          </div>

          {recoverData.canRecover && (
            <div className="space-y-4">
              <h3 className="text-white [data-theme='light']_&:text-gray-900 font-medium mb-4">
                Deleted Collections to Recover:
              </h3>
              {recoverData.deletedCollections.map((collection) => (
                <div
                  key={collection.collectionId}
                  className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderPlus className="w-5 h-5 text-[#ff6b35]" />
                        <h4 className="text-white [data-theme='light']_&:text-gray-900 font-medium">
                          Collection ID: {collection.collectionId.substring(0, 12)}...
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-3">
                        Contains {collection.photoCount} photo{collection.photoCount !== 1 ? 's' : ''}
                      </p>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 [data-theme='light']_&:text-gray-600 mb-2">
                          Sample photos:
                        </p>
                        <ul className="space-y-1">
                          {collection.samplePhotoNames.map((name, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-gray-400 [data-theme='light']_&:text-gray-700 pl-4"
                            >
                              • {name}
                            </li>
                          ))}
                          {collection.photoCount > 5 && (
                            <li className="text-xs text-gray-500 [data-theme='light']_&:text-gray-600 pl-4">
                              ... and {collection.photoCount - 5} more
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {collection.photos.slice(0, 5).map((photo) => (
                          <div
                            key={photo.id}
                            className="aspect-square rounded overflow-hidden border border-[#2a2a2a] [data-theme='light']_&:border-gray-300"
                          >
                            <img
                              src={photo.optimizedUrl || photo.url}
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        recoverCollection(
                          collection.collectionId,
                          `Recovered Collection (${collection.photoCount} photos)`
                        )
                      }
                      disabled={recovering === collection.collectionId}
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {recovering === collection.collectionId ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Recovering...
                        </>
                      ) : (
                        <>
                          <FolderPlus className="w-4 h-4" />
                          Recover Collection
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!recoverData && !loading && (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
          <RefreshCw className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
            Scan for Orphaned Photos
          </h3>
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600 mb-6">
            Click the "Scan for Orphans" button to check if there are any photos from deleted
            collections that can be recovered
          </p>
        </div>
      )}
    </div>
  );
}