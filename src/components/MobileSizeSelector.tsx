import { motion } from 'motion/react';
import { Check, Star, TrendingUp, Sparkles } from 'lucide-react';

interface SizeOption {
  name: string;
  price: number;
  popular?: boolean;
  bestValue?: boolean;
  sample?: boolean;
  available: boolean;
  lowStock?: boolean;
}

interface MobileSizeSelectorProps {
  selectedSize: string;
  sizes: SizeOption[];
  onSelectSize: (size: string) => void;
}

export function MobileSizeSelector({ selectedSize, sizes, onSelectSize }: MobileSizeSelectorProps) {
  // Group sizes by category
  const sampleSizes = sizes.filter(s => s.sample);
  const popularSizes = sizes.filter(s => s.popular && !s.sample);
  const otherSizes = sizes.filter(s => !s.popular && !s.sample);

  const renderSizeButton = (size: SizeOption) => {
    const isSelected = selectedSize === size.name;
    
    return (
      <motion.button
        key={size.name}
        onClick={() => size.available && onSelectSize(size.name)}
        disabled={!size.available}
        whileTap={{ scale: size.available ? 0.98 : 1 }}
        className={`
          relative w-full
          p-4 rounded-xl
          border-2 transition-all
          min-h-[80px]
          flex flex-col items-center justify-center
          touch-manipulation
          ${isSelected
            ? 'border-[#ff6b35] bg-[#ff6b35]/10 shadow-lg shadow-[#ff6b35]/20'
            : size.available
            ? 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:bg-white [data-theme=\'light\']_&:border-gray-300'
            : 'border-[#1a1a1a] bg-[#0a0a0a] opacity-50 cursor-not-allowed'
          }
        `}
        aria-label={`Select ${size.name} size${!size.available ? ' (out of stock)' : ''}`}
        aria-pressed={isSelected}
        aria-disabled={!size.available}
      >
        {/* Badge */}
        {size.popular && size.available && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3" aria-hidden="true" />
            POPULAR
          </div>
        )}
        
        {size.bestValue && size.available && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
            BEST VALUE
          </div>
        )}
        
        {size.sample && size.available && (
          <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            SAMPLE
          </div>
        )}

        {/* Check Mark */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-white" aria-hidden="true" />
          </motion.div>
        )}

        {/* Size Name */}
        <span className={`
          text-lg font-semibold mb-1
          ${isSelected ? 'text-[#ff6b35]' : 'text-white [data-theme=\'light\']_&:text-gray-900'}
        `}>
          {size.name}
        </span>

        {/* Price */}
        <span className={`
          text-sm
          ${isSelected ? 'text-[#ff6b35]' : 'text-gray-400 [data-theme=\'light\']_&:text-gray-600'}
        `}>
          ${size.price.toFixed(2)}
        </span>

        {/* Stock Status */}
        {!size.available && (
          <span className="text-xs text-red-500 mt-1">Out of Stock</span>
        )}
        {size.available && size.lowStock && (
          <span className="text-xs text-yellow-500 mt-1">Low Stock</span>
        )}
      </motion.button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Sample Sizes */}
      {sampleSizes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2 [data-theme='light']_&:text-gray-600">
            Sample Sizes
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {sampleSizes.map(renderSizeButton)}
          </div>
        </div>
      )}

      {/* Popular Sizes */}
      {popularSizes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2 [data-theme='light']_&:text-gray-600">
            <Star className="w-4 h-4 text-green-500" aria-hidden="true" />
            Most Popular
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {popularSizes.map(renderSizeButton)}
          </div>
        </div>
      )}

      {/* Other Sizes */}
      {otherSizes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2 [data-theme='light']_&:text-gray-600">
            All Sizes
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {otherSizes.map(renderSizeButton)}
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center [data-theme='light']_&:text-gray-600">
        All prints include high-quality aluminum substrate
      </p>
    </div>
  );
}
