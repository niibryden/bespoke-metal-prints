import React, { useState, useEffect, useMemo } from 'react';
import { X, ImageIcon, Printer, ChevronLeft, Grid3x3, List, Search as SearchIcon, Loader2, CheckCircle, ChevronRight, Home, ZoomIn } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getServerUrl } from '../utils/serverUrl';
import { ReturnToHomeButton } from './ReturnToHomeButton';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CollectionPageProps {
  collection: {
    id: number;
    title: string;
    description: string;
  };
  onClose: () => void;
  onBack: () => void;
  onCreateOrder: (imageUrl: string) => void;
}

interface Photo {
  id: string;
  name: string;
  url: string;
  optimizedUrl?: string;
}

export function CollectionPage({ collection, onClose, onBack, onCreateOrder }: CollectionPageProps) {
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; title: string } | null>(null);
  const [displayedCount, setDisplayedCount] = useState(12);
  const [images, setImages] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const serverUrl = getServerUrl();
        
        console.log('CollectionPage: Fetching images for:', collection.title);
        
        const response = await fetch(`${serverUrl}/stock-photos/${encodeURIComponent(collection.title)}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('CollectionPage: Server response:', {
            photosCount: data.photos?.length || 0,
            firstPhoto: data.photos?.[0] ? {
              id: data.photos[0].id,
              name: data.photos[0].name,
              isMarketplacePhoto: data.photos[0].isMarketplacePhoto,
              urlPrefix: data.photos[0].url?.substring(0, 80),
            } : null
          });
          
          // Map photos to ensure proper structure
          const validPhotos = (data.photos || []).map((photo: Photo) => ({
            id: photo.id,
            name: photo.name,
            url: photo.url, // This is the signed high-res URL for marketplace photos
            optimizedUrl: photo.url, // Same for printing
          }));
          
          console.log('CollectionPage: Mapped photos:', validPhotos.length);
          setImages(validPhotos);
        } else {
          console.error('CollectionPage: Failed to fetch images:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('CollectionPage: Error response:', errorText.substring(0, 200));
          setImages([]);
        }
      } catch (error) {
        console.error('CollectionPage: Error fetching images:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [collection.title]);

  const visibleImages = images.slice(0, displayedCount);
  const hasMore = displayedCount < images.length;

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 12);
  };

  const handleImageClick = (photo: Photo) => {
    const imageUrl = photo.optimizedUrl || photo.url;
    setEnlargedImage({ url: imageUrl, title: photo.name });
  };

  const handleCreateOrder = (imageUrl: string) => {
    onCreateOrder(imageUrl);
    onClose();
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#0a0a0a] [data-theme='light']_&:bg-white overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm [data-theme='light']_&:bg-white/95 border-b border-[#ff6b35]/20 [data-theme='light']_&:border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 [data-theme='light']_&:text-gray-500">
              <ReturnToHomeButton />
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={onBack}
                className="hover:text-[#ff6b35] transition-colors"
              >
                Our Stock Photos
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white [data-theme='light']_&:text-gray-700">{collection.title}</span>
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
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 sm:px-6 py-12">
          {/* Collection title and description */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl text-[#ff6b35] mb-4">{collection.title} Collection</h1>
            <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
              {collection.description}
            </p>
          </motion.div>

          {/* Images grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#ff6b35] animate-spin mb-4" />
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600 text-lg mb-2">No images in this collection yet</p>
              <p className="text-gray-500 [data-theme='light']_&:text-gray-500 text-sm">Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {visibleImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative"
                >
                  {/* Image container */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-[#2a2a2a] group-hover:border-[#ff6b35] transition-all [data-theme='light']_&:border-gray-300">
                    <ImageWithFallback
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover overlay with buttons */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                      <button
                        onClick={() => handleImageClick(image)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-all border border-[#ff6b35]/50"
                      >
                        <ZoomIn className="w-4 h-4" />
                        View Larger Image
                      </button>
                      <button
                        onClick={() => handleCreateOrder(image.url)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all"
                      >
                        <Printer className="w-4 h-4" />
                        Start Your Print
                      </button>
                    </div>
                  </div>

                  {/* Image title */}
                  <div className="text-center mt-3">
                    <p className="text-white [data-theme='light']_&:text-gray-900">{image.name}</p>
                    <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Detailsproduct</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

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
                className="px-12 py-3 bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all [data-theme='light']_&:bg-white [data-theme='light']_&:text-gray-700 [data-theme='light']_&:border-gray-300"
              >
                LOAD MORE...
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Enlarged image modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              className="relative max-w-6xl w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enlarged image */}
              <div className="relative">
                <ImageWithFallback
                  src={enlargedImage.url}
                  alt={enlargedImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg border-2 border-[#ff6b35]"
                />
              </div>

              {/* Action buttons below image */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => handleCreateOrder(enlargedImage.url)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Create Order
                </button>
                <button
                  onClick={() => setEnlargedImage(null)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-all border border-[#ff6b35]/50"
                >
                  <X className="w-5 h-5" />
                  Close Picture
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}