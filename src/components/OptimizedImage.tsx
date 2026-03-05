import { memo, useState, useEffect, useRef } from 'react';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Skip lazy loading for above-fold images
  thumbnail?: string; // Optional low-res thumbnail for progressive loading
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  thumbnail,
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority); // If priority, show immediately
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Thumbnail (blurred placeholder) */}
      {thumbnail && !loaded && !error && (
        <img
          src={thumbnail}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!loaded && !error && !thumbnail && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Actual image (loaded only when in view) */}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          width={width}
          height={height}
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if src or critical props change
  return (
    prevProps.src === nextProps.src &&
    prevProps.className === nextProps.className &&
    prevProps.priority === nextProps.priority
  );
});

OptimizedImage.displayName = 'OptimizedImage';
