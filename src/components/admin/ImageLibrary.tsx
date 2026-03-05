import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Download, Search, Calendar, Package, Loader2, ExternalLink, RefreshCw, Grid, List } from 'lucide-react';
import { getServerUrl } from '../../utils/serverUrl';

interface StoredImage {
  orderId: string;
  orderNumber: string;
  fileName: string;
  url: string;
  uploadedAt: string;
  customerEmail?: string;
  orderDetails?: {
    size?: string;
    finish?: string;
    mounting?: string;
  };
}

type ViewMode = 'grid' | 'list';

export function ImageLibrary({ adminInfo }: { adminInfo: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken}`;

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getServerUrl()}/admin/images`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (image: StoredImage) => {
    setDownloading(image.orderId);
    try {
      const response = await fetch(`${getServerUrl()}/admin/images/${image.orderId}/download`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.orderNumber || image.orderId}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const filteredImages = images.filter(image => {
    const query = searchQuery.toLowerCase();
    return (
      image.orderNumber?.toLowerCase().includes(query) ||
      image.orderId?.toLowerCase().includes(query) ||
      image.customerEmail?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl text-white [data-theme='light']_&:text-gray-900 mb-1">Image Library</h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
            {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'} stored
            {images.length !== filteredImages.length && ` of ${images.length} total`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-[#ff6b35] text-white'
                  : 'text-gray-400 hover:text-white [data-theme="light"]_&:hover:text-gray-900'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-[#ff6b35] text-white'
                  : 'text-gray-400 hover:text-white [data-theme="light"]_&:hover:text-gray-900'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchImages}
            disabled={loading}
            className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8c42] text-white rounded-lg transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3"
      >
        <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-blue-500 font-medium mb-1">Customer Order Images</h4>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
            All customer images are automatically saved with their order numbers for easy retrieval. This makes reordering quick and simple.
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, order ID, or customer email..."
            className="flex-1 bg-transparent text-white [data-theme='light']_&:text-gray-900 placeholder-gray-500 [data-theme='light']_&:placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Images Grid or List */}
      {loading ? (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
          <Loader2 className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">Loading images...</h3>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
            {searchQuery ? 'Try adjusting your search' : 'Customer images will appear here when orders are placed'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={`${image.orderId}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg overflow-hidden hover:border-[#ff6b35] transition-all shadow-lg"
            >
              {/* Image Preview */}
              <div className="aspect-square bg-[#0a0a0a] [data-theme='light']_&:bg-gray-100 relative overflow-hidden">
                <img
                  src={image.url}
                  alt={`Order ${image.orderNumber}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              {/* Image Details */}
              <div className="p-4 space-y-3">
                {/* Order Number */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-[#ff6b35]" />
                    <span className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Order Number</span>
                  </div>
                  <div className="text-lg font-semibold text-white [data-theme='light']_&:text-gray-900">
                    {image.orderNumber || image.orderId}
                  </div>
                </div>

                {/* Customer Email */}
                {image.customerEmail && (
                  <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 truncate">
                    {image.customerEmail}
                  </div>
                )}

                {/* Order Details */}
                {image.orderDetails && (
                  <div className="flex flex-wrap gap-2">
                    {image.orderDetails.size && (
                      <span className="px-2 py-1 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-gray-300 [data-theme='light']_&:text-gray-700 text-xs rounded">
                        {image.orderDetails.size}
                      </span>
                    )}
                    {image.orderDetails.finish && (
                      <span className="px-2 py-1 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-gray-300 [data-theme='light']_&:text-gray-700 text-xs rounded">
                        {image.orderDetails.finish}
                      </span>
                    )}
                    {image.orderDetails.mounting && (
                      <span className="px-2 py-1 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-gray-300 [data-theme='light']_&:text-gray-700 text-xs rounded">
                        {image.orderDetails.mounting}
                      </span>
                    )}
                  </div>
                )}

                {/* Upload Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500 [data-theme='light']_&:text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatDate(image.uploadedAt)}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleDownload(image)}
                    disabled={downloading === image.orderId}
                    className="flex-1 px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading === image.orderId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    )}
                  </button>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-white [data-theme='light']_&:text-gray-700 rounded-lg hover:bg-[#3a3a3a] [data-theme='light']_&:hover:bg-gray-200 transition-all flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredImages.map((image, index) => (
            <motion.div
              key={`${image.orderId}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg overflow-hidden hover:border-[#ff6b35] transition-all shadow-lg"
            >
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={image.url}
                    alt={`Order ${image.orderNumber}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Order Number and Email */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-[#ff6b35]" />
                      <span className="text-lg font-semibold text-white [data-theme='light']_&:text-gray-900">
                        {image.orderNumber || image.orderId}
                      </span>
                    </div>
                    {image.customerEmail && (
                      <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 truncate">
                        {image.customerEmail}
                      </div>
                    )}
                  </div>

                  {/* Order Details & Date */}
                  <div className="flex flex-wrap items-center gap-2">
                    {image.orderDetails?.size && (
                      <span className="px-2 py-1 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-gray-300 [data-theme='light']_&:text-gray-700 text-xs rounded">
                        {image.orderDetails.size}
                      </span>
                    )}
                    {image.orderDetails?.finish && (
                      <span className="px-2 py-1 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-gray-300 [data-theme='light']_&:text-gray-700 text-xs rounded">
                        {image.orderDetails.finish}
                      </span>
                    )}
                    {image.orderDetails?.mounting && (
                      <span className="px-2 py-1 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-gray-300 [data-theme='light']_&:text-gray-700 text-xs rounded">
                        {image.orderDetails.mounting}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500 [data-theme='light']_&:text-gray-500 ml-auto">
                      <Calendar className="w-3 h-3" />
                      {formatDate(image.uploadedAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(image)}
                    disabled={downloading === image.orderId}
                    className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {downloading === image.orderId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    )}
                  </button>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-white [data-theme='light']_&:text-gray-700 rounded-lg hover:bg-[#3a3a3a] [data-theme='light']_&:hover:bg-gray-200 transition-all flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}