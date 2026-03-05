import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate scroll progress
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.pageYOffset / windowHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-[#ff6b35] text-white rounded-full shadow-2xl hover:bg-[#ff8555] transition-all duration-300 group border-2 border-white/20"
          aria-label="Scroll to top"
          initial={{ scale: 0, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 100 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20 
          }}
        >
          {/* Circular progress indicator */}
          <svg className="absolute inset-0 -rotate-90" width="100%" height="100%">
            <circle
              cx="50%"
              cy="50%"
              r="22"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="3"
              fill="none"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="22"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - scrollProgress / 100)}`}
              strokeLinecap="round"
              transition={{ duration: 0.1 }}
            />
          </svg>

          <ArrowUp className="w-5 h-5 relative z-10 group-hover:-translate-y-1 transition-transform duration-300" />
          
          {/* Tooltip */}
          <motion.span
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            initial={{ y: 10 }}
            whileHover={{ y: 0 }}
          >
            Back to top
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45" />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
