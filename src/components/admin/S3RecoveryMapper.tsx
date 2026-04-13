import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, FolderOpen, Link, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface S3Folder {
  folderId: string;
  fileCount: number;
  sampleFiles: string[];
  samplePaths?: string[];
}

interface Collection {
  id: string;
  name: string;
  photoCount: number;
}

interface Mapping {
  s3FolderId: string;
  collectionId: string;
  createNew?: boolean;
  newCollectionName?: string;
}

export function S3RecoveryMapper() {
  const [scanning, setScanning] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [s3Folders, setS3Folders] = useState<S3Folder[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [mappings, setMappings] = useState<Map<string, Mapping>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/server/make-server-3e3a9cd7`;

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await fetch(`${serverUrl}/admin/collections-list`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
        console.log(`Loaded ${data.collections?.length || 0} collections`);
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
  };

  const scanS3 = async () => {
    setScanning(true);
    setError(null);
    setS3Folders([]);
    
    try {
      const response = await fetch(`${serverUrl}/admin/scan-s3-folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setS3Folders(data.folders || []);
        
        // Auto-map folders to existing collections by name similarity
        const newMappings = new Map<string, Mapping>();
        data.folders.forEach((folder: S3Folder) => {
          // Try to find matching collection by ID
          const matchingCollection = collections.find(c => c.id === folder.folderId);
          if (matchingCollection) {
            newMappings.set(folder.folderId, {
              s3FolderId: folder.folderId,
              collectionId: matchingCollection.id,
            });
          }
        });
        setMappings(newMappings);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to scan S3');
      }
    } catch (err) {
      console.error('Failed to scan S3:', err);
      setError('Failed to scan S3. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const updateMapping = (s3FolderId: string, collectionId: string) => {
    const newMappings = new Map(mappings);
    
    if (collectionId === 'CREATE_NEW') {
      newMappings.set(s3FolderId, {
        s3FolderId,
        collectionId: s3FolderId,
        createNew: true,
        newCollectionName: `Collection ${s3FolderId.substring(0, 8)}`,
      });
    } else {
      newMappings.set(s3FolderId, {
        s3FolderId,
        collectionId,
      });
    }
    
    setMappings(newMappings);
  };

  const updateNewCollectionName = (s3FolderId: string, name: string) => {
    const newMappings = new Map(mappings);
    const mapping = newMappings.get(s3FolderId);
    if (mapping && mapping.createNew) {
      mapping.newCollectionName = name;
      newMappings.set(s3FolderId, mapping);
      setMappings(newMappings);
    }
  };

  const recoverWithMappings = async () => {
    setRecovering(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`${serverUrl}/admin/recover-from-s3-mapped`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mappings: Array.from(mappings.values()),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        console.log('Recovery complete:', data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to recover photos');
      }
    } catch (err) {
      console.error('Failed to recover photos:', err);
      setError('Failed to recover photos. Please try again.');
    } finally {
      setRecovering(false);
    }
  };

  const clearMappings = () => {
    setClearing(true);
    setMappings(new Map());
    setS3Folders([]);
    setResult(null);
    setClearing(false);
  };

  const clearAllPhotos = async () => {
    if (!confirm('⚠️ This will DELETE ALL PHOTOS from the database. Collections will remain. Are you sure?')) {
      return;
    }
    
    setClearing(true);
    setError(null);
    
    try {
      const response = await fetch(`${serverUrl}/admin/clear-all-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Deleted ${data.photosDeleted} photos`);
        alert(`✅ Deleted ${data.photosDeleted} photos. You can now do a fresh recovery.`);
        loadCollections(); // Reload to show 0 photos
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to clear photos');
      }
    } catch (err) {
      console.error('Failed to clear photos:', err);
      setError('Failed to clear photos. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  const allMapped = s3Folders.every(folder => mappings.has(folder.folderId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">
            S3 Photo Recovery
          </h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
            Scan S3 bucket and map folders to existing collections
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearAllPhotos}
            disabled={clearing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {clearing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                Clear All Photos
              </>
            )}
          </button>
          <button
            onClick={scanS3}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <FolderOpen className="w-4 h-4" />
                Scan S3 Bucket
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

      {result && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-green-500 font-medium mb-1">Recovery Complete!</h3>
              <p className="text-sm text-green-400">
                Recovered {result.photosRecovered} photos
                {result.collectionsCreated > 0 && ` • Created ${result.collectionsCreated} new collections`}
                {result.photosSkipped > 0 && ` • Skipped ${result.photosSkipped} duplicates`}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setResult(null);
              setS3Folders([]);
              setMappings(new Map());
              loadCollections();
            }}
            className="mt-4 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Start Over
          </button>
        </div>
      )}

      {/* S3 Folders Mapping */}
      {s3Folders.length > 0 && !result && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
            <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-4 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Map S3 Folders to Collections
            </h3>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-6">
              Found {s3Folders.length} folders in S3. Map each to an existing collection or create a new one.
            </p>

            <div className="space-y-4">
              {s3Folders.map((folder) => {
                const mapping = mappings.get(folder.folderId);
                const isNewCollection = mapping?.createNew;
                
                return (
                  <div
                    key={folder.folderId}
                    className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg space-y-3"
                  >
                    {/* Folder Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-white [data-theme='light']_&:text-gray-900 font-medium flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                          {folder.folderId}
                        </div>
                        <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
                          {folder.fileCount} files • {folder.sampleFiles.join(', ')}
                        </div>
                        {folder.samplePaths && folder.samplePaths.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                              Show file paths (debug)
                            </summary>
                            <div className="mt-2 space-y-1">
                              {folder.samplePaths.map((path, idx) => (
                                <div key={idx} className="text-xs font-mono text-gray-600 [data-theme='light']_&:text-gray-500">
                                  {path}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Collection Selector */}
                    <div className="flex gap-3">
                      <select
                        value={isNewCollection ? 'CREATE_NEW' : mapping?.collectionId || ''}
                        onChange={(e) => updateMapping(folder.folderId, e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900"
                      >
                        <option value="">-- Select Collection --</option>
                        {collections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name} ({collection.photoCount} photos)
                          </option>
                        ))}
                        <option value="CREATE_NEW">✨ Create New Collection</option>
                      </select>
                      
                      {mapping && (
                        <div className="flex items-center px-3 py-2 bg-green-500/20 border border-green-500/20 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>

                    {/* New Collection Name Input */}
                    {isNewCollection && (
                      <input
                        type="text"
                        value={mapping.newCollectionName || ''}
                        onChange={(e) => updateNewCollectionName(folder.folderId, e.target.value)}
                        placeholder="Enter new collection name..."
                        className="w-full px-3 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 placeholder-gray-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recover Button */}
            <div className="mt-6 pt-6 border-t border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
              <button
                onClick={recoverWithMappings}
                disabled={!allMapped || recovering}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {recovering ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Recovering {s3Folders.reduce((sum, f) => sum + f.fileCount, 0)} Photos...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Recover {s3Folders.reduce((sum, f) => sum + f.fileCount, 0)} Photos
                  </>
                )}
              </button>
              {!allMapped && (
                <p className="text-sm text-yellow-500 text-center mt-2">
                  Please map all folders before recovering
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {s3Folders.length === 0 && !scanning && !result && (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
            S3 Photo Recovery
          </h3>
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
            Click "Scan S3 Bucket" to find photos that need to be recovered
          </p>
        </div>
      )}
    </div>
  );
}