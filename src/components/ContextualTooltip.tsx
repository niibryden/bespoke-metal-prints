import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X } from 'lucide-react';

interface ContextualTooltipProps {
  title: string;
  content: string | React.ReactNode;
  learnMoreLink?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'icon' | 'inline';
  className?: string;
}

export function ContextualTooltip({
  title,
  content,
  learnMoreLink,
  position = 'top',
  variant = 'icon',
  className = '',
}: ContextualTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Close on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center ${className}`} ref={tooltipRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => !isMobile && setIsOpen(true)}
          onMouseLeave={() => !isMobile && setIsOpen(false)}
          className="ml-1 text-[#ff6b35] hover:text-[#ff8c42] transition-colors focus:outline-none"
          aria-label="More information"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-[9998] flex items-center justify-center p-4 md:relative md:inset-auto md:z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Mobile backdrop */}
              {isMobile && (
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                />
              )}

              <motion.div
                className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-full md:w-80 ${
                  !isMobile && positionClasses[position]
                }`}
                initial={{ scale: 0.9, y: isMobile ? 20 : 0 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: isMobile ? 20 : 0 }}
              >
                {/* Mobile close button */}
                {isMobile && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Arrow for desktop */}
                {!isMobile && (
                  <div
                    className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`}
                    style={{
                      borderTopColor: position === 'bottom' ? 'transparent' : undefined,
                      borderBottomColor: position === 'top' ? 'transparent' : undefined,
                      borderLeftColor: position === 'right' ? 'transparent' : undefined,
                      borderRightColor: position === 'left' ? 'transparent' : undefined,
                    }}
                  />
                )}

                <div className="relative">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 pr-6">
                    {title}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {content}
                  </div>
                  {learnMoreLink && (
                    <a
                      href={learnMoreLink}
                      className="mt-3 inline-flex items-center text-sm text-[#ff6b35] hover:text-[#ff8c42] transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn more →
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    );
  }

  // Icon variant (default)
  return (
    <div className={`relative inline-block ${className}`} ref={tooltipRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
        className="p-1.5 text-gray-400 hover:text-[#ff6b35] dark:hover:text-[#ff6b35] transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4 md:absolute md:inset-auto md:z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Mobile backdrop */}
            {isMobile && (
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />
            )}

            <motion.div
              className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-full md:w-80 ${
                !isMobile && positionClasses[position]
              }`}
              initial={{ scale: 0.9, y: isMobile ? 20 : 0 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: isMobile ? 20 : 0 }}
            >
              {/* Mobile close button */}
              {isMobile && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Arrow for desktop */}
              {!isMobile && (
                <div
                  className={`absolute w-0 h-0 border-8 border-gray-200 dark:border-gray-700 ${arrowClasses[position]}`}
                />
              )}

              <div className="relative">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 pr-6">
                  {title}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {content}
                </div>
                {learnMoreLink && (
                  <a
                    href={learnMoreLink}
                    className="mt-3 inline-flex items-center text-sm text-[#ff6b35] hover:text-[#ff8c42] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Comparison tooltip variant
interface ComparisonTooltipProps {
  title: string;
  options: Array<{
    name: string;
    description: string;
    pros: string[];
    image?: string;
  }>;
  className?: string;
}

export function ComparisonTooltip({ title, options, className = '' }: ComparisonTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={tooltipRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
        className="text-sm text-[#ff6b35] hover:text-[#ff8c42] transition-colors underline decoration-dotted underline-offset-2"
      >
        {title}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pr-8">
                {title}
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                  >
                    {option.image && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img src={option.image} alt={option.name} className="w-full h-32 object-cover" />
                      </div>
                    )}
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {option.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {option.description}
                    </p>
                    <div className="space-y-1.5">
                      {option.pros.map((pro, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-gray-700 dark:text-gray-300">{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
