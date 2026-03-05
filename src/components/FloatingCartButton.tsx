import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useEffect, useState } from 'react';

interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [prevCount, setPrevCount] = useState(0);
  const [shouldPulse, setShouldPulse] = useState(false);

  // Detect when items are added
  useEffect(() => {
    if (itemCount > prevCount) {
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 1000);
    }
    setPrevCount(itemCount);
  }, [itemCount]);

  // Don't show button if cart is empty
  if (itemCount === 0) {
    return null;
  }

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#ff6b35] text-white rounded-full shadow-2xl shadow-[#ff6b35]/50 flex items-center justify-center hover:bg-[#ff8555] transition-colors"
      aria-label="Open cart"
    >
      {/* Pulse ring when items added */}
      {shouldPulse && (
        <motion.div
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-[#ff6b35] rounded-full"
        />
      )}
      
      <motion.div
        animate={shouldPulse ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <ShoppingCart className="w-7 h-7" />
      </motion.div>
      
      {/* Badge with count */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
