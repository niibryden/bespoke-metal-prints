import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getServerUrl } from '../utils/serverUrl';
import { publicAnonKey } from '../utils/supabase/info';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  imageUrl?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch testimonials from backend
  useEffect(() => {
    fetchTestimonials();
    
    // Listen for testimonial updates from admin panel
    const handleTestimonialsUpdated = () => {
      console.log('ReviewsCarousel: Testimonials updated event received, refreshing...');
      fetchTestimonials();
    };

    window.addEventListener('testimonialsUpdated', handleTestimonialsUpdated);

    return () => {
      window.removeEventListener('testimonialsUpdated', handleTestimonialsUpdated);
    };
  }, []);

  const fetchTestimonials = async () => {
    try {
      const serverUrl = getServerUrl();
      // Add cache-busting parameter to ensure we get fresh data
      const url = `${serverUrl}/testimonials?_t=${Date.now()}`;
      console.log('🔄 Fetching testimonials from:', url);
      const response = await fetch(url, {
        cache: 'no-store', // Disable caching
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`, // Supabase requires auth header even for public endpoints
        },
      });
      console.log('📥 Testimonials response status:', response.status);
      console.log('📥 Testimonials response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Testimonials data received:', data);
        
        if (data.testimonials && data.testimonials.length > 0) {
          console.log(`✅ Using ${data.testimonials.length} live testimonials from database`);
          setReviews(data.testimonials);
        } else {
          // Fallback to sample data if no testimonials exist
          console.log('⚠️ No testimonials in database, using fallback reviews');
          setReviews(FALLBACK_REVIEWS);
        }
      } else {
        // Log the error response body
        const errorText = await response.text();
        console.error('❌ Failed to fetch testimonials, status:', response.status);
        console.error('❌ Error response body:', errorText);
        // Fallback to sample data on error
        setReviews(FALLBACK_REVIEWS);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      console.log('⚠️ Using fallback reviews due to fetch error');
      // Fallback to sample data on error
      setReviews(FALLBACK_REVIEWS);
    } finally {
      setLoading(false);
    }
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const currentReview = reviews[currentIndex];

  // Format date to relative time (e.g., "2 weeks ago")
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 14) return '1 week ago';
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 60) return '1 month ago';
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  // Don't render carousel if no reviews are available yet
  if (loading || !currentReview || reviews.length === 0) {
    return null;
  }

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
                          {currentReview.location} • {formatDate(currentReview.createdAt)}
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

// Sample reviews - replace with real reviews from your database
const FALLBACK_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Sarah M.',
    location: 'Atlanta, GA',
    rating: 5,
    text: 'Absolutely stunning! The metal print quality exceeded my expectations. The colors are vibrant and the clarity is incredible. It completely transformed my living room wall.',
    imageUrl: 'https://images.unsplash.com/photo-1516637617912-b0ee4c07a457?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBob2xkaW5nJTIwbWV0YWwlMjBwcmludCUyMHdhbGwlMjBhcnQlMjBob21lfGVufDF8fHx8MTc3NjA1NjE4NXww&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
    createdAt: '2 weeks ago',
    updatedAt: '2 weeks ago',
  },
  {
    id: '2',
    name: 'Michael T.',
    location: 'Austin, TX',
    rating: 5,
    text: 'Best purchase I\'ve made for my home office. The float mount gives it such a premium look, and the image quality is phenomenal. Shipping was super fast too!',
    imageUrl: 'https://images.unsplash.com/photo-1593286101772-0d9e2621b8f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHdpdGglMjBmcmFtZWQlMjBhcnQlMjBwcmludCUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzc2MDU2MTg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
    createdAt: '1 month ago',
    updatedAt: '1 month ago',
  },
  {
    id: '3',
    name: 'Jessica L.',
    location: 'Denver, CO',
    rating: 5,
    text: 'I ordered three prints for my bedroom and they look amazing together. The matte finish is elegant and the colors are true to my original photos. Worth every penny!',
    imageUrl: 'https://images.unsplash.com/photo-1568164528240-21ad793478dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjB3YWxsJTIwYXJ0JTIwaG9tZSUyMGRlY29yJTIwaGFwcHl8ZW58MXx8fHwxNzc2MDU2MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
    createdAt: '3 weeks ago',
    updatedAt: '3 weeks ago',
  },
  {
    id: '4',
    name: 'David R.',
    location: 'Seattle, WA',
    rating: 5,
    text: 'Customer service was excellent and the final product is museum quality. I\'ve received so many compliments on my metal print. Already planning my next order!',
    verified: true,
    createdAt: '1 week ago',
    updatedAt: '1 week ago',
  },
  {
    id: '5',
    name: 'Emily K.',
    location: 'Miami, FL',
    rating: 5,
    text: 'The gloss finish makes the colors pop beautifully. Perfect gift for my parents\' anniversary. They absolutely loved it and it arrived perfectly packaged.',
    imageUrl: 'https://images.unsplash.com/photo-1516637617912-b0ee4c07a457?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBob2xkaW5nJTIwbWV0YWwlMjBwcmludCUyMHdhbGwlMjBhcnQlMjBob21lfGVufDF8fHx8MTc3NjA1NjE4NXww&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
    createdAt: '2 months ago',
    updatedAt: '2 months ago',
  },
];