import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, ChevronRight, Search, Grid3x3, Grid2x2, Image as ImageIcon, Sparkles, Zap, Clock, CheckCircle, Printer, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/config';
import { getServerUrl } from '../utils/serverUrl';
// Removed getProxiedImageUrl - using direct S3 URLs now

interface CollectionDetailViewProps {
  collectionName: string;
  onClose: () => void;
  onBack: () => void;
  onStartPrint: (imageUrl: string) => void;
}

interface Photo {
  id: string;
  title: string;
  url: string;
  optimizedUrl?: string;
}

export function CollectionDetailView({ 
  collectionName, 
  onClose, 
  onBack, 
  onStartPrint 
}: CollectionDetailViewProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loadingPhotoId, setLoadingPhotoId] = useState<string | null>(null);
  const [successPhotoId, setSuccessPhotoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  const [showActionsForPhotoId, setShowActionsForPhotoId] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [collectionName]);

  const fetchPhotos = async () => {
    try {
      console.log('Fetching photos for collection:', collectionName);
      
      const response = await fetch(
        `${getServerUrl()}/stock-photos/${encodeURIComponent(collectionName)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          cache: 'no-store', // Prevent browser from caching the response
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Photos fetched:', data.photos);
        
        // Use all photos - server provides signed URLs for S3 images
        const validPhotos = (data.photos || []).filter((photo: Photo) => {
          const url = photo.optimizedUrl || photo.url;
          return url && url.trim() !== '';
        });
        
        console.log(`CollectionDetailView: ${validPhotos.length} photos loaded`);
        
        setPhotos(validPhotos);
      } else {
        console.error('Failed to fetch photos:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoFixStockPhotos = async () => {
    try {
      console.log('CollectionDetailView: Auto-fixing by cleaning S3 images...');
      
      // Step 1: Clean S3 images
      const cleanResponse = await fetch(`${getServerUrl()}/admin/clean-s3-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (cleanResponse.ok) {
        const cleanData = await cleanResponse.json();
        console.log(`CollectionDetailView: Cleaned ${cleanData.removed} S3 images`);
        
        // Step 2: Seed sample photos
        console.log('CollectionDetailView: Seeding sample Unsplash photos...');
        const seedResponse = await fetch(`${getServerUrl()}/admin/seed-stock-photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        if (seedResponse.ok) {
          const seedData = await seedResponse.json();
          console.log(`CollectionDetailView: Successfully seeded ${seedData.collections?.length || 0} collections`);
          
          // Dispatch event to notify other components
          window.dispatchEvent(new Event('collectionsUpdated'));
          
          // Navigate back to stock photos page since the collection structure changed
          onBack();
        } else {
          console.error('CollectionDetailView: Failed to seed photos:', await seedResponse.text());
        }
      } else {
        console.error('CollectionDetailView: Failed to clean S3 images:', await cleanResponse.text());
      }
    } catch (error) {
      console.error('CollectionDetailView: Auto-fix failed:', error);
    }
  };

  // Filter photos based on search query
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return photos;
    
    const query = searchQuery.toLowerCase();
    return photos.filter(photo => 
      photo.title.toLowerCase().includes(query)
    );
  }, [photos, searchQuery]);

  const handleStartPrint = (photo: Photo) => {
    setLoadingPhotoId(photo.id);
    setSuccessPhotoId(null);
    
    // Use the actual URL from the photo
    const imageUrl = photo.url || photo.optimizedUrl || '';
    console.log('🖼️ CollectionDetailView: Starting print with image URL:', imageUrl.substring(0, 100));
    console.log('📦 Photo data:', { id: photo.id, title: photo.title, hasUrl: !!photo.url, hasOptimized: !!photo.optimizedUrl });
    
    // Call parent handler with the image URL
    onStartPrint(imageUrl);
    
    // Show success state briefly
    setTimeout(() => {
      setLoadingPhotoId(null);
      setSuccessPhotoId(photo.id);
      console.log('✅ CollectionDetailView: Print initiated successfully');
      
      // Clear success state
      setTimeout(() => {
        setSuccessPhotoId(null);
      }, 1000);
    }, 600);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] [data-theme='light']_&:bg-white flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin" />
          <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#ff6b35]" />
        </div>
        <p className="text-gray-400 [data-theme='light']_&:text-gray-600 animate-pulse">Loading {collectionName} photos...</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-[#0a0a0a] [data-theme='light']_&:bg-white overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md [data-theme='light']_&:bg-white/95 border-b border-[#ff6b35]/20 [data-theme='light']_&:border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-400 [data-theme='light']_&:text-gray-500">
                <button 
                  onClick={onClose}
                  className="hover:text-[#ff6b35] transition-colors flex items-center gap-1"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </button>
                <ChevronRight className="w-4 h-4" />
                <button 
                  onClick={onBack}
                  className="hover:text-[#ff6b35] transition-colors hidden sm:inline"
                >
                  Stock Photos
                </button>
                <ChevronRight className="w-4 h-4 hidden sm:inline" />
                <span className="text-white [data-theme='light']_&:text-gray-700 font-medium truncate max-w-[150px] sm:max-w-none">{collectionName}</span>
              </div>
              
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-white [data-theme='light']_&:text-gray-700 hover:bg-[#ff6b35] hover:text-black transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Search and view toggle */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search photos by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                />
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-[#ff6b35] text-black' 
                      : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list' 
                      ? 'bg-[#ff6b35] text-black' 
                      : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <Grid2x2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Collection title and info */}
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#ff6b35]" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl text-white [data-theme='light']_&:text-gray-900">
                {collectionName}
              </h1>
              <Sparkles className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'} 
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            
            {/* Helper text for mobile */}
            <p className="text-[#ff6b35] text-xs sm:text-sm mt-3 flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" />
              <span className="sm:hidden">Tap any photo to view options</span>
              <span className="hidden sm:inline">Hover over photos to view and print options</span>
            </p>
          </motion.div>

          {filteredPhotos.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#1a1a1a] [data-theme='light']_&:bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl text-white [data-theme='light']_&:text-gray-900 mb-2">
                {searchQuery ? 'No photos found' : 'No photos in this collection yet'}
              </h3>
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                {searchQuery ? 'Try searching with different keywords' : 'Check back soon for new photos!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-6 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8555] transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          ) : (
            /* Photo grid or list */
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            }>
              <AnimatePresence mode="popLayout">
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="group relative rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-lg cursor-pointer"
                    style={{
                      borderColor: (hoveredPhotoId === photo.id || showActionsForPhotoId === photo.id) ? '#ff6b35' : 'transparent',
                      transform: (hoveredPhotoId === photo.id || showActionsForPhotoId === photo.id) ? 'translateY(-4px)' : 'translateY(0)',
                      boxShadow: (hoveredPhotoId === photo.id || showActionsForPhotoId === photo.id)
                        ? '0 20px 40px rgba(255, 107, 53, 0.2)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={() => setHoveredPhotoId(photo.id)}
                    onMouseLeave={() => setHoveredPhotoId(null)}
                    onClick={() => {
                      // Toggle actions on click for mobile
                      if (showActionsForPhotoId === photo.id) {
                        setShowActionsForPhotoId(null);
                      } else {
                        setShowActionsForPhotoId(photo.id);
                      }
                    }}
                  >
                    <div className={viewMode === 'grid' ? 'aspect-square' : 'aspect-video'}>
                      <ImageWithFallback
                        src={photo.optimizedUrl || photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Loading overlay */}
                    <AnimatePresence>
                      {loadingPhotoId === photo.id && (
                        <motion.div 
                          className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Loader2 className="w-10 h-10 text-[#ff6b35] animate-spin mb-3" />
                          <p className="text-white font-medium">Loading...</p>
                          <p className="text-gray-400 text-xs mt-1">Preparing configurator</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Success overlay */}
                    <AnimatePresence>
                      {successPhotoId === photo.id && (
                        <motion.div 
                          className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <CheckCircle className="w-12 h-12 text-[#ff6b35] mb-3" />
                          <p className="text-white font-medium">Ready to Print!</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Hover/Click overlay with actions - shows on hover (desktop) or click (mobile) */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex flex-col items-center justify-end p-4 pb-6 gap-3 ${
                        showActionsForPhotoId === photo.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {/* Photo title */}
                      <p className="text-white font-medium text-center line-clamp-2 text-sm sm:text-base">
                        {photo.title}
                      </p>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 w-full">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionsForPhotoId(null);
                            setSelectedPhoto(photo);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all text-sm border border-white/20"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="w-4 h-4" />
                          <span className="hidden sm:inline">Preview</span>
                          <span className="sm:hidden">View</span>
                        </motion.button>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionsForPhotoId(null);
                            handleStartPrint(photo);
                          }}
                          disabled={loadingPhotoId === photo.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#ff6b35] text-black font-medium rounded-lg hover:bg-[#ff8555] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ff6b35]/20"
                          whileHover={{ scale: loadingPhotoId === photo.id ? 1 : 1.05 }}
                          whileTap={{ scale: loadingPhotoId === photo.id ? 1 : 0.95 }}
                        >
                          {loadingPhotoId === photo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Printer className="w-4 h-4" />
                          )}
                          <span>Print</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Image preview modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="relative max-w-6xl w-full my-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-3 bg-black/80 backdrop-blur-sm rounded-full text-white hover:bg-[#ff6b35] hover:text-black transition-all shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full h-auto max-h-[85vh] object-contain bg-[#0a0a0a]"
                />
              </div>

              {/* Photo info and actions */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1a1a1a] rounded-xl p-4 sm:p-6 border border-[#ff6b35]/20 shadow-lg">
                <div className="flex-1">
                  <h3 className="text-white text-lg sm:text-xl font-medium mb-1">{selectedPhoto.title}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {collectionName}
                  </p>
                </div>
                <motion.button
                  onClick={() => {
                    handleStartPrint(selectedPhoto);
                    setSelectedPhoto(null);
                  }}
                  disabled={loadingPhotoId === selectedPhoto.id}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6b35] text-black font-medium rounded-lg hover:bg-[#ff8555] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ff6b35]/20"
                  whileHover={{ scale: loadingPhotoId === selectedPhoto.id ? 1 : 1.05 }}
                  whileTap={{ scale: loadingPhotoId === selectedPhoto.id ? 1 : 0.95 }}
                >
                  {loadingPhotoId === selectedPhoto.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Printer className="w-5 h-5" />
                      Start Printing
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}