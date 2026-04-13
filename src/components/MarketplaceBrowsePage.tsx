import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Search, Grid, List, Filter, Image as ImageIcon, Eye, TrendingUp, Camera, Loader2, AlertCircle } from 'lucide-react';
import { getServerUrl } from '../utils/serverUrl';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MarketplaceBrowsePageProps {
  onClose: () => void;
  onSelectPhoto?: (photo: MarketplacePhoto) => void;
}

interface MarketplacePhoto {
  id: string;
  photographerId: string;
  photographerName: string;
  s3Url: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  views: number;
  sales: number;
  uploadDate: string;
  featured: boolean;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'nature', label: 'Nature & Landscapes' },
  { value: 'urban', label: 'Urban & Architecture' },
  { value: 'portrait', label: 'Portrait & People' },
  { value: 'abstract', label: 'Abstract & Artistic' },
  { value: 'wildlife', label: 'Wildlife & Animals' },
  { value: 'travel', label: 'Travel & Adventure' },
  { value: 'food', label: 'Food & Culinary' },
  { value: 'sports', label: 'Sports & Action' },
  { value: 'other', label: 'Other' },
];

export function MarketplaceBrowsePage({ onClose, onSelectPhoto }: MarketplaceBrowsePageProps) {
  const [photos, setPhotos] = useState<MarketplacePhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<MarketplacePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MarketplacePhoto | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [photos, searchQuery, selectedCategory]);

  const loadPhotos = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('📸 Loading marketplace photos from:', `${getServerUrl()}/marketplace/photos`);
      const response = await fetch(`${getServerUrl()}/marketplace/photos`);

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to load marketplace photos');
      }

      const data = await response.json();
      console.log(`✅ Loaded ${data.photos?.length || 0} marketplace photos`);
      setPhotos(data.photos || []);
    } catch (err: any) {
      console.error('❌ Failed to load marketplace photos:', err);
      setError(err.message || 'Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    let filtered = [...photos];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.photographerName.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPhotos(filtered);
  };

  const handlePhotoClick = (photo: MarketplacePhoto) => {
    setSelectedPhoto(photo);
  };

  const handleSelectForPrint = () => {
    if (selectedPhoto && onSelectPhoto) {
      onSelectPhoto(selectedPhoto);
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#ff6b35] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white dark:bg-black overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-[#ff6b35]/20 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6 text-[#ff6b35]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Photographer Marketplace
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredPhotos.length} professional photos available
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-[#ff6b35] hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos, photographers, tags..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#0a0a0a] text-[#ff6b35] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#0a0a0a] text-[#ff6b35] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border-2 border-dashed border-gray-300 dark:border-[#2a2a2a]">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || selectedCategory !== 'all' ? 'No Photos Found' : 'No Photos Available Yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Check back soon for professional photography from our marketplace'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-200 dark:border-[#2a2a2a] hover:border-[#ff6b35] hover:shadow-xl hover:shadow-[#ff6b35]/10 transition-all cursor-pointer group"
                onClick={() => handlePhotoClick(photo)}
                whileHover={{ y: -5 }}
                layout
              >
                <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-[#0a0a0a]">
                  <ImageWithFallback
                    src={photo.s3Url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {photo.featured && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#ff6b35] text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {photo.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    by {photo.photographerName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {photo.views || 0}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded-full">
                      {CATEGORIES.find(c => c.value === photo.category)?.label || photo.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-200 dark:border-[#2a2a2a] hover:border-[#ff6b35] transition-all cursor-pointer p-4 flex gap-4"
                onClick={() => handlePhotoClick(photo)}
                whileHover={{ x: 5 }}
                layout
              >
                <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0a0a0a]">
                  <ImageWithFallback
                    src={photo.s3Url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate pr-4">
                      {photo.title}
                    </h3>
                    {photo.featured && (
                      <span className="px-2 py-1 bg-[#ff6b35] text-white text-xs font-semibold rounded-full flex items-center gap-1 flex-shrink-0">
                        <TrendingUp className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    by {photo.photographerName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                    {photo.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {photo.views || 0} views
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded-full">
                      {CATEGORIES.find(c => c.value === photo.category)?.label || photo.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="aspect-video relative bg-gray-900">
                <ImageWithFallback
                  src={selectedPhoto.s3Url}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedPhoto.title}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      by {selectedPhoto.photographerName}
                    </p>
                  </div>
                  {selectedPhoto.featured && (
                    <div className="px-3 py-1.5 bg-[#ff6b35] text-white font-semibold rounded-full flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Featured
                    </div>
                  )}
                </div>

                {selectedPhoto.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {selectedPhoto.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPhoto.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-[#2a2a2a]">
                  <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {selectedPhoto.views || 0} views
                    </span>
                    <span>
                      {CATEGORIES.find(c => c.value === selectedPhoto.category)?.label || selectedPhoto.category}
                    </span>
                  </div>

                  <motion.button
                    onClick={handleSelectForPrint}
                    className="px-8 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/30 font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Select for Metal Print
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}