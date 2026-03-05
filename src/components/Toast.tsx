import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, ShoppingCart, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({ message, type = 'success', duration = 4000, onClose, action }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <ShoppingCart className="w-5 h-5 text-[#ff6b35]" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-orange-50 border-[#ff6b35]/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-20 right-6 z-[100] max-w-md w-full ${bgColors[type]} border-2 rounded-xl shadow-2xl p-4 backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="mt-2 text-sm font-medium text-[#ff6b35] hover:text-[#ff8555] transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff6b35] origin-left rounded-b-xl"
        />
      )}
    </motion.div>
  );
}
