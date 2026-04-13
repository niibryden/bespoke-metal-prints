import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DarkModeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function DarkModeToggle({ variant = 'compact', className = '' }: DarkModeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isDark ? 'Dark' : 'Light'} Mode
        </span>
        <button
          onClick={toggleTheme}
          className="relative w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:ring-offset-2"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-[#ff6b35] rounded-full shadow-md flex items-center justify-center"
            animate={{
              x: isDark ? 32 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-white" />
            ) : (
              <Sun className="w-4 h-4 text-[#ff6b35]" />
            )}
          </motion.div>
        </button>
      </div>
    );
  }

  // Compact variant (icon only)
  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-[#ff6b35] ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
          scale: isDark ? 0.9 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-gray-400 dark:text-gray-300" />
        ) : (
          <Sun className="w-5 h-5 text-gray-700" />
        )}
      </motion.div>
    </button>
  );
}

// Alternative: Icon swap animation
export function DarkModeToggleSwap({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff6b35] overflow-hidden ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="relative w-5 h-5"
        initial={false}
      >
        {/* Sun icon */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: isDark ? 0 : 1,
            y: isDark ? -20 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Sun className="w-5 h-5 text-gray-700" />
        </motion.div>

        {/* Moon icon */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: isDark ? 1 : 0,
            y: isDark ? 0 : 20,
          }}
          transition={{ duration: 0.3 }}
        >
          <Moon className="w-5 h-5 text-gray-300" />
        </motion.div>
      </motion.div>
    </button>
  );
}

// Floating action button variant
export function DarkModeFAB({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        animate={{
          rotate: isDark ? 360 : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        {isDark ? (
          <Moon className="w-6 h-6 text-white" />
        ) : (
          <Sun className="w-6 h-6 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
}
