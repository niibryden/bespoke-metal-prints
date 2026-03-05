import React from 'react';
import { Home } from 'lucide-react';
import { motion } from 'motion/react';

interface ReturnToHomeButtonProps {
  onClick: () => void;
  variant?: 'dark' | 'light';
  className?: string;
}

export function ReturnToHomeButton({ onClick, variant = 'light', className = '' }: ReturnToHomeButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        transition-all duration-200 transform hover:scale-105
        ${variant === 'dark' 
          ? 'bg-gray-900 dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700' 
          : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
        }
        border-2 border-[#ff6b35]/30 hover:border-[#ff6b35]
        shadow-md hover:shadow-lg hover:shadow-[#ff6b35]/20
        ${className}
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: -4 }}
      aria-label="Return to home page"
    >
      <Home className="w-4 h-4 text-[#ff6b35]" />
      <span className="text-sm font-medium">Return to Home</span>
    </motion.button>
  );
}
