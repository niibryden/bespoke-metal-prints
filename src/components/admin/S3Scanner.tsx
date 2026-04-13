import { useState } from 'react';
import { Loader, AlertCircle, CheckCircle, FolderOpen } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface S3Folder {
  s3FolderId: string;
  photoCount: number;
  samplePhotos: string[];
}

interface Collection {
  id: string;
  name: string;
}

export function S3Scanner() {
  const [scanning, setScanning] = useState(false);
  const [s3Folders, setS3Folders] = useState<S3Folder[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [recovering, setRecovering] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/server/make-server-3e3a9cd7`;

  const scanS3 = async () => {
    setScanning(true);
    setError(null);
    try {
      const response = await fetch(`${serverUrl}/admin/recover-from-s3`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // No mapping = just scan
      });

      if (response.ok) {
        const data = await response.json();
        if (data.needsMapping) {
          setS3Folders(data.s3Folders);
          setCollections(data.existingCollections);
          
          // Auto-map if collection IDs match
          const autoMapping: Record<string, string> = {};
          data.s3Folders.forEach((folder: S3Folder) => {
            const matchingCollection = data.existingCollections.find(
              (c: Collection) => c.id === folder.s3FolderId
            );
            if (matchingCollection) {
              autoMapping[folder.s3FolderId] = matchingCollection.id;
            }
          });
          setMapping(autoMapping);
        }
        console.log('S3 Scan Result:', data);
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

  const recoverWithMapping = async () => {
    setRecovering(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`${serverUrl}/admin/recover-from-s3`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionMapping: mapping,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        console.log('Recovery Result:', data);
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">
            S3 Photo Recovery
          </h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
            Scan S3 bucket and recover photos to collections
          </p>
        </div>
        <button
          onClick={scanS3}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-500 font-medium mb-1">Error</h3>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {s3Folders.length > 0 && !result && (
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
            <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-4">
              S3 Folders Found ({s3Folders.length})
            </h3>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-4">
              Map each S3 folder to an existing collection, or leave unmapped to create new collections
            </p>
            
            <div className="space-y-4">
              {s3Folders.map((folder) => (
                <div
                  key={folder.s3FolderId}
                  className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-white [data-theme='light']_&:text-gray-900 font-medium mb-1">
                        S3 Folder: {folder.s3FolderId}
                      </div>
                      <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                        {folder.photoCount} photos
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Sample: {folder.samplePhotos.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2 block">
                      Map to collection:
                    </label>
                    <select
                      value={mapping[folder.s3FolderId] || ''}
                      onChange={(e) => setMapping({
                        ...mapping,
                        [folder.s3FolderId]: e.target.value,
                      })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900"
                    >
                      <option value="">Create new collection</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={recoverWithMapping}
              disabled={recovering || Object.keys(mapping).length === 0}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recovering ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Recovering Photos...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Recover {s3Folders.reduce((sum, f) => sum + f.photoCount, 0)} Photos
                </>
              )}
            </button>
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
                Successfully recovered {result.photosRecovered} photos
                {result.photosSkipped > 0 && ` (skipped ${result.photosSkipped} duplicates)`}
              </p>
            </div>
          </div>
          
          {result.actions && result.actions.length > 0 && (
            <div className="bg-[#0a0a0a] [data-theme='light']_&:bg-white/50 rounded-lg p-3 mt-3">
              <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2 font-medium">
                Actions Taken:
              </p>
              <ul className="space-y-1">
                {result.actions.map((action: string, idx: number) => (
                  <li key={idx} className="text-xs text-gray-300 [data-theme='light']_&:text-gray-700">
                    • {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={() => {
              setResult(null);
              setS3Folders([]);
              setMapping({});
            }}
            className="mt-4 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all text-sm"
          >
            Done
          </button>
        </div>
      )}

      {!s3Folders.length && !scanning && !result && (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
            S3 Photo Recovery
          </h3>
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600 mb-6">
            Click "Scan S3 Bucket" to find photos in S3 and map them to collections
          </p>
        </div>
      )}
    </div>
  );
}