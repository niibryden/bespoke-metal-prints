import { Truck } from 'lucide-react';

interface FreeShippingProgressProps {
  cartTotal: number;
  threshold?: number;
}

export function FreeShippingProgress({ cartTotal, threshold = 100 }: FreeShippingProgressProps) {
  const remaining = threshold - cartTotal;
  const progress = Math.min((cartTotal / threshold) * 100, 100);
  const isEligible = cartTotal >= threshold;

  if (isEligible) {
    return (
      <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-green-500 font-semibold">
              🎉 You've qualified for FREE SHIPPING!
            </p>
            <p className="text-green-600 dark:text-green-400 text-sm">
              Your order ships free
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-500" />
          <span className="text-blue-500 font-semibold text-sm">
            Add ${remaining.toFixed(2)} more for FREE SHIPPING
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-700 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Free shipping on all orders over ${threshold}
      </p>
    </div>
  );
}
