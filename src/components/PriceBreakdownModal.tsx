import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Info } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
}

interface PriceBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    size: string;
    finish: string;
    mountType: string;
    frame: string;
    rushOrder: boolean;
  };
  totalPrice: number;
  inventory?: InventoryItem[]; // Optional inventory for real pricing
}

export function PriceBreakdownModal({ isOpen, onClose, config, totalPrice, inventory = [] }: PriceBreakdownModalProps) {
  // Calculate individual components
  const calculateBreakdown = () => {
    const dimensions = config.size.match(/(\d+\.?\d*)\s*[""]\s*×\s*(\d+\.?\d*)/);
    const width = dimensions ? parseFloat(dimensions[1]) : 8;
    const height = dimensions ? parseFloat(dimensions[2]) : 12;
    const squareInches = width * height;
    
    // Get base price from inventory if available
    let basePrice = 0;
    
    if (inventory.length > 0) {
      // Try to find exact size match in inventory
      const normalizeSize = (size: string) => {
        return size.toLowerCase()
          .replace(/[""\u0022\u201c\u201d]/g, '') // Remove all types of quotes
          .replace(/[×x]/gi, 'x') // Convert × to x
          .replace(/[\s\t\r\n]+/g, '') // Remove ALL whitespace
          .trim();
      };
      
      const targetSize = normalizeSize(config.size);
      const sizeItem = inventory.find(
        (item) => item.category === 'size' && normalizeSize(item.name) === targetSize
      );
      
      if (sizeItem) {
        basePrice = sizeItem.price;
      }
    }
    
    // Fallback to calculation if not found in inventory
    if (basePrice === 0) {
      // Base size pricing fallback
      const sampleSqIn = 35;
      const samplePrice = 25;
      
      if (config.size === '5" × 7"' || config.size === '7" × 5"' || squareInches <= sampleSqIn) {
        basePrice = samplePrice;
      } else {
        // Use fallback pricing based on square inches
        const sizePrices: { [key: number]: number } = {
          35: 25.00,     // 5x7
          96: 44.99,     // 12x8 (UPDATED from 42.00)
          187: 69.99,    // 17x11
          384: 109.99,   // 24x16
          600: 149.99,   // 30x20
          864: 199.99,   // 36x24
          1200: 269.99,  // 40x30
        };
        
        basePrice = sizePrices[squareInches] || 44.99;
      }
    }
    
    // Finish - Both Gloss and Matte are included at no extra cost
    const finishCost = 0;
    
    // Mount
    const mountMultiplier = squareInches / 80; // relative to 8x10
    let mountCost = 0;
    if (config.mountType === 'Float Mount') {
      mountCost = 3 * mountMultiplier;
    } else if (config.mountType === '3D Magnet') {
      mountCost = 5 * mountMultiplier;
    }
    
    // Frame
    const frameCost = config.frame !== 'None' ? 7 * mountMultiplier : 0;
    
    // Rush order
    const rushCost = config.rushOrder ? 89 : 0;
    
    return {
      base: basePrice,
      finish: finishCost,
      mount: mountCost,
      frame: frameCost,
      rush: rushCost,
    };
  };

  const breakdown = calculateBreakdown();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1a1a1a] border border-[#ff6b35]/30 rounded-2xl shadow-2xl max-w-md w-full p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-[#ff6b35]" />
                <h3 className="text-2xl text-white">Price Breakdown</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Configuration Summary */}
            <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">{config.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Finish:</span>
                  <span className="text-white">{config.finish}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mount:</span>
                  <span className="text-white">{config.mountType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frame:</span>
                  <span className="text-white">{config.frame}</span>
                </div>
                {config.rushOrder && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rush Order:</span>
                    <span className="text-[#ff6b35]">Yes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a]">
                <span className="text-gray-300">Base Print</span>
                <span className="text-white">${breakdown.base.toFixed(2)}</span>
              </div>
              
              {breakdown.finish > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a]">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">Gloss Finish</span>
                    <Info className="w-3 h-3 text-gray-500" />
                  </div>
                  <span className="text-white">+${breakdown.finish.toFixed(2)}</span>
                </div>
              )}
              
              {breakdown.mount > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a]">
                  <span className="text-gray-300">{config.mountType}</span>
                  <span className="text-white">+${breakdown.mount.toFixed(2)}</span>
                </div>
              )}
              
              {breakdown.frame > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a]">
                  <span className="text-gray-300">{config.frame} Frame</span>
                  <span className="text-white">+${breakdown.frame.toFixed(2)}</span>
                </div>
              )}
              
              {breakdown.rush > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#ff6b35]/10 border border-[#ff6b35]/30">
                  <span className="text-[#ff6b35]">Rush Order (2-3 days)</span>
                  <span className="text-[#ff6b35]">+${breakdown.rush.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-[#ff6b35]/30">
              <div className="flex items-center justify-between">
                <span className="text-xl text-white">Total</span>
                <span className="text-2xl text-[#ff6b35]">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-400">
                💡 Shipping cost will be calculated at checkout based on your location
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}