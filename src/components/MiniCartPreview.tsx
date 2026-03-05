import { motion } from 'motion/react';
import { Check, ShoppingCart, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MiniCartPreviewProps {
  item: {
    image: string;
    size: string;
    price: number;
  };
  cartCount: number;
  cartTotal: number;
  onViewCart: () => void;
  onClose: () => void;
}

export function MiniCartPreview({ item, cartCount, cartTotal, onViewCart, onClose }: MiniCartPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className="fixed bottom-24 right-6 z-[100] w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border-2 border-green-500 overflow-hidden"
    >
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Check className="w-5 h-5" />
          </motion.div>
          <div>
            <h3 className="font-semibold">Added to Cart!</h3>
            <p className="text-xs text-green-100">{cartCount} {cartCount === 1 ? 'item' : 'items'} • ${cartTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Item Preview */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg overflow-hidden flex-shrink-0">
            <ImageWithFallback
              src={item.image}
              alt="Added item"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-black dark:text-white text-sm">Metal Print</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{item.size}</p>
            <p className="text-sm font-semibold text-[#ff6b35] mt-1">${item.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors text-sm font-medium"
          >
            Continue
          </button>
          <button
            onClick={onViewCart}
            className="flex-1 px-3 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        className="h-1 bg-green-500 origin-left"
        onAnimationComplete={onClose}
      />
    </motion.div>
  );
}
