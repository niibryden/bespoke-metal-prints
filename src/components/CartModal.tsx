import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartModalProps {
  onClose: () => void;
  onCheckout: () => void;
}

export function CartModal({ onClose, onCheckout }: CartModalProps) {
  const { items, removeItem, getTotalPrice, getItemCount, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length > 0) {
      onCheckout();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-[#2a2a2a]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff6b35]/10 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white">Shopping Cart</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'} in cart
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#0a0a0a] rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Add items to your cart to get started
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors"
              >
                Start Designing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-[#2a2a2a]"
                  >
                    {/* Image Preview */}
                    <div className="w-24 h-24 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.thumbnail || item.image}
                        alt="Cart item"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-black dark:text-white mb-2">Metal Print</h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>Size: <span className="font-medium">{item.size}</span></p>
                        <p>Finish: <span className="font-medium">{item.finish}</span></p>
                        <p>Mount: <span className="font-medium">{item.mountType}</span></p>
                        {item.frame !== 'None' && (
                          <p>Frame: <span className="font-medium">{item.frame}</span></p>
                        )}
                        {item.rushOrder && (
                          <p className="text-[#ff6b35] font-medium">⚡ Rush Order</p>
                        )}
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <p className="font-semibold text-lg text-black dark:text-white">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-[#2a2a2a] p-6 bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-xl">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">${getTotalPrice().toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors font-medium"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-lg hover:from-[#ff8555] hover:to-[#ffa066] transition-all font-semibold shadow-xl shadow-[#ff6b35]/30 flex items-center justify-center gap-2"
                >
                  <span>Checkout ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Clear Cart - Less prominent */}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                className="w-full mt-3 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Clear all items
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}