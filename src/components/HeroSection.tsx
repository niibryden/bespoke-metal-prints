import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function HeroSection() {
  const [showPreview, setShowPreview] = useState(false);

  const scrollToConfigurator = () => {
    const element = document.getElementById('configurator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-white dark:bg-black">
      {/* Full-screen background image with left fade */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1714399518678-0d244ea921cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBnYWxsZXJ5JTIwbWV0YWwlMjB3YWxsJTIwYXJ0fGVufDF8fHx8MTc2MzM1MTY5OXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Modern gallery with metal wall art displays"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Left fade overlay - adjusted to be 25% brighter on left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/75 via-50% to-transparent md:via-50% dark:from-black/60 dark:via-black/75" />
        {/* Additional mobile overlay for better text readability - lighter on left */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/40 md:bg-transparent dark:from-black/20 dark:to-black/40" />
      </div>

      {/* Animated gradient accent */}
      <motion.div 
        className="absolute inset-0 z-[1]"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#ff6b35]/20 rounded-full z-[1]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
        <div className="w-full lg:w-1/2">
          {/* Left Side - Text Content (Static) */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl text-black leading-tight dark:text-white">
                <span className="text-[#ff6b35] font-black uppercase tracking-wider" style={{ fontFamily: 'Impact, "Arial Black", "Franklin Gothic Bold", sans-serif', letterSpacing: '0.1em', textShadow: '0 0 2px black, 0 0 2px black, 0 0 2px black', WebkitTextStroke: '1px black' }}>Bespoke Metal Prints</span>
              </h1>
              
              {/* SEO-friendly subtitle */}
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mt-4">
                HD Metal Prints | Nationwide Shipping
              </p>
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Sparkles className="w-6 h-6 text-[#ff6b35]" />
              <p className="text-xl text-gray-700 dark:text-gray-300">
                Your most cherished memories, beautifully printed on durable Aluminum
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.button
                onClick={scrollToConfigurator}
                className="px-8 py-4 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all shadow-lg shadow-[#ff6b35]/30 relative overflow-hidden group dark:text-black"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                <span className="relative z-10">Start Your Print</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-gray-200/50 dark:border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {[
                { label: 'Happy Customers', value: '1.9K+', icon: '😊' },
                { label: 'Prints Delivered', value: '2K+', icon: '📦' },
                { label: 'Customer Rating', value: '4.8★', icon: '⭐' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center lg:text-left bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 dark:border-white/10"
                  whileHover={{ scale: 1.05, y: -5, backgroundColor: 'rgba(255, 107, 53, 0.1)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <span className="text-xl">{stat.icon}</span>
                    <motion.div 
                      className="text-2xl sm:text-3xl text-[#ff6b35] font-bold"
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3 
                      }}
                    >
                      {stat.value}
                    </motion.div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        onClick={scrollToConfigurator}
        whileHover={{ scale: 1.2 }}
      >
        <div className="w-6 h-10 border-2 border-black rounded-full flex items-start justify-center p-2 dark:border-white">
          <motion.div
            className="w-1.5 h-1.5 bg-black rounded-full dark:bg-white"
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      {showPreview && (
        <motion.div
          className="fixed inset-0 bg-white/95 z-[9999] flex items-center justify-center p-6 dark:bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPreview(false)}
        >
          <motion.button
            className="absolute top-6 right-6 w-12 h-12 bg-[#ff6b35] rounded-full flex items-center justify-center hover:bg-[#ff8c42] transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPreview(false)}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          <motion.div
            className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border-4 border-[#ff6b35]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="https://images.unsplash.com/photo-1613635423272-ef6bfd72ac0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZ2FsbGVyeSUyMHdhbGwlMjBhcnR8ZW58MXx8fHwxNzYzMjMxMDQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Metal print wall art preview"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <motion.div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#ff6b35] px-8 py-3 rounded-full"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white">Click anywhere to close</p>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}