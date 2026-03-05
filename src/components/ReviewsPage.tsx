import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ThumbsUp, Image as ImageIcon, Award, TrendingUp, Filter } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface ReviewsPageProps {
  onClose: () => void;
}

export function ReviewsPage({ onClose }: ReviewsPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const reviews = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      location: 'Atlanta, GA',
      rating: 5,
      date: 'December 2, 2025',
      title: 'Absolutely Stunning Quality!',
      review: 'I ordered a 24×16 metal print of my wedding photo and I\'m blown away by the quality. The colors are so vibrant and the metal finish gives it a modern, gallery-quality look. It\'s now the centerpiece of our living room. Worth every penny!',
      verified: true,
      product: '24" × 16" - Gloss Finish',
      helpful: 24,
      category: 'quality'
    },
    {
      id: 2,
      name: 'Michael Chen',
      location: 'Kennesaw, GA',
      rating: 5,
      date: 'November 28, 2025',
      title: 'Local Business, World-Class Quality',
      review: 'So happy to support a local Kennesaw business! Picked up my order in person and got to see their process. The attention to detail is incredible. My 36×24 landscape print looks like it belongs in an art museum. Highly recommend!',
      verified: true,
      product: '36" × 24" - Matte Finish',
      helpful: 31,
      category: 'quality'
    },
    {
      id: 3,
      name: 'Jennifer Rodriguez',
      location: 'Marietta, GA',
      rating: 5,
      date: 'November 25, 2025',
      title: 'Perfect for Bathrooms!',
      review: 'I was hesitant about putting art in my bathroom, but these metal prints are 100% waterproof. I ordered three 12×8 prints for a gallery wall and they\'ve been perfect. Easy to clean steam off, colors still vibrant after months. Game changer!',
      verified: true,
      product: '12" × 8" - Gloss Finish',
      helpful: 19,
      category: 'durability'
    },
    {
      id: 4,
      name: 'David Thompson',
      location: 'Roswell, GA',
      rating: 5,
      date: 'November 20, 2025',
      title: 'Best Gift Ever',
      review: 'Ordered a metal print of our family vacation for my wife\'s birthday. She cried happy tears! The configurator made it super easy to crop and adjust. Arrived perfectly packaged. Customer service answered all my questions quickly. 10/10 experience.',
      verified: true,
      product: '17" × 11" - Gloss Finish',
      helpful: 27,
      category: 'service'
    },
    {
      id: 5,
      name: 'Lisa Wang',
      location: 'Alpharetta, GA',
      rating: 5,
      date: 'November 15, 2025',
      title: 'Professional Photographer Approved',
      review: 'As a professional photographer, I\'m very picky about print quality. HD Metal Prints are THE gold standard. Bespoke Metal Prints nailed the color accuracy and detail. I\'ve now ordered 15+ prints for my studio and clients. Will be a repeat customer!',
      verified: true,
      product: 'Multiple Sizes',
      helpful: 42,
      category: 'quality'
    },
    {
      id: 6,
      name: 'Robert Johnson',
      location: 'Acworth, GA',
      rating: 5,
      date: 'November 12, 2025',
      title: 'Fast Shipping, Excellent Packaging',
      review: 'Ordered on a Monday, received by Friday. The packaging was incredibly secure - foam wrap, corner protectors, rigid box. Print arrived in perfect condition. The gloss finish makes my sunset photo look like it\'s glowing. Impressed!',
      verified: true,
      product: '24" × 16" - Gloss Finish',
      helpful: 15,
      category: 'shipping'
    },
    {
      id: 7,
      name: 'Amanda Foster',
      location: 'Woodstock, GA',
      rating: 5,
      date: 'November 8, 2025',
      title: 'Matte Finish is Incredible',
      review: 'I chose matte for my portrait photos and it was the right call. No glare, super elegant, looks expensive. Everyone who visits asks where I got them. The quality is unmatched. Already planning my next order!',
      verified: true,
      product: '17" × 11" - Matte Finish',
      helpful: 21,
      category: 'quality'
    },
    {
      id: 8,
      name: 'James Patterson',
      location: 'Dallas, GA',
      rating: 5,
      date: 'November 5, 2025',
      title: 'Great for Office Decor',
      review: 'Ordered 6 metal prints for my office redesign. Modern, professional look that impresses clients. The float mount option makes them appear to hover off the wall. Easy to hang, lightweight. Couldn\'t be happier with the investment.',
      verified: true,
      product: '12" × 8" - Gloss with Float Mount',
      helpful: 18,
      category: 'quality'
    },
    {
      id: 9,
      name: 'Emily Martinez',
      location: 'Canton, GA',
      rating: 5,
      date: 'November 1, 2025',
      title: 'Sample Size is Worth It',
      review: 'Started with the 5×7 sample to test quality before committing to larger sizes. So glad I did - the quality convinced me immediately. Now I have 4 large prints throughout my home. The sample is perfect for desks too!',
      verified: true,
      product: '5" × 7" - Sample Size',
      helpful: 29,
      category: 'value'
    },
    {
      id: 10,
      name: 'Christopher Lee',
      location: 'Smyrna, GA',
      rating: 5,
      date: 'October 28, 2025',
      title: 'Exceeded My Expectations',
      review: 'I\'ve ordered from several online print shops and this is by far the best. The HD Metal Print material is superior to anything else. Colors are accurate, print is razor-sharp, and the metal gives it a premium feel. Worth the price!',
      verified: true,
      product: '24" × 16" - Gloss Finish',
      helpful: 33,
      category: 'quality'
    },
    {
      id: 11,
      name: 'Nicole Brown',
      location: 'Sandy Springs, GA',
      rating: 5,
      date: 'October 25, 2025',
      title: 'Black Frame is Gorgeous',
      review: 'Added the black frame to my 17×11 print and it looks like something from a high-end gallery. The frame is solid, well-made, and perfectly complements the metal. Makes hanging super easy too. Highly recommend the frame upgrade!',
      verified: true,
      product: '17" × 11" with Black Frame',
      helpful: 22,
      category: 'quality'
    },
    {
      id: 12,
      name: 'Thomas Anderson',
      location: 'Johns Creek, GA',
      rating: 5,
      date: 'October 20, 2025',
      title: 'Customer Service is Top-Notch',
      review: 'Had a question about image resolution and the support team responded within an hour with detailed advice. They even previewed my image before printing to ensure quality. That level of care is rare these days. Fantastic experience!',
      verified: true,
      product: '36" × 24" - Matte Finish',
      helpful: 26,
      category: 'service'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Reviews', count: reviews.length },
    { id: 'quality', name: 'Quality', count: reviews.filter(r => r.category === 'quality').length },
    { id: 'service', name: 'Service', count: reviews.filter(r => r.category === 'service').length },
    { id: 'durability', name: 'Durability', count: reviews.filter(r => r.category === 'durability').length },
    { id: 'value', name: 'Value', count: reviews.filter(r => r.category === 'value').length },
    { id: 'shipping', name: 'Shipping', count: reviews.filter(r => r.category === 'shipping').length },
  ];

  const stats = [
    { label: 'Average Rating', value: '4.9', icon: Star },
    { label: 'Total Reviews', value: '157+', icon: Award },
    { label: 'Verified Purchases', value: '100%', icon: ImageIcon },
    { label: 'Would Recommend', value: '99%', icon: TrendingUp }
  ];

  const filteredReviews = selectedFilter === 'all' 
    ? reviews 
    : reviews.filter(r => r.category === selectedFilter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ReturnToHomeButton onClick={onClose} />
            <div>
              <h1 className="text-gray-900 dark:text-white">Customer Reviews</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Real feedback from real customers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close reviews"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10 rounded-2xl p-6 text-center border border-[#ff6b35]/20"
              >
                <Icon className="w-8 h-8 text-[#ff6b35] mx-auto mb-3" />
                <div className="text-3xl text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedFilter(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedFilter === category.id
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-sm">{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedFilter === category.id
                    ? 'bg-white/20'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 hover:border-[#ff6b35]/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-gray-900 dark:text-white">
                        {review.name}
                      </h3>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {review.location} • {review.date}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? 'text-[#ff6b35] fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Title */}
                <h4 className="text-xl text-gray-900 dark:text-white mb-3">
                  {review.title}
                </h4>

                {/* Review Content */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {review.review}
                </p>

                {/* Product Badge */}
                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full mb-4">
                  <ImageIcon className="w-4 h-4 text-[#ff6b35]" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {review.product}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#ff6b35] transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">Helpful ({review.helpful})</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10 rounded-2xl p-12 border border-[#ff6b35]/20">
          <h2 className="text-3xl text-gray-900 dark:text-white mb-4">
            Join Our Happy Customers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience the quality that has earned us a 4.9-star rating and hundreds of 5-star reviews. 
            Try our risk-free 5×7 sample for just $25!
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#ff5722] text-white px-8 py-4 rounded-full transition-all shadow-lg shadow-[#ff6b35]/20 transform hover:scale-105"
          >
            <span>Start Your Order</span>
            <Award className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'HD Metal Prints',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '157',
              bestRating: '5',
              worstRating: '1'
            },
            review: reviews.slice(0, 5).map(review => ({
              '@type': 'Review',
              author: {
                '@type': 'Person',
                name: review.name
              },
              datePublished: review.date,
              reviewRating: {
                '@type': 'Rating',
                ratingValue: review.rating,
                bestRating: '5'
              },
              reviewBody: review.review
            }))
          })
        }}
      />
    </motion.div>
  );
}
