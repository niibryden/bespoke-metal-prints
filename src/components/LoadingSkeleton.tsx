import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
}

/**
 * Loading skeleton component for better perceived performance
 * Shows placeholder content while real content loads
 */
export const Skeleton = memo(({
  className = '',
  width = '100%',
  height = '20px',
  circle = false,
  count = 1,
}: SkeletonProps) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse bg-gray-200 ${circle ? 'rounded-full' : 'rounded'} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  ));

  return count === 1 ? skeletons[0] : <>{skeletons}</>;
});

Skeleton.displayName = 'Skeleton';

/**
 * Order card skeleton for admin dashboard
 */
export const OrderCardSkeleton = memo(() => (
  <div className="border border-gray-200 rounded-lg p-4 bg-white">
    <div className="flex items-center gap-4">
      {/* Icon skeleton */}
      <Skeleton width={40} height={40} circle />
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={16} />
      </div>
      
      {/* Action button skeleton */}
      <Skeleton width={80} height={36} />
    </div>
  </div>
));

OrderCardSkeleton.displayName = 'OrderCardSkeleton';

/**
 * Product card skeleton for collections
 */
export const ProductCardSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    {/* Image skeleton */}
    <Skeleton width="100%" height={200} className="rounded-none" />
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      <Skeleton width="80%" height={20} />
      <Skeleton width="60%" height={16} />
      <div className="flex justify-between items-center mt-4">
        <Skeleton width={60} height={24} />
        <Skeleton width={100} height={36} />
      </div>
    </div>
  </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

/**
 * Table row skeleton for admin tables
 */
export const TableRowSkeleton = memo(({ columns = 4 }: { columns?: number }) => (
  <tr className="border-b border-gray-200">
    {Array.from({ length: columns }, (_, i) => (
      <td key={i} className="p-4">
        <Skeleton width="90%" height={16} />
      </td>
    ))}
  </tr>
));

TableRowSkeleton.displayName = 'TableRowSkeleton';

/**
 * Image gallery skeleton
 */
export const GallerySkeleton = memo(({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} width="100%" height={200} />
    ))}
  </div>
));

GallerySkeleton.displayName = 'GallerySkeleton';

/**
 * Full page skeleton for major page loads
 */
export const PageSkeleton = memo(() => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header skeleton */}
    <div className="mb-8">
      <Skeleton width="40%" height={36} className="mb-2" />
      <Skeleton width="60%" height={20} />
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-4">
      <Skeleton width="100%" height={120} />
      <Skeleton width="100%" height={120} />
      <Skeleton width="100%" height={120} />
    </div>
  </div>
));

PageSkeleton.displayName = 'PageSkeleton';

/**
 * Dashboard stats skeleton
 */
export const StatsSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm p-6">
        <Skeleton width={48} height={48} circle className="mb-4" />
        <Skeleton width="60%" height={24} className="mb-2" />
        <Skeleton width="40%" height={16} />
      </div>
    ))}
  </div>
));

StatsSkeleton.displayName = 'StatsSkeleton';

/**
 * Order details skeleton
 */
export const OrderDetailsSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    {/* Header */}
    <div className="border-b border-gray-200 pb-4 mb-4">
      <Skeleton width="40%" height={28} className="mb-2" />
      <Skeleton width="30%" height={16} />
    </div>
    
    {/* Customer info */}
    <div className="space-y-3 mb-6">
      <Skeleton width="100%" height={20} />
      <Skeleton width="90%" height={20} />
      <Skeleton width="80%" height={20} />
    </div>
    
    {/* Order items */}
    <div className="space-y-4 mb-6">
      <Skeleton width="100%" height={100} />
      <Skeleton width="100%" height={100} />
    </div>
    
    {/* Total */}
    <div className="border-t border-gray-200 pt-4">
      <Skeleton width="50%" height={24} />
    </div>
  </div>
));

OrderDetailsSkeleton.displayName = 'OrderDetailsSkeleton';

/**
 * Configurator skeleton
 */
export const ConfiguratorSkeleton = memo(() => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Steps */}
    <div className="flex justify-center mb-8">
      <div className="flex gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} width={100} height={60} />
        ))}
      </div>
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preview */}
      <Skeleton width="100%" height={500} />
      
      {/* Options */}
      <div className="space-y-6">
        <Skeleton width="100%" height={80} />
        <Skeleton width="100%" height={80} />
        <Skeleton width="100%" height={80} />
        <Skeleton width="100%" height={60} />
      </div>
    </div>
  </div>
));

ConfiguratorSkeleton.displayName = 'ConfiguratorSkeleton';

/**
 * General loading skeleton for page transitions
 */
export const LoadingSkeleton = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';