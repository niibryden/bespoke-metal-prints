import { useState, useRef, useMemo, useEffect } from 'react';
import { Upload, Folder, Edit2, Trash2, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getServerUrl } from '../../utils/serverUrl';
import { getSupabaseClient } from '../../utils/supabase/client';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  title: string;
  collection: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  images?: any[];
  createdAt: string;
}

export function StockPhotoUpload({ adminInfo }: { adminInfo?: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  // Helper to get auth header with admin access token
  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken || publicAnonKey}`;
  
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollection, setNewCollection] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editCollectionName, setEditCollectionName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serverUrl = getServerUrl();

  const supabase = useMemo(() => getSupabaseClient(), []);

  // Load collections on mount and listen for updates
  useEffect(() => {
    fetchCollections();

    // Listen for collection updates from other components
    const handleCollectionsUpdated = () => {
      console.log('Collections updated event received in Upload, refreshing...');
      fetchCollections();
    };

    window.addEventListener('collectionsUpdated', handleCollectionsUpdated);

    return () => {
      window.removeEventListener('collectionsUpdated', handleCollectionsUpdated);
    };
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${serverUrl}/admin/collections`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
        cache: 'no-store', // Prevent browser from caching the response
      });

      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newPhotos: UploadedPhoto[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      collection: collections[0] ? collections[0].name : '',
      status: 'pending',
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const updatePhoto = (id: string, updates: Partial<UploadedPhoto>) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, ...updates } : photo
    ));
  };

  const removePhoto = (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const addCollection = async () => {
    if (!newCollection.trim() || collections.some(c => c.name === newCollection.trim())) {
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/admin/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({ name: newCollection.trim() }),
      });

      if (response.ok) {
        // Fetch all collections again to get updated list
        await fetchCollections();
        setNewCollection('');
        setShowNewCollection(false);
      }
    } catch (error) {
      console.error('Failed to add collection:', error);
    }
  };

  const renameCollection = async (oldName: string, newName: string) => {
    if (!newName.trim() || newName.trim() === oldName) {
      setEditingCollection(null);
      return;
    }

    try {
      // Find the collection to get its ID
      const collection = collections.find(c => c.name === oldName);
      if (!collection) {
        alert('Collection not found');
        return;
      }

      // Ensure collection has an ID
      if (!collection.id) {
        alert('Collection has no ID');
        return;
      }

      // Extract just the numeric part of the ID if it starts with "collection:"
      // Otherwise use the ID as-is (newer format is just numeric)
      const collectionId = typeof collection.id === 'string' && collection.id.startsWith('collection:') 
        ? collection.id.replace('collection:', '') 
        : collection.id;
      
      const response = await fetch(`${serverUrl}/admin/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        // Fetch all collections again to get updated list
        await fetchCollections();
        setEditingCollection(null);
        setEditCollectionName('');
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const error = await response.json();
        alert(`Failed to rename collection: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to rename collection:', error);
      alert('Failed to rename collection. Please try again.');
    }
  };

  const deleteCollection = async (collectionName: string) => {
    if (!confirm(`Are you sure you want to delete the collection \"${collectionName}\"? This will also delete all photos in this collection.`)) {
      return;
    }

    // Find the collection to get its ID
    const collection = collections.find(c => c.name === collectionName);
    if (!collection) {
      alert('Collection not found');
      return;
    }

    // Ensure collection has an ID
    if (!collection.id) {
      alert('Collection has no ID');
      return;
    }

    try {
      // Extract just the numeric part of the ID if it starts with "collection:"
      // Otherwise use the ID as-is (newer format is just numeric)
      const collectionId = typeof collection.id === 'string' && collection.id.startsWith('collection:') 
        ? collection.id.replace('collection:', '') 
        : collection.id;
      
      const response = await fetch(`${serverUrl}/admin/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        // Fetch all collections again to get updated list
        await fetchCollections();
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const error = await response.json();
        alert(`Failed to delete collection: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
      alert('Failed to delete collection. Please try again.');
    }
  };

  const uploadPhoto = async (photo: UploadedPhoto) => {
    updatePhoto(photo.id, { status: 'uploading' });

    try {
      // Find the collection by name to get its ID
      const collection = collections.find(c => c.name === photo.collection);
      if (!collection) {
        throw new Error(`Collection "${photo.collection}" not found`);
      }

      console.log('Uploading photo to collection:', collection.name, 'Full collection:', collection);

      // Ensure collection has an ID
      if (!collection.id) {
        throw new Error(`Collection "${photo.collection}" has no ID`);
      }

      // Extract just the numeric part of the ID if it starts with "collection:"
      // Otherwise use the ID as-is (newer format is just numeric)
      const collectionId = typeof collection.id === 'string' && collection.id.startsWith('collection:') 
        ? collection.id.replace('collection:', '') 
        : collection.id;
      console.log('Collection ID for upload:', collectionId);

      // Create form data
      const formData = new FormData();
      formData.append('image', photo.file);

      const uploadUrl = `${serverUrl}/admin/collections/${collectionId}/images`;
      console.log('Making upload request to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          console.error('Upload error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          const responseText = await response.text();
          console.error('Response text:', responseText);
          errorMessage = `Upload failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      updatePhoto(photo.id, { status: 'success' });
      
      // Reload the page to refresh the collections list in the manage tab
      // This ensures the newly uploaded photos appear immediately
      setTimeout(() => {
        removePhoto(photo.id);
        // Dispatch a custom event that the manage component can listen to
        window.dispatchEvent(new CustomEvent('collectionsUpdated'));
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('Error message:', errorMessage);
      updatePhoto(photo.id, { 
        status: 'error',
        error: errorMessage
      });
    }
  };

  const uploadAllPhotos = async () => {
    const pendingPhotos = photos.filter(p => p.status === 'pending' || p.status === 'error');
    
    // Upload in parallel (max 3 concurrent uploads to avoid overwhelming the server)
    const CONCURRENT_UPLOADS = 3;
    const batches = [];
    
    for (let i = 0; i < pendingPhotos.length; i += CONCURRENT_UPLOADS) {
      batches.push(pendingPhotos.slice(i, i + CONCURRENT_UPLOADS));
    }
    
    for (const batch of batches) {
      await Promise.all(batch.map(photo => uploadPhoto(photo)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">Stock Photo Upload</h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
            ⚡ Fast uploads with automatic optimization: 95% quality print version (max 4000px) + 80% quality web version (max 1200px)
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all"
        >
          <Upload className="w-4 h-4" />
          Select Photos
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Collections management */}
      <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900">Collections</h3>
          <button
            onClick={() => setShowNewCollection(!showNewCollection)}
            className="text-sm text-[#ff6b35] hover:text-[#ff8c42] transition-colors"
          >
            + Add Collection
          </button>
        </div>

        {showNewCollection && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              placeholder="Collection name"
              className="flex-1 px-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
              onKeyPress={(e) => e.key === 'Enter' && addCollection()}
            />
            <button
              onClick={addCollection}
              className="px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42]"
            >
              Add
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {collections.map(collection => (
            <div
              key={collection.id}
              className="group flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-sm"
            >
              {editingCollection === collection.name ? (
                <>
                  <input
                    type="text"
                    value={editCollectionName}
                    onChange={(e) => setEditCollectionName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        renameCollection(collection.name, editCollectionName);
                      } else if (e.key === 'Escape') {
                        setEditingCollection(null);
                        setEditCollectionName('');
                      }
                    }}
                    onBlur={() => renameCollection(collection.name, editCollectionName)}
                    autoFocus
                    className="w-32 px-2 py-1 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#ff6b35] rounded text-xs text-white [data-theme='light']_&:text-gray-900 focus:outline-none"
                  />
                </>
              ) : (
                <>
                  <Folder className="w-3 h-3 text-gray-400" />
                  <span className="text-white [data-theme='light']_&:text-gray-700">{collection.name}</span>
                  {/* ALWAYS VISIBLE buttons (removed opacity-0 group-hover) */}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => {
                        setEditingCollection(collection.name);
                        setEditCollectionName(collection.name);
                      }}
                      className="p-1 hover:text-[#ff6b35] text-gray-400 [data-theme='light']_&:text-gray-500 transition-colors"
                      title="Rename collection"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteCollection(collection.name)}
                      className="p-1 hover:text-red-500 text-gray-400 [data-theme='light']_&:text-gray-500 transition-colors"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload queue */}
      {photos.length > 0 && (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900">
              Upload Queue ({photos.length})
            </h3>
            <button
              onClick={uploadAllPhotos}
              disabled={photos.every(p => p.status === 'uploading' || p.status === 'success')}
              className="px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload All
            </button>
          </div>

          <div className="space-y-4">
            {photos.map(photo => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg p-4"
              >
                <div className="flex gap-4">
                  {/* Preview */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 flex-shrink-0">
                    <img
                      src={photo.preview}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={photo.title}
                          onChange={(e) => updatePhoto(photo.id, { title: e.target.value })}
                          disabled={photo.status !== 'pending' && photo.status !== 'error'}
                          className="w-full px-3 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded text-sm text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35] disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-1">
                          Collection
                        </label>
                        <select
                          value={photo.collection}
                          onChange={(e) => updatePhoto(photo.id, { collection: e.target.value })}
                          disabled={photo.status !== 'pending' && photo.status !== 'error'}
                          className="w-full px-3 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded text-sm text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35] disabled:opacity-50"
                        >
                          {collections.map(collection => (
                            <option key={collection.id} value={collection.name}>{collection.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {photo.status === 'pending' && (
                          <span className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                            Ready to upload
                          </span>
                        )}
                        {photo.status === 'uploading' && (
                          <>
                            <div className="w-4 h-4 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-[#ff6b35]">Uploading...</span>
                          </>
                        )}
                        {photo.status === 'success' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">Uploaded successfully</span>
                          </>
                        )}
                        {photo.status === 'error' && (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500">{photo.error}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {(photo.status === 'pending' || photo.status === 'error') && (
                          <button
                            onClick={() => uploadPhoto(photo)}
                            className="text-sm text-[#ff6b35] hover:text-[#ff8c42]"
                          >
                            Upload
                          </button>
                        )}
                        {photo.status !== 'uploading' && (
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="text-sm text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upload instructions */}
      {photos.length === 0 && (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
            No photos selected
          </h3>
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600 mb-6">
            Click "Select Photos" to upload stock images to your collections
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all"
          >
            Select Photos
          </button>
        </div>
      )}
    </div>
  );
}