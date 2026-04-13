import React, { useState, useEffect, useMemo } from 'react';
import { X, ImageIcon, ChevronRight, Search, Grid3x3, Grid2x2, Printer, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getServerUrl } from '../utils/serverUrl';
import { ReturnToHomeButton } from './ReturnToHomeButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
// Removed getProxiedImageUrl - using direct S3 URLs now

interface StockPhotosPageProps {
  onClose: () => void;
  onSelectImage?: (imageUrl: string) => void;
  onSelectCollection?: (collection: { id: number; title: string; description: string }) => void;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  photos: any[];
  photoCount: number;
  thumbnail?: string;
  hidden?: boolean;
}

export function StockPhotosPage({ onClose, onSelectImage, onSelectCollection }: StockPhotosPageProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);
  const [loadingImageId, setLoadingImageId] = useState<string | null>(null);
  const [successImageId, setSuccessImageId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch actual collections from backend
    loadCollections();

    // Listen for collection updates from admin panel
    const handleCollectionsUpdated = () => {
      console.log('StockPhotosPage: Collections updated event received, refreshing...');
      loadCollections();
    };

    window.addEventListener('collectionsUpdated', handleCollectionsUpdated);

    return () => {
      window.removeEventListener('collectionsUpdated', handleCollectionsUpdated);
    };
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📷 Fetching collections from backend...');
      const response = await fetch(`${getServerUrl()}/collections`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      console.log('📷 Response status:', response.status);
      console.log('📷 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📷 Response error:', errorText);
        throw new Error(`Failed to fetch collections: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📷 Collections loaded:', data.length);
      
      // Transform collections to include photo count and thumbnail
      const transformedCollections = data.map((col: any, index: number) => ({
        id: (col.id || `col_${index}`).toString(),
        name: col.title,
        description: col.description || '',
        photos: col.photos || [],
        photoCount: (col.photos || []).length,
        thumbnail: (col.photos && col.photos.length > 0) ? col.photos[0].url : '',
        hidden: col.hidden || false,
      })).filter((col: Collection) => !col.hidden); // Filter out hidden collections

      setCollections(transformedCollections);
    } catch (err: any) {
      console.error('❌ Error fetching collections:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        serverUrl: getServerUrl(),
        fullUrl: `${getServerUrl()}/collections`
      });
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  // Filter collections based on search query
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    
    const query = searchQuery.toLowerCase();
    return collections.filter(col => 
      col.name.toLowerCase().includes(query) ||
      (col.description && col.description.toLowerCase().includes(query))
    );
  }, [collections, searchQuery]);

  const visibleCollections = filteredCollections.slice(0, displayedCount);
  const hasMore = displayedCount < filteredCollections.length;

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 8);
  };

  const handleCategoryClick = (collection: Collection) => {
    if (onSelectCollection) {
      // Convert to the expected format
      onSelectCollection({
        id: 0, // Will be ignored
        title: collection.name,
        description: collection.description || `${collection.photoCount} photos available`,
      });
    }
  };

  const handleQuickPrint = (collection: Collection, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent collection click
    
    if (collection.thumbnail && onSelectImage) {
      setLoadingImageId(collection.name);
      setSuccessImageId(null);
      
      console.log('StockPhotosPage: Quick Print clicked for:', collection.name, 'URL:', collection.thumbnail.substring(0, 80));
      
      // Call the onSelectImage callback which will handle navigation and loading
      onSelectImage(collection.thumbnail);
      
      // Show success state briefly
      setTimeout(() => {
        setLoadingImageId(null);
        setSuccessImageId(collection.name);
        
        // Clear success state
        setTimeout(() => {
          setSuccessImageId(null);
        }, 1000);
      }, 300);
    }
  };

  const totalPhotos = collections.reduce((sum, col) => sum + col.photoCount, 0);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin" />
          <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#ff6b35]" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading collections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 p-8">
        <div className="max-w-2xl w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            ⚠️ Server Connection Failed
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We couldn't connect to the photo library. This usually means:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            <li>The Supabase Edge Function "make-server-3e3a9cd7" is not deployed</li>
            <li>The backend is still starting up (wait 30 seconds and refresh)</li>
            <li>There's a temporary connectivity issue</li>
          </ul>
          <div className="bg-white dark:bg-black/50 p-4 rounded border border-red-300 dark:border-red-700 mb-4">
            <p className="text-sm font-mono text-red-700 dark:text-red-300 break-all">
              {error}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <strong>Next steps:</strong><br />
            1. Check that the Edge Function is deployed in Supabase<br />
            2. Wait 30 seconds and refresh this page<br />
            3. Check the browser console for detailed error messages
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white dark:bg-[#0a0a0a] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header with close button */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#ff6b35]/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ReturnToHomeButton onClick={onClose} />
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-700 dark:text-white font-medium">Our Stock Photos</span>
            </div>
            
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-[#ff6b35] hover:text-black transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Search and filters row */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
              />
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-[#ff6b35] text-black' 
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('large')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'large' 
                    ? 'bg-[#ff6b35] text-black' 
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Large view"
              >
                <Grid2x2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero section with stats */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-900 dark:text-white mb-4">
            Premium Stock Photos
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Explore our curated collection of professional photography and digital art.
          </p>
          
          {/* Quick Print Helper */}
          <motion.p 
            className="text-[#ff6b35] text-sm flex items-center justify-center gap-2 mb-4"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Printer className="w-4 h-4" />
            <span>Hover over any collection for instant "Quick Print" option!</span>
          </motion.p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff6b35]" />
              <span className="text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-white font-semibold">{collections.length}</span> Collections
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-[#2a2a2a]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff6b35]" />
              <span className="text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-white font-semibold">{totalPhotos}</span> Photos
              </span>
            </div>
          </div>

          {/* Search results count */}
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400"
            >
              Found <span className="text-[#ff6b35] font-semibold">{filteredCollections.length}</span> collection{filteredCollections.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </motion.p>
          )}
        </motion.div>

        {filteredCollections.length === 0 ? (
          <motion.div 
            className="max-w-2xl mx-auto text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {searchQuery ? (
              // Search results empty
              <>
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-2">
                  No collections found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try searching with different keywords
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-6 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8555] transition-colors"
                >
                  Clear Search
                </button>
              </>
            ) : (
              // No collections at all
              <div className="bg-gradient-to-br from-[#ff6b35]/10 to-[#ff8c42]/10 dark:from-[#ff6b35]/5 dark:to-[#ff8c42]/5 rounded-2xl p-12 border-2 border-[#ff6b35]/20">
                <div className="w-24 h-24 rounded-full bg-[#ff6b35]/20 flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-12 h-12 text-[#ff6b35]" />
                </div>
                <h3 className="text-3xl text-gray-900 dark:text-white mb-4">
                  📸 Stock Photo Library Coming Soon!
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  We're curating a premium collection of high-quality images perfect for metal prints.<br />
                  Check back soon!
                </p>
                
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 mb-8 border border-gray-200 dark:border-[#ff6b35]/20">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    <strong>In the meantime, you can:</strong>
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={onClose}
                      className="w-full py-3 px-6 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Printer className="w-5 h-5" />
                      Upload Your Own Photo
                    </button>
                    <a
                      href="https://www.instagram.com/bespokemetalprints"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-6 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white border-2 border-gray-300 dark:border-[#ff6b35]/30 rounded-lg hover:border-[#ff6b35] dark:hover:border-[#ff6b35] transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Browse Our Instagram Gallery
                    </a>
                  </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  💡 <strong>Tip:</strong> Upload your own high-resolution photos for the best print quality!
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Collections grid */}
            <div className={`grid gap-6 mb-12 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              <AnimatePresence mode="popLayout">
                {visibleCollections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="group cursor-pointer"
                    onClick={() => handleCategoryClick(collection)}
                    onMouseEnter={() => setHoveredCollection(collection.name)}
                    onMouseLeave={() => setHoveredCollection(null)}
                  >
                    {/* Image */}
                    <div className={`relative rounded-xl overflow-hidden mb-4 border-2 transition-all duration-300 shadow-lg ${
                      hoveredCollection === collection.name
                        ? 'border-[#ff6b35] shadow-[#ff6b35]/20 shadow-2xl -translate-y-1'
                        : 'border-transparent shadow-black/20'
                    } ${viewMode === 'large' ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}>
                      {collection.thumbnail ? (
                        <>
                          <ImageWithFallback
                            src={collection.thumbnail}
                            alt={collection.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Gradient overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                            hoveredCollection === collection.name ? 'opacity-100' : 'opacity-60'
                          }`} />
                          
                          {/* Collection info on hover */}
                          <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 ${
                            hoveredCollection === collection.name ? 'translate-y-0' : 'translate-y-2'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-[#ff6b35]" />
                                <span className="text-white text-sm font-medium">
                                  {collection.photoCount} photo{collection.photoCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <ChevronRight className={`w-5 h-5 text-[#ff6b35] transition-transform duration-300 ${
                                hoveredCollection === collection.name ? 'translate-x-1' : ''
                              }`} />
                            </div>
                            
                            {/* Quick Print Button */}
                            {collection.thumbnail && (
                              <motion.button
                                onClick={(e) => handleQuickPrint(collection, e)}
                                className="w-full mt-2 px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ 
                                  opacity: hoveredCollection === collection.name ? 1 : 0,
                                  y: hoveredCollection === collection.name ? 0 : 10
                                }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {loadingImageId === collection.name ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                  </>
                                ) : successImageId === collection.name ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Added!
                                  </>
                                ) : (
                                  <>
                                    <Printer className="w-4 h-4" />
                                    Quick Print
                                  </>
                                )}
                              </motion.button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-[#1a1a1a] flex flex-col items-center justify-center gap-2">
                          <ImageIcon className="w-12 h-12 text-gray-600" />
                          <p className="text-sm text-gray-500">No photos yet</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Title and description */}
                    <div>
                      <h3 className={`text-lg sm:text-xl mb-1 transition-colors duration-300 ${
                        hoveredCollection === collection.name
                          ? 'text-[#ff6b35]'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Load more button */}
            {hasMore && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleLoadMore}
                  className="group px-8 py-3 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-white border-2 border-gray-300 dark:border-[#2a2a2a] rounded-lg hover:border-[#ff6b35] hover:bg-[#ff6b35] hover:text-black transition-all font-medium shadow-lg hover:shadow-[#ff6b35]/20 hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    Load More Collections
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Showing {visibleCollections.length} of {filteredCollections.length}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}