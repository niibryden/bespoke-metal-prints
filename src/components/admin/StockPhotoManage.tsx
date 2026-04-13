import { useState, useEffect } from 'react';
import { Loader, Trash2, AlertTriangle, AlertCircle, Folder, CheckSquare, Square, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getServerUrl } from '../../utils/serverUrl';

interface Photo {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  images: Photo[];
  createdAt: string;
  updatedAt?: string;
}

export function StockPhotoManage({ adminInfo }: { adminInfo?: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  // Helper to get auth header with admin access token
  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken || publicAnonKey}`;
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  const serverUrl = getServerUrl();

  useEffect(() => {
    fetchCollections();

    // Listen for updates from the upload component
    const handleCollectionsUpdated = () => {
      console.log('Collections updated event received, refreshing...');
      fetchCollections();
    };

    window.addEventListener('collectionsUpdated', handleCollectionsUpdated);

    return () => {
      window.removeEventListener('collectionsUpdated', handleCollectionsUpdated);
    };
  }, []);

  const fetchCollections = async () => {
    try {
      console.log('Fetching collections from:', `${serverUrl}/admin/collections`);
      const response = await fetch(`${serverUrl}/admin/collections`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
        cache: 'no-store', // Prevent browser from caching the response
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Collections fetched:', data.collections);
        setCollections(data.collections || []);
        
        // Auto-select first collection if available
        if (data.collections && data.collections.length > 0 && !selectedCollection) {
          setSelectedCollection(data.collections[0].name);
        }
      } else {
        console.error('Failed to fetch collections:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (collectionName: string, photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    setDeletingPhotoId(photoId);

    try {
      // Find the collection to get its ID
      const collection = collections.find(c => c.name === collectionName);
      if (!collection) {
        alert('Collection not found');
        return;
      }

      // Extract just the numeric part of the ID
      const collectionId = collection.id.replace('collection:', '');
      
      console.log('Deleting photo:', photoId, 'from collection:', collectionId);

      const response = await fetch(
        `${serverUrl}/admin/collections/${collectionId}/images/${photoId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      if (response.ok) {
        console.log('Photo deleted successfully');
        
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
        
        // Refresh collections
        await fetchCollections();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        alert(`Failed to delete photo: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const deleteCollection = async (collectionName: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    setDeletingCollectionId(collectionName);

    try {
      // Find the collection to get its ID
      const collection = collections.find(c => c.name === collectionName);
      if (!collection) {
        alert('Collection not found');
        return;
      }

      // Extract just the numeric part of the ID
      const collectionId = collection.id.replace('collection:', '');
      
      console.log('Deleting collection:', collectionId);

      const response = await fetch(
        `${serverUrl}/admin/collections/${collectionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      if (response.ok) {
        console.log('Collection deleted successfully');
        
        // If the deleted collection was selected, clear selection
        if (selectedCollection === collectionName) {
          setSelectedCollection(null);
        }
        
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
        
        // Refresh collections
        await fetchCollections();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        alert(`Failed to delete collection: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
      alert('Failed to delete collection. Please try again.');
    } finally {
      setDeletingCollectionId(null);
    }
  };

  const selectedCollectionData = collections.find(c => c.name === selectedCollection);

  const seedSamplePhotos = async () => {
    if (!confirm('This will add 4 sample collections with stock photos from Unsplash. Continue?')) {
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/admin/seed-stock-photos`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success! Added ${data.collections?.length || 0} collections with sample photos.`);
        fetchCollections();
      } else {
        const error = await response.json();
        alert(`Failed to seed photos: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to seed photos:', error);
      alert('Failed to seed photos. Please try again.');
    }
  };

  const cleanS3Images = async () => {
    if (!confirm('This will remove all S3-hosted images that may have CORS issues. Unsplash images will be kept. Continue?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${serverUrl}/admin/clean-s3-images`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success! Removed ${data.removedCount} S3 photos.`);
        fetchCollections();
        
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const error = await response.json();
        alert(`Failed to clean S3 images: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to clean S3 images:', error);
      alert('Failed to clean S3 images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cleanupCollections = async () => {
    if (!confirm('⚠️ COLLECTION CLEANUP\n\nThis will remove:\n• Collections with 0 photos only\n• Duplicate collections (keeps first one)\n\n✅ Collections with photos will NOT be deleted\n\nContinue?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${serverUrl}/admin/cleanup-collections`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'X-Admin-Email': 'admin@bespokemetalprints.com',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const message = [
          'Cleanup Complete!',
          `• Deleted ${data.deleted.empty} empty collections`,
          `• Deleted ${data.deleted.duplicates} duplicate collections`,
          `• Total removed: ${data.deleted.total}`,
        ].join('\n');
        
        alert(message);
        fetchCollections();
        
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const error = await response.json();
        alert(`Failed to cleanup collections: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to cleanup collections:', error);
      alert('Failed to cleanup collections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const repopulateCollections = async () => {
    if (!confirm('This will add photos to all empty collections from Unsplash. Collections that already have photos will be skipped. Continue?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${serverUrl}/admin/repopulate-all-collections`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success! Repopulated ${data.repopulatedCount} collections with photos.`);
        fetchCollections();
        
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const error = await response.json();
        alert(`Failed to repopulate collections: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to repopulate collections:', error);
      alert('Failed to repopulate collections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearAllCollections = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL collections and photos. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    setLoading(true);

    try {
      console.log('Clearing all collections from:', `${serverUrl}/admin/cleanup-collections`);
      
      const response = await fetch(`${serverUrl}/admin/cleanup-collections`, {
        method: 'POST', // Changed from DELETE to POST
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      console.log('Clear response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Clear response:', data);
        alert(data.message);
        setSelectedCollection(null);
        setCollections([]);
        
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const errorText = await response.text();
        console.error('Clear failed:', response.status, errorText);
        alert(`Failed to clear collections: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to clear collections:', error);
      alert(`Failed to clear collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  const deleteSelectedPhotos = async () => {
    if (!confirm('Are you sure you want to delete the selected photos? This action cannot be undone.')) {
      return;
    }

    setIsDeletingMultiple(true);

    try {
      // Find the collection to get its ID
      const collection = collections.find(c => c.name === selectedCollection);
      if (!collection) {
        alert('Collection not found');
        return;
      }

      // Extract just the numeric part of the ID
      const collectionId = collection.id.replace('collection:', '');
      
      console.log('Deleting selected photos from collection:', collectionId);

      const promises: Promise<Response>[] = [];
      selectedPhotos.forEach(photoId => {
        promises.push(
          fetch(
            `${serverUrl}/admin/collections/${collectionId}/images/${photoId}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': getAuthHeader(),
              },
            }
          )
        );
      });

      const responses = await Promise.all(promises);

      if (responses.every(response => response.ok)) {
        console.log('Selected photos deleted successfully');
        
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
        
        // Refresh collections
        await fetchCollections();
      } else {
        const errors = await Promise.all(responses.map(response => response.json()));
        console.error('Delete failed:', errors);
        alert(`Failed to delete selected photos: ${errors.map(error => error.error || 'Unknown error').join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to delete selected photos:', error);
      alert('Failed to delete selected photos. Please try again.');
    } finally {
      setIsDeletingMultiple(false);
      setSelectedPhotos(new Set());
    }
  };

  const selectAllPhotos = () => {
    if (!selectedCollectionData) return;
    const allPhotoIds = new Set(selectedCollectionData.images.map(photo => photo.id));
    setSelectedPhotos(allPhotoIds);
  };

  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set());
  };

  const updateCollectionDescriptions = async () => {
    if (!confirm('This will update descriptions for all collections that have "Recovered from S3" or empty descriptions. Continue?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${serverUrl}/admin/update-collection-descriptions`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Success! Updated ${data.updatedCount} collection descriptions out of ${data.totalCollections} total collections.`);
        fetchCollections();
        
        // Dispatch event to notify all components
        window.dispatchEvent(new Event('collectionsUpdated'));
      } else {
        const error = await response.json();
        alert(`Failed to update descriptions: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update descriptions:', error);
      alert('Failed to update descriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-[#ff6b35] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">Manage Stock Photos</h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
            View and delete photos from your collections
          </p>
        </div>
        {collections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {[
              {
                key: 'update-descriptions',
                onClick: updateCollectionDescriptions,
                className: 'bg-green-600/10 text-green-500 border-green-500/20 hover:bg-green-600/20',
                title: 'Update collection descriptions',
                icon: Edit2,
                label: 'Update Descriptions',
              },
              {
                key: 'cleanup-collections',
                onClick: cleanupCollections,
                className: 'bg-blue-600/10 text-blue-500 border-blue-500/20 hover:bg-blue-600/20',
                title: 'Remove empty and duplicate collections',
                icon: Trash2,
                label: 'Cleanup Collections',
              },
              {
                key: 'fix-cors',
                onClick: cleanS3Images,
                className: 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-600/20',
                title: 'Remove S3 images with CORS issues',
                icon: AlertTriangle,
                label: 'Fix CORS Errors',
              },
              {
                key: 'clear-all',
                onClick: clearAllCollections,
                className: 'bg-red-600/10 text-red-500 border-red-500/20 hover:bg-red-600/20',
                title: '',
                icon: Trash2,
                label: 'Clear All Collections',
              },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.key}
                  onClick={btn.onClick}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${btn.className}`}
                  title={btn.title}
                >
                  <Icon className="w-4 h-4" />
                  {btn.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {collections.length === 0 ? (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
            No collections found
          </h3>
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600 mb-6">
            Create a collection and upload photos to get started, or load sample photos to populate your site quickly
          </p>
          <button
            onClick={seedSamplePhotos}
            className="px-6 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all"
          >
            Load Sample Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Collections sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-4">
              <h3 className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-3">
                Collections
              </h3>
              <div className="space-y-2">
                {collections.map(collection => (
                  <button
                    key={collection.id}
                    onClick={() => {
                      setSelectedCollection(collection.name);
                      setSelectedPhotos(new Set()); // Clear selection when switching collections
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                      selectedCollection === collection.name
                        ? 'bg-[#ff6b35] text-black'
                        : 'bg-[#0a0a0a] [data-theme=\'light\']_&:bg-gray-50 text-white [data-theme=\'light\']_&:text-gray-700 hover:bg-[#2a2a2a] [data-theme=\'light\']_&:hover:bg-gray-100'
                    }`}
                  >
                    <Folder className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{collection.name}</p>
                      <p className={`text-xs ${
                        selectedCollection === collection.name
                          ? 'text-black/70'
                          : 'text-gray-400 [data-theme=\'light\']_&:text-gray-500'
                      }`}>
                        {collection.images.length} {collection.images.length === 1 ? 'photo' : 'photos'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photos grid */}
          <div className="lg:col-span-3">
            {selectedCollectionData ? (
              selectedCollectionData.images.length === 0 ? (
                <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
                    No photos in this collection
                  </h3>
                  <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                    Upload photos to {selectedCollectionData.name}
                  </p>
                </div>
              ) : (
                <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900">
                        {selectedCollectionData.name}
                      </h3>
                      {selectedPhotos.size > 0 && (
                        <span className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                          {selectedPhotos.size} selected
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {/* Select All / Deselect All button */}
                      {selectedPhotos.size === 0 ? (
                        <button
                          onClick={selectAllPhotos}
                          className="flex items-center gap-2 px-3 py-2 bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/20 rounded-lg hover:bg-[#ff6b35]/20 transition-all text-sm"
                        >
                          <CheckSquare className="w-4 h-4" />
                          Select All
                        </button>
                      ) : (
                        <button
                          onClick={deselectAllPhotos}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-600/10 text-gray-400 border border-gray-600/20 rounded-lg hover:bg-gray-600/20 transition-all text-sm"
                        >
                          <Square className="w-4 h-4" />
                          Deselect All
                        </button>
                      )}
                      {selectedPhotos.size > 0 && (
                        <button
                          onClick={deleteSelectedPhotos}
                          disabled={isDeletingMultiple}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {isDeletingMultiple ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Deleting {selectedPhotos.size}...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete {selectedPhotos.size} Selected
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => deleteCollection(selectedCollectionData.name)}
                        disabled={deletingCollectionId === selectedCollectionData.name}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {deletingCollectionId === selectedCollectionData.name ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete Collection
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                      {selectedCollectionData.images
                        .filter(photo => {
                          // Only show web versions for faster loading
                          // Filter out original files - we only want -web.jpg versions
                          return photo.url.includes('-web.') || !photo.url.includes('-original.');
                        })
                        .map(photo => {
                        const isSelected = selectedPhotos.has(photo.id);
                        return (
                          <motion.div
                            key={photo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="group relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50"
                            style={{
                              borderColor: isSelected ? '#ff6b35' : 'rgb(42, 42, 42)',
                            }}
                          >
                            <div 
                              className="w-full h-full cursor-pointer"
                              onClick={() => togglePhotoSelection(photo.id)}
                            >
                              <ImageWithFallback
                                src={photo.url}
                                alt={photo.name}
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Photo name overlay - always visible at bottom */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pointer-events-none">
                                <p className="text-white text-xs text-center line-clamp-2">
                                  {photo.name}
                                </p>
                              </div>
                            </div>
                            
                            {/* Checkbox overlay - always visible with better styling */}
                            <div className="absolute top-2 left-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePhotoSelection(photo.id);
                                }}
                                className={`p-2 rounded-md shadow-lg transition-all ${
                                  isSelected
                                    ? 'bg-[#ff6b35] text-white scale-110'
                                    : 'bg-white/90 text-gray-800 hover:bg-white hover:scale-105'
                                }`}
                                title={isSelected ? 'Deselect photo' : 'Select photo'}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            
                            {/* Delete button overlay - ALWAYS VISIBLE with better styling */}
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete "${photo.name}"?`)) {
                                    deletePhoto(selectedCollectionData.name, photo.id);
                                  }
                                }}
                                disabled={deletingPhotoId === photo.id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-md shadow-lg hover:bg-red-600 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                title="Delete photo"
                              >
                                {deletingPhotoId === photo.id ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                  Select a collection to view photos
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}