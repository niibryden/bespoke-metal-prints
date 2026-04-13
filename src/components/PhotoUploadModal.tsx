import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { getServerUrl } from '../utils/serverUrl';

interface PhotoUploadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
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

const PRINT_SIZES_AND_PRICES = [
  { size: '5" × 7"', basePrice: 25.00, yourRoyalty: 6.25 },
  { size: '12" × 8"', basePrice: 49.99, yourRoyalty: 12.50 },
  { size: '17" × 11"', basePrice: 69.99, yourRoyalty: 17.50 },
  { size: '24" × 16"', basePrice: 109.99, yourRoyalty: 27.50 },
  { size: '30" × 20"', basePrice: 149.99, yourRoyalty: 37.50 },
  { size: '36" × 24"', basePrice: 189.99, yourRoyalty: 47.50 },
  { size: '40" × 30"', basePrice: 249.99, yourRoyalty: 62.50 },
  { size: '48" × 32"', basePrice: 299.99, yourRoyalty: 75.00 },
];

export function PhotoUploadModal({ onClose, onSuccess }: PhotoUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'nature',
    basePrice: '0',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('Image must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    // Check image dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width < 3000 || img.height < 2000) {
        setError(`Image resolution too low: ${img.width}x${img.height}. Minimum required: 3000x2000 pixels`);
      }
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select an image to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for your photo');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Get current user session
      const supabase = getSupabaseClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to upload photos');
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('basePrice', formData.basePrice);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload photo
      console.log('📤 Uploading to:', `${getServerUrl()}/marketplace/photographer/upload`);

      const response = await fetch(`${getServerUrl()}/marketplace/photographer/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Read response as text first, then parse as JSON
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Non-JSON response from server:', responseText.substring(0, 200));
        throw new Error(`Server error (${response.status}): Invalid response format`);
      }

      if (!response.ok) {
        // Show detailed error message from server
        const errorMsg = data.message || data.error || 'Failed to upload photo';
        console.error('❌ Upload failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Photo uploaded successfully:', data.photo.id);
      setSuccess(true);

      // Close modal after a delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('❌ Photo upload error:', err);
      setError(err.message || 'Failed to upload photo');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff6b35]/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Photo</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add a new photo to the marketplace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-[#ff6b35] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Photo Uploaded Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your photo will be reviewed within 24 hours and then appear in the marketplace.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Requirements Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">Photo Requirements:</p>
                      <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                        <li>• Minimum 3000 x 2000 pixels (6MP+)</li>
                        <li>• Original work - you own full rights</li>
                        <li>• Professional quality composition</li>
                        <li>• No watermarks (we'll protect your work)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Royalty Pricing Guide */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">
                        Your Royalty Earnings (25%)
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        You earn 25% every time a customer orders your photo as a metal print. Prices vary by size:
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-lg overflow-hidden border border-green-200 dark:border-green-800/50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-green-100 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
                          <th className="text-left px-4 py-2 font-semibold text-green-900 dark:text-green-100">Print Size</th>
                          <th className="text-right px-4 py-2 font-semibold text-green-900 dark:text-green-100">Customer Pays</th>
                          <th className="text-right px-4 py-2 font-semibold text-green-900 dark:text-green-100">You Earn (25%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PRINT_SIZES_AND_PRICES.map((item, index) => (
                          <tr 
                            key={item.size} 
                            className={`border-b border-green-100 dark:border-green-900/30 ${
                              index % 2 === 0 ? 'bg-green-50/30 dark:bg-green-900/10' : ''
                            }`}
                          >
                            <td className="px-4 py-2.5 text-gray-900 dark:text-white font-medium">
                              {item.size}
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">
                              ${item.basePrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-green-700 dark:text-green-400 font-bold">
                              ${item.yourRoyalty.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-3 text-xs text-green-800 dark:text-green-200 space-y-1">
                    <p>💡 <strong>Example:</strong> If a customer orders your photo as a 24" × 16" print for $109.99, you earn $27.50</p>
                    <p>📊 <strong>Multiple sales:</strong> One photo can be sold unlimited times across different sizes</p>
                    <p>✅ <strong>Full transparency:</strong> Track every sale in your dashboard with complete details</p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Photo <span className="text-red-500">*</span>
                  </label>
                  
                  {!preview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl p-12 text-center hover:border-[#ff6b35] hover:bg-[#ff6b35]/5 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Click to upload your photo
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG up to 50MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#2a2a2a]">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setPreview('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give your photo a descriptive title"
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your photo, location, story behind it..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="sunset, beach, ocean (comma separated)"
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Help customers find your photo with relevant tags
                  </p>
                </div>

                {/* Upload Progress */}
                {loading && (
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploading...
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-[#ff6b35]"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-white rounded-lg hover:border-[#ff6b35] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="flex-1 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Photo
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}