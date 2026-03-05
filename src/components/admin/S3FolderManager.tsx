import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderOpen, Edit2, Check, X, Loader, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { getServerUrl } from '../../utils/serverUrl';

interface S3Folder {
  currentName: string;
  prefix: string;
  fileCount: number;
  sampleFiles: {
    key: string;
    name: string;
    url: string;
    size?: number;
    lastModified?: string;
  }[];
}

export function S3FolderManager({ adminInfo }: { adminInfo: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  const [folders, setFolders] = useState<S3Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);

  const serverUrl = getServerUrl();
  const getAuthHeader = () => {
    console.log('🔑 S3FolderManager - accessToken exists:', !!adminInfo.accessToken);
    console.log('🔑 S3FolderManager - accessToken preview:', adminInfo.accessToken?.substring(0, 20) + '...');
    return `Bearer ${adminInfo.accessToken}`;
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📂 Loading S3 folders from:', `${serverUrl}/admin/s3-folders`);
      console.log('📂 Auth header:', getAuthHeader().substring(0, 30) + '...');
      
      const response = await fetch(`${serverUrl}/admin/s3-folders`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      console.log('📂 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📂 Folders loaded:', data.folders?.length || 0);
        setFolders(data.folders || []);
      } else {
        const errorData = await response.json();
        console.error('📂 Error response:', errorData);
        setError(errorData.error || 'Failed to load folders');
      }
    } catch (err: any) {
      console.error('Failed to load folders:', err);
      setError(err.message || 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const startRename = (folder: S3Folder) => {
    setEditingFolder(folder.currentName);
    setNewName(folder.currentName);
  };

  const cancelRename = () => {
    setEditingFolder(null);
    setNewName('');
  };

  const renameFolder = async (oldName: string) => {
    if (!newName.trim() || newName === oldName) {
      cancelRename();
      return;
    }

    // Check if new name already exists
    if (folders.some(f => f.currentName === newName.trim())) {
      alert('A folder with that name already exists!');
      return;
    }

    if (!confirm(`Rename folder "${oldName}" to "${newName}"?\n\nThis will move all files in S3 and cannot be undone.`)) {
      return;
    }

    setRenaming(oldName);

    try {
      const response = await fetch(`${serverUrl}/admin/s3-rename-folder`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldFolderName: oldName,
          newFolderName: newName.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Success!\n\nCopied: ${result.copiedCount} files\nDeleted: ${result.deletedCount} old files${result.errors ? `\n\nErrors: ${result.errors.length}` : ''}`);
        
        // Reload folders
        await loadFolders();
        cancelRename();
      } else {
        const errorData = await response.json();
        alert(`Failed to rename folder: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Rename error:', err);
      alert(`Failed to rename folder: ${err.message}`);
    } finally {
      setRenaming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-[#ff6b35] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-500 font-medium mb-1">Error Loading Folders</h3>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
        <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
          No Folders Found
        </h3>
        <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
          No folders found in your S3 bucket under the stock-photos/ prefix
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-400 mb-2">
              <strong>Reorganize Your S3 Folders</strong>
            </p>
            <p className="text-blue-300">
              Give your timestamp-based folders readable names like "Tropical Beaches" or "Urban Architecture".
            </p>
            <p className="text-blue-300 mt-2">
              <strong>What happens when you rename:</strong>
            </p>
            <ul className="list-disc list-inside text-blue-300 mt-1 space-y-1">
              <li>All files are moved to the new folder name in S3</li>
              <li>Collection URLs are automatically updated in the database</li>
              <li>Changes take effect immediately across your site</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {folders.map((folder) => (
          <motion.div
            key={folder.currentName}
            layout
            className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-4"
          >
            {/* Folder Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <FolderOpen className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  {editingFolder === folder.currentName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded text-white [data-theme='light']_&:text-gray-900 text-sm"
                        placeholder="New folder name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') renameFolder(folder.currentName);
                          if (e.key === 'Escape') cancelRename();
                        }}
                      />
                      <button
                        onClick={() => renameFolder(folder.currentName)}
                        disabled={renaming === folder.currentName}
                        className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelRename}
                        disabled={renaming === folder.currentName}
                        className="p-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-white [data-theme='light']_&:text-gray-900 font-mono break-all">
                        {folder.currentName}
                      </h3>
                      <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
                        {folder.fileCount} files
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {editingFolder !== folder.currentName && (
                <button
                  onClick={() => startRename(folder)}
                  disabled={renaming !== null}
                  className="p-2 text-gray-400 hover:text-[#ff6b35] hover:bg-[#2a2a2a] [data-theme='light']_&:hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                >
                  {renaming === folder.currentName ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Sample Images */}
            {folder.sampleFiles.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Preview ({folder.sampleFiles.length} shown)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {folder.sampleFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-[#0a0a0a] [data-theme='light']_&:bg-gray-100 rounded overflow-hidden"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <p className="text-sm text-yellow-400">
          <strong>⚠️ Important:</strong> After reorganizing folders, remember to:
        </p>
        <ol className="list-decimal list-inside text-sm text-yellow-300 mt-2 space-y-1 ml-4">
          <li>Go to the <strong>Manage Photos</strong> tab</li>
          <li>Click <strong>"Clear All Collections"</strong></li>
          <li>Go to <strong>Database Cleanup</strong> tab</li>
          <li>Click <strong>"Recover Photos from S3"</strong></li>
          <li>Your collections will now have the new, readable names!</li>
        </ol>
      </div>
    </div>
  );
}