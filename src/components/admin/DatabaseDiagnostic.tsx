import { projectId, publicAnonKey } from '../../utils/supabase/config';
import { getServerUrl } from '../../utils/server-config';

interface DiagnosticData {
  summary: {
    totalCollections: number;
    totalPhotos: number;
    totalOrphaned: number;
  };
  collections: Array<{
    id: string;
    name: string;
    photoCount: number;
    createdAt: string;
  }>;
  orphanedPhotosByCollection: Array<{
    deletedCollectionId: string;
    orphanedPhotoCount: number;
    samplePhotos: string[];
  }>;
  allPhotos: Array<{
    id: string;
    name: string;
    collectionId: string;
    hasUrl: boolean;
  }>;
}

type Tab = 'diagnostic' | 's3recovery';

export function DatabaseDiagnostic() {
  const [activeTab, setActiveTab] = useState<Tab>('s3recovery');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fixingErrors, setFixingErrors] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  const serverUrl = getServerUrl();

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
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
        const result = await response.json();
        setData(result);
        console.log('Database Diagnostic:', result);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to run diagnostic');
      }
    } catch (err) {
      console.error('Failed to run diagnostic:', err);
      setError('Failed to run diagnostic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fixOrphanedPhotos = async () => {
    setFixingErrors(true);
    setFixResult(null);
    try {
      const response = await fetch(`${serverUrl}/admin/auto-fix-orphaned-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Email': 'admin@bespokemetalprints.com',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setFixResult(result);
        console.log('Fix Orphaned Photos:', result);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fix orphaned photos');
      }
    } catch (err) {
      console.error('Failed to fix orphaned photos:', err);
      setError('Failed to fix orphaned photos. Please try again.');
    } finally {
      setFixingErrors(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('s3recovery')}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
            activeTab === 's3recovery'
              ? 'bg-[#ff6b35] text-white shadow-md'
              : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:text-gray-600 [data-theme=\'light\']_&:hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FolderOpen className="w-5 h-5" />
            S3 Recovery
          </div>
        </button>
        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
            activeTab === 'diagnostic'
              ? 'bg-[#ff6b35] text-white shadow-md'
              : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:text-gray-600 [data-theme=\'light\']_&:hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Database className="w-5 h-5" />
            View Database
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 's3recovery' && <S3RecoveryMapper />}
      
      {activeTab === 'diagnostic' && (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">
                Database Diagnostic
              </h2>
              <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
                Check the current state of collections and photos in the database
              </p>
            </div>
            <button
              onClick={runDiagnostic}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Run Diagnostic
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

          {data && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
                <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-4">
                  Database Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl text-[#ff6b35] mb-1">
                      {data.summary.totalCollections}
                    </div>
                    <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                      Total Collections
                    </div>
                  </div>
                  <div className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl text-[#ff6b35] mb-1">
                      {data.summary.totalPhotos}
                    </div>
                    <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                      Total Photos
                    </div>
                  </div>
                  <div className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-4 rounded-lg">
                    <div className={`text-2xl mb-1 ${data.summary.totalOrphaned > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {data.summary.totalOrphaned}
                    </div>
                    <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                      Orphaned Photos
                    </div>
                  </div>
                </div>
              </div>

              {/* Collections */}
              <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
                <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-4">
                  Collections ({data.collections.length})
                </h3>
                {data.collections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                    <p>No collections found in database</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="text-white [data-theme='light']_&:text-gray-900 font-medium">
                            {collection.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {collection.id} • Created: {new Date(collection.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          collection.photoCount > 0
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {collection.photoCount} photos
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Orphaned Photos */}
              {data.orphanedPhotosByCollection.length > 0 && (
                <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-yellow-500/20 rounded-lg p-6">
                  <h3 className="text-lg text-yellow-500 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Orphaned Photos Found
                  </h3>
                  <div className="space-y-3">
                    {data.orphanedPhotosByCollection.map((orphan, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="text-white [data-theme='light']_&:text-gray-900 font-medium mb-2">
                          Deleted Collection ID: {orphan.deletedCollectionId}
                        </div>
                        <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                          {orphan.orphanedPhotoCount} orphaned photos
                        </div>
                        <div className="text-xs text-gray-500">
                          Sample photos: {orphan.samplePhotos.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={fixOrphanedPhotos}
                    disabled={fixingErrors}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {fixingErrors ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Auto-Fix Orphaned Photos
                      </>
                    )}
                  </button>
                  {fixResult && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-green-500 font-medium mb-1">Photos Fixed Successfully!</h3>
                          <p className="text-sm text-green-400">
                            Fixed {fixResult.fixed} photos
                            {fixResult.createdCollections > 0 && ` • Created ${fixResult.createdCollections} new collections`}
                          </p>
                        </div>
                      </div>
                      
                      {fixResult.actions && fixResult.actions.length > 0 && (
                        <div className="bg-[#0a0a0a] [data-theme='light']_&:bg-white/50 rounded-lg p-3 mt-3">
                          <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2 font-medium">Actions Taken:</p>
                          <ul className="space-y-1">
                            {fixResult.actions.map((action: string, idx: number) => (
                              <li key={idx} className="text-xs text-gray-300 [data-theme='light']_&:text-gray-700">
                                • {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setFixResult(null);
                          runDiagnostic();
                        }}
                        className="mt-3 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all text-sm"
                      >
                        Run Diagnostic Again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sample Photos */}
              {data.allPhotos.length > 0 && (
                <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-4">
                    Sample Photos (first 10)
                  </h3>
                  <div className="space-y-2">
                    {data.allPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 p-3 rounded-lg flex items-center justify-between text-sm"
                      >
                        <div className="flex-1">
                          <div className="text-white [data-theme='light']_&:text-gray-900">
                            {photo.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Collection ID: {photo.collectionId}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {photo.hasUrl ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            {photo.hasUrl ? 'Has URL' : 'No URL'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!data && !loading && (
            <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
                Database Diagnostic
              </h3>
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600 mb-6">
                Click "Run Diagnostic" to check what's in the database
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}