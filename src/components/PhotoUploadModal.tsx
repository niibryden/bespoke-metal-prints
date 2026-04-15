import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { getServerUrl } from '../utils/serverUrl';

interface PhotoUploadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadFile {
  file: File;
  preview: string;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  title: string;
  description: string;
  tags: string;
  category: string;
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
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [completedUploads, setCompletedUploads] = useState(0);
  const [isRoyaltyExpanded, setIsRoyaltyExpanded] = useState(false);
  const [globalCategory, setGlobalCategory] = useState('nature');
  const [globalTags, setGlobalTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError('');
    const newFiles: UploadFile[] = [];

    for (const file of selectedFiles) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError(`${file.name} is too large (max 50MB)`);
        continue;
      }

      // Generate filename without extension for default title
      const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const uploadFile: UploadFile = {
        file,
        preview: '',
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        progress: 0,
        title: defaultTitle,
        description: '',
        tags: globalTags,
        category: globalCategory,
      };

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadFile.preview = e.target?.result as string;
        setFiles((prev) => {
          const index = prev.findIndex((f) => f.id === uploadFile.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = { ...updated[index], preview: uploadFile.preview };
            return updated;
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);

      // Check image dimensions in background
      const img = new Image();
      img.onload = () => {
        if (img.width < 3000 || img.height < 2000) {
          setFiles((prev) => {
            const index = prev.findIndex((f) => f.id === uploadFile.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                status: 'error',
                error: `Resolution too low: ${img.width}×${img.height}px (minimum: 3000×2000px)`,
              };
              return updated;
            }
            return prev;
          });
        }
      };
      img.src = URL.createObjectURL(file);

      newFiles.push(uploadFile);
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...updates };
        return updated;
      }
      return prev;
    });
  };

  const uploadSingleFile = async (uploadFile: UploadFile, session: any) => {
    updateFile(uploadFile.id, { status: 'uploading', progress: 0 });

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('title', uploadFile.title);
      formData.append('description', uploadFile.description);
      formData.append('tags', uploadFile.tags);
      formData.append('category', uploadFile.category);
      formData.append('basePrice', '0');

      // Simulate progress
      const progressInterval = setInterval(() => {
        updateFile(uploadFile.id, {
          progress: Math.min((uploadFile.progress || 0) + 10, 90),
        });
      }, 200);

      const response = await fetch(`${getServerUrl()}/marketplace/photographer/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Server error (${response.status}): Invalid response format`);
      }

      if (!response.ok) {
        const errorMsg = data.message || data.error || 'Failed to upload photo';
        throw new Error(errorMsg);
      }

      updateFile(uploadFile.id, { status: 'success', progress: 100 });
      setCompletedUploads((prev) => prev + 1);
    } catch (err: any) {
      console.error(`❌ Upload failed for ${uploadFile.title}:`, err);
      updateFile(uploadFile.id, {
        status: 'error',
        progress: 0,
        error: err.message || 'Upload failed',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    // Check if any file has validation errors
    const invalidFiles = files.filter((f) => f.status === 'error');
    if (invalidFiles.length > 0) {
      setError('Please remove files with errors before uploading');
      return;
    }

    // Check if all files have titles
    const missingTitles = files.filter((f) => !f.title.trim());
    if (missingTitles.length > 0) {
      setError('Please provide titles for all photos');
      return;
    }

    setUploading(true);
    setError('');
    setCompletedUploads(0);

    try {
      // Get current user session
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You must be logged in to upload photos');
      }

      // Upload files sequentially to avoid overwhelming the server
      for (const file of files) {
        if (file.status !== 'error') {
          await uploadSingleFile(file, session);
        }
      }

      // Close modal after a delay if all uploads succeeded
      const failedUploads = files.filter((f) => f.status === 'error');
      if (failedUploads.length === 0) {
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(`${failedUploads.length} file(s) failed to upload. Please retry or remove them.`);
      }
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      setError(err.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const allUploadsComplete = files.length > 0 && files.every((f) => f.status === 'success');
  const hasErrors = files.some((f) => f.status === 'error');

  return (
    <motion.div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) onClose();
      }}
    >
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Photos</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {files.length > 0 ? `${files.length} photo${files.length === 1 ? '' : 's'} selected` : 'Add photos to the marketplace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-[#ff6b35] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {allUploadsComplete ? (
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
                  {files.length === 1 ? 'Photo' : `All ${files.length} Photos`} Uploaded Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your photo{files.length === 1 ? '' : 's'} will be reviewed within 24 hours and then appear in the marketplace.
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
                        <li>• Minimum 3000 × 2000 pixels (6MP+)</li>
                        <li>• Original work - you own full rights</li>
                        <li>• Professional quality composition</li>
                        <li>• No watermarks (we'll protect your work)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Royalty Pricing Guide */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsRoyaltyExpanded(!isRoyaltyExpanded)}
                    className="w-full flex items-start gap-3 p-5 hover:bg-green-100/50 dark:hover:bg-green-900/10 transition-colors"
                  >
                    <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">
                        Your Royalty Earnings (25%)
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        You earn 25% every time a customer orders your photo as a metal print.
                      </p>
                    </div>
                    <div className="p-2 flex-shrink-0">
                      {isRoyaltyExpanded ? (
                        <ChevronUp className="w-5 h-5 text-green-700 dark:text-green-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-green-700 dark:text-green-400" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isRoyaltyExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Photos <span className="text-red-500">*</span>
                  </label>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl p-8 text-center hover:border-[#ff6b35] hover:bg-[#ff6b35]/5 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      Click to select photos
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PNG, JPG up to 50MB • Select multiple files
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Global Settings (when multiple files) */}
                {files.length > 1 && (
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Apply to All Photos
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={globalCategory}
                          onChange={(e) => {
                            setGlobalCategory(e.target.value);
                            setFiles((prev) => prev.map((f) => ({ ...f, category: e.target.value })));
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none text-sm"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tags
                        </label>
                        <input
                          type="text"
                          value={globalTags}
                          onChange={(e) => {
                            setGlobalTags(e.target.value);
                            setFiles((prev) => prev.map((f) => ({ ...f, tags: e.target.value })));
                          }}
                          placeholder="sunset, beach, ocean"
                          className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Files */}
                {files.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Selected Photos ({files.length})
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`border rounded-lg p-3 ${
                            file.status === 'error'
                              ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                              : file.status === 'success'
                              ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                              : file.status === 'uploading'
                              ? 'border-[#ff6b35] bg-[#ff6b35]/5'
                              : 'border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a]'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Preview */}
                            <div className="flex-shrink-0">
                              {file.preview ? (
                                <img
                                  src={file.preview}
                                  alt={file.title}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <input
                                  type="text"
                                  value={file.title}
                                  onChange={(e) => updateFile(file.id, { title: e.target.value })}
                                  placeholder="Photo title"
                                  disabled={uploading}
                                  className="flex-1 px-2 py-1 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/20 transition-all outline-none disabled:opacity-50"
                                />
                                {!uploading && file.status !== 'success' && (
                                  <button
                                    type="button"
                                    onClick={() => removeFile(file.id)}
                                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <span>{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span>{CATEGORIES.find((c) => c.value === file.category)?.label}</span>
                              </div>

                              {/* Status */}
                              {file.status === 'uploading' && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Uploading...</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{file.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-[#2a2a2a] rounded-full h-1.5">
                                    <motion.div
                                      className="h-full bg-[#ff6b35] rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${file.progress}%` }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </div>
                                </div>
                              )}

                              {file.status === 'success' && (
                                <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400 text-xs">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Uploaded successfully</span>
                                </div>
                              )}

                              {file.status === 'error' && file.error && (
                                <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-xs">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>{file.error}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress Summary */}
                {uploading && (
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploading photos...
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {completedUploads} / {files.length} complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-[#ff6b35]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedUploads / files.length) * 100}%` }}
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
                    disabled={uploading}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-white rounded-lg hover:border-[#ff6b35] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || files.length === 0 || hasErrors}
                    className="flex-1 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading {completedUploads}/{files.length}...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload {files.length} Photo{files.length === 1 ? '' : 's'}
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
