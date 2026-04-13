import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
  imageUrl?: string;
  verified: boolean;
}

// Sample reviews - replace with real reviews from your database
const reviews: Review[] = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'Atlanta, GA',
    rating: 5,
    text: 'Absolutely stunning! The metal print quality exceeded my expectations. The colors are vibrant and the clarity is incredible. It completely transformed my living room wall.',
    date: '2 weeks ago',
    imageUrl: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=400&h=300&fit=crop',
    verified: true,
  },
  {
    id: 2,
    name: 'Michael T.',
    location: 'Austin, TX',
    rating: 5,
    text: 'Best purchase I\'ve made for my home office. The float mount gives it such a premium look, and the image quality is phenomenal. Shipping was super fast too!',
    date: '1 month ago',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    verified: true,
  },
  {
    id: 3,
    name: 'Jessica L.',
    location: 'Denver, CO',
    rating: 5,
    text: 'I ordered three prints for my bedroom and they look amazing together. The matte finish is elegant and the colors are true to my original photos. Worth every penny!',
    date: '3 weeks ago',
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    verified: true,
  },
  {
    id: 4,
    name: 'David R.',
    location: 'Seattle, WA',
    rating: 5,
    text: 'Customer service was excellent and the final product is museum quality. I\'ve received so many compliments on my metal print. Already planning my next order!',
    date: '1 week ago',
    verified: true,
  },
  {
    id: 5,
    name: 'Emily K.',
    location: 'Miami, FL',
    rating: 5,
    text: 'The gloss finish makes the colors pop beautifully. Perfect gift for my parents\' anniversary. They absolutely loved it and it arrived perfectly packaged.',
    date: '2 months ago',
    imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&h=300&fit=crop',
    verified: true,
  },
];

export function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-black relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#ff6b35] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff8c42] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-[#ff6b35] text-[#ff6b35]" />
            ))}
          </div>
          <h2 className="text-4xl md:text-5xl mb-4 text-black dark:text-white">
            Loved by <span className="text-[#ff6b35]">1,900+</span> Happy Customers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it - hear what our customers have to say about their Bespoke Metal Prints
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-[#ff6b35]/20"
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Review Content */}
                  <div>
                    <Quote className="w-12 h-12 text-[#ff6b35] mb-4 opacity-50" />
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < currentReview.rating
                              ? 'fill-[#ff6b35] text-[#ff6b35]'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      "{currentReview.text}"
                    </p>

                    {/* Reviewer Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-black dark:text-white">
                            {currentReview.name}
                          </p>
                          {currentReview.verified && (
                            <div className="flex items-center gap-1 text-green-500 text-xs">
                              <CheckCircle className="w-4 h-4" />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentReview.location} • {currentReview.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Image */}
                  {currentReview.imageUrl && (
                    <div className="hidden md:block">
                      <div className="relative rounded-xl overflow-hidden shadow-lg">
                        <ImageWithFallback
                          src={currentReview.imageUrl}
                          alt={`Review from ${currentReview.name}`}
                          className="w-full h-80 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 p-3 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-[#ff6b35]/30 hover:bg-[#ff6b35] hover:text-white dark:hover:bg-[#ff6b35] transition-all"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 p-3 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-[#ff6b35]/30 hover:bg-[#ff6b35] hover:text-white dark:hover:bg-[#ff6b35] transition-all"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-[#ff6b35]'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-[#ff6b35]/50'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">100% Satisfaction Guaranteed</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Free Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Secure Checkout</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}