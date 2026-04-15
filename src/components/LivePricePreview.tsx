import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, ChevronDown, ChevronUp, Info, CreditCard, Smartphone } from 'lucide-react';

interface LivePricePreviewProps {
  size: string;
  finish: string;
  mountType: string;
  frame: string;
  rushOrder: boolean;
  basePrice: number;
  totalPrice: number;
  breakdown?: {
    basePrice: number;
    finishUpcharge: number;
    mountUpcharge: number;
    frameUpcharge: number;
    rushOrderUpcharge: number;
  };
  isSticky?: boolean;
}

export function LivePricePreview({
  size,
  finish,
  mountType,
  frame,
  rushOrder,
  basePrice,
  totalPrice,
  breakdown,
  isSticky = true,
}: LivePricePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate breakdown if not provided
  const priceBreakdown = breakdown || {
    basePrice: basePrice,
    finishUpcharge: finish === 'Matte' ? 15 : 0,
    mountUpcharge: mountType === 'Float Mount' ? 23 : mountType === 'Easel' ? 15 : 0,
    frameUpcharge: frame === 'None' ? 0 : frame === 'Black' || frame === 'White' ? 35 : 45,
    rushOrderUpcharge: rushOrder ? 29.99 : 0,
  };

  return (
    <div className={`${isSticky ? 'lg:sticky lg:top-24' : ''} w-full`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl border-2 border-[#ff6b35]/30 shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div 
          className="p-4 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Your Print</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                ${totalPrice.toFixed(2)}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Current Configuration Summary */}
        <div className="p-4 bg-[#0a0a0a]/50 border-b border-[#ff6b35]/20">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Size:</span>
              <span className="text-white ml-2 font-medium">{size}</span>
            </div>
            <div>
              <span className="text-gray-400">Finish:</span>
              <span className="text-white ml-2 font-medium">{finish}</span>
            </div>
            <div>
              <span className="text-gray-400">Mount:</span>
              <span className="text-white ml-2 font-medium">{mountType}</span>
            </div>
            <div>
              <span className="text-gray-400">Frame:</span>
              <span className="text-white ml-2 font-medium">{frame}</span>
            </div>
          </div>
          {rushOrder && (
            <div className="mt-2 px-2 py-1 bg-[#ff6b35]/20 border border-[#ff6b35]/40 rounded text-xs text-[#ff6b35] font-medium inline-block">
              ⚡ Rush Order (2-3 days)
            </div>
          )}
        </div>

        {/* Expanded Price Breakdown */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Base Price */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Base ({size})</span>
                  <span className="text-white font-medium">
                    ${priceBreakdown.basePrice.toFixed(2)}
                  </span>
                </div>

                {/* Finish Upcharge */}
                {priceBreakdown.finishUpcharge > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{finish} Finish</span>
                    <span className="text-[#ff6b35]">
                      +${priceBreakdown.finishUpcharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Mount Upcharge */}
                {priceBreakdown.mountUpcharge > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{mountType}</span>
                    <span className="text-[#ff6b35]">
                      +${priceBreakdown.mountUpcharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Frame Upcharge */}
                {priceBreakdown.frameUpcharge > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{frame} Frame</span>
                    <span className="text-[#ff6b35]">
                      +${priceBreakdown.frameUpcharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Rush Order */}
                {priceBreakdown.rushOrderUpcharge > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">⚡ Rush Order</span>
                    <span className="text-[#ff6b35]">
                      +${priceBreakdown.rushOrderUpcharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="pt-3 border-t border-[#ff6b35]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-[#ff6b35]">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Shipping Note */}
                <div className="pt-2 border-t border-[#ff6b35]/20">
                  <div className="flex items-start gap-2 text-xs text-gray-400">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Shipping calculated at checkout based on your address</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Methods */}
        <div className="p-4 bg-[#1a1a1a]/50 border-t border-[#ff6b35]/20">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span>Cards</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span>Apple Pay</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span>Google Pay</span>
            </div>
          </div>
        </div>

        {/* Bulk Discount Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-3 bg-gradient-to-r from-green-500/10 to-green-600/10 border-t border-green-500/20"
        >
          <p className="text-xs text-center text-green-400">
            💡 <strong>Save 15%</strong> when you add 4 or more prints to cart!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}