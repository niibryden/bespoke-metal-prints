import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, XCircle, Info, HelpCircle } from 'lucide-react';

interface ImageQualityAnalyzerProps {
  imageUrl: string | null;
  selectedSize: string;
  onQualityAnalyzed?: (quality: QualityLevel) => void;
}

export type QualityLevel = 'excellent' | 'good' | 'fair' | 'poor';

interface QualityResult {
  level: QualityLevel;
  dpi: number;
  pixelWidth: number;
  pixelHeight: number;
  recommendedMaxSize: string;
  message: string;
  icon: typeof CheckCircle;
  color: string;
  recommendedSizes: string[];
}

export function ImageQualityAnalyzer({ imageUrl, selectedSize, onQualityAnalyzed }: ImageQualityAnalyzerProps) {
  const [quality, setQuality] = useState<QualityResult | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setQuality(null);
      return;
    }

    analyzeImage();
  }, [imageUrl]);

  const analyzeImage = async () => {
    if (!imageUrl) return;

    setAnalyzing(true);

    try {
      const img = new Image();
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // Calculate print quality based on DPI
      // Standard for high-quality prints: 300 DPI
      // Acceptable: 150-200 DPI
      // Poor: < 150 DPI

      const sizeData = [
        { size: '5" × 7"', widthInches: 5, heightInches: 7 },
        { size: '8" × 10"', widthInches: 8, heightInches: 10 },
        { size: '8" × 12"', widthInches: 8, heightInches: 12 },
        { size: '11" × 14"', widthInches: 11, heightInches: 14 },
        { size: '12" × 18"', widthInches: 12, heightInches: 18 },
        { size: '16" × 20"', widthInches: 16, heightInches: 20 },
        { size: '16" × 24"', widthInches: 16, heightInches: 24 },
        { size: '20" × 30"', widthInches: 20, heightInches: 30 },
        { size: '24" × 36"', widthInches: 24, heightInches: 36 },
      ];

      // Find DPI for each size (assuming landscape orientation)
      const qualityForSizes = sizeData.map(s => {
        const dpiWidth = width / s.widthInches;
        const dpiHeight = height / s.heightInches;
        const minDpi = Math.min(dpiWidth, dpiHeight);
        return { ...s, dpi: minDpi };
      });

      // Find the largest size that maintains good quality (>= 200 DPI)
      const excellentSizes = qualityForSizes.filter(s => s.dpi >= 300);
      const goodSizes = qualityForSizes.filter(s => s.dpi >= 200 && s.dpi < 300);
      const fairSizes = qualityForSizes.filter(s => s.dpi >= 150 && s.dpi < 200);

      let result: QualityResult;

      if (excellentSizes.length > 0) {
        const maxSize = excellentSizes[excellentSizes.length - 1];
        result = {
          level: 'excellent',
          dpi: maxSize.dpi,
          pixelWidth: width,
          pixelHeight: height,
          recommendedMaxSize: maxSize.size,
          message: `Excellent quality for prints up to ${maxSize.size}`,
          icon: CheckCircle,
          color: '#10b981', // green-500
          recommendedSizes: excellentSizes.map(s => s.size),
        };
      } else if (goodSizes.length > 0) {
        const maxSize = goodSizes[goodSizes.length - 1];
        result = {
          level: 'good',
          dpi: maxSize.dpi,
          pixelWidth: width,
          pixelHeight: height,
          recommendedMaxSize: maxSize.size,
          message: `Good quality for prints up to ${maxSize.size}`,
          icon: AlertTriangle,
          color: '#f59e0b', // amber-500
          recommendedSizes: goodSizes.map(s => s.size),
        };
      } else if (fairSizes.length > 0) {
        const maxSize = fairSizes[fairSizes.length - 1];
        result = {
          level: 'fair',
          dpi: maxSize.dpi,
          pixelWidth: width,
          pixelHeight: height,
          recommendedMaxSize: maxSize.size,
          message: `Fair quality - works for prints up to ${maxSize.size}`,
          icon: AlertTriangle,
          color: '#f97316', // orange-500
          recommendedSizes: fairSizes.map(s => s.size),
        };
      } else {
        result = {
          level: 'poor',
          dpi: qualityForSizes[0]?.dpi || 0,
          pixelWidth: width,
          pixelHeight: height,
          recommendedMaxSize: '5" × 7"',
          message: 'Image resolution too low - please upload a higher quality photo',
          icon: XCircle,
          color: '#ef4444', // red-500
          recommendedSizes: [],
        };
      }

      setQuality(result);
      onQualityAnalyzed?.(result.level);
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!imageUrl || analyzing) {
    return null;
  }

  if (!quality) {
    return null;
  }

  const Icon = quality.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div 
        className="border-2 rounded-xl p-4"
        style={{ 
          borderColor: quality.color,
          backgroundColor: `${quality.color}10`
        }}
      >
        <div className="flex items-start gap-3">
          <Icon 
            className="w-6 h-6 flex-shrink-0 mt-0.5" 
            style={{ color: quality.color }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 
                className="font-semibold text-lg"
                style={{ color: quality.color }}
              >
                {quality.level === 'excellent' && '✓ Excellent Print Quality'}
                {quality.level === 'good' && '✓ Good Print Quality'}
                {quality.level === 'fair' && '⚠ Fair Print Quality'}
                {quality.level === 'poor' && '✗ Low Print Quality'}
              </h4>
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Why does resolution matter?"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {quality.message}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Resolution:</span> {quality.pixelWidth} × {quality.pixelHeight}px
              </div>
              <div>
                <span className="font-medium">Print DPI:</span> ~{Math.round(quality.dpi)} DPI
              </div>
            </div>

            {quality.level === 'poor' && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Recommendation:</strong> For the best results, upload an image with at least 2400 × 3000 pixels.
                </p>
              </div>
            )}

            {(quality.level === 'good' || quality.level === 'fair') && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Tip:</strong> For larger prints, consider uploading a higher resolution image for sharper results.
                </p>
              </div>
            )}

            {quality.recommendedSizes.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  ✓ Recommended sizes for this image:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quality.recommendedSizes.map(size => (
                    <span
                      key={size}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        size === selectedSize
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Educational Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Why does resolution matter?
                  </h5>
                  <p className="mb-2">
                    Print quality depends on <strong>DPI (dots per inch)</strong> - how many pixels from your image 
                    fit into each inch of the physical print.
                  </p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li><strong>300+ DPI:</strong> Professional quality - sharp, crisp details</li>
                    <li><strong>200-300 DPI:</strong> Good quality - suitable for most prints</li>
                    <li><strong>150-200 DPI:</strong> Acceptable - may show slight pixelation</li>
                    <li><strong>&lt;150 DPI:</strong> Poor quality - visible pixelation</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    💡 <strong>Pro tip:</strong> Larger prints require higher resolution images to maintain quality.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
