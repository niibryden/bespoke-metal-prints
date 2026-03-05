import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Ruler, Home, Maximize2, Image, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import img20x20LivingRoom from 'figma:asset/c631d88cda172aa79bbfa275e5b051663623c2a8.png';
import imgSizeComparisonStacked from 'figma:asset/239b0bd45e088915587b9a145f68289ad25e501b.png';
import imgSizeComparisonLineup from 'figma:asset/0c13697df2e21036a866bbc91155db10f95f8681.png';
import img24x36LivingRoom from 'figma:asset/508b3cfb03461c242b2c3c2ec0021b09aaf05ef6.png';

interface SizeGuidePageProps {
  onClose: () => void;
}

export function SizeGuidePage({ onClose }: SizeGuidePageProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>('living');

  const sizes = [
    {
      size: '5" × 7"',
      dimensions: '5 × 7 inches',
      price: '$25.00',
      ideal: 'Sample size only',
      rooms: ['desk', 'shelf'],
      description: 'Perfect for testing our quality before ordering larger sizes. Cannot be framed or mounted.',
      wallSize: '12" × 12"',
      limitations: ['No framing', 'No float mount', 'Sample only'],
      bestFor: ['First-time customers', 'Quality testing', 'Small desk displays']
    },
    {
      size: '12" × 8"',
      dimensions: '12 × 8 inches',
      price: '$49.99',
      ideal: 'Small spaces, galleries',
      rooms: ['bedroom', 'bathroom', 'office'],
      description: 'Our most popular starter size. Great for creating gallery walls or displaying in smaller spaces.',
      wallSize: '2ft × 3ft wall',
      limitations: [],
      bestFor: ['Gallery walls', 'Small rooms', 'Hallways', 'Bathrooms', 'Office desks']
    },
    {
      size: '17" × 11"',
      dimensions: '17 × 11 inches',
      price: '$69.99',
      ideal: 'Medium walls, focal points',
      rooms: ['living', 'bedroom', 'dining'],
      description: 'Versatile size that works in most rooms. Large enough to make a statement without overwhelming the space.',
      wallSize: '4ft × 5ft wall',
      limitations: [],
      bestFor: ['Living rooms', 'Bedrooms', 'Dining areas', 'Featured walls', 'Above furniture']
    },
    {
      size: '24" × 16"',
      dimensions: '24 × 16 inches',
      price: '$109.99',
      ideal: 'Large walls, statement pieces',
      rooms: ['living', 'dining', 'entryway'],
      description: 'Makes a bold statement. Perfect for showcasing your best photos as the focal point of a room.',
      wallSize: '6ft × 7ft wall',
      limitations: [],
      bestFor: ['Main focal points', 'Above sofas', 'Feature walls', 'Large bedrooms', 'Entryways']
    },
    {
      size: '30" × 20"',
      dimensions: '30 × 20 inches',
      price: '$149.99',
      ideal: 'Statement walls, extra large',
      rooms: ['living', 'dining', 'commercial'],
      description: 'Extra large format for creating dramatic focal points in spacious rooms and commercial settings.',
      wallSize: '7ft × 9ft wall',
      limitations: [],
      bestFor: ['Large living rooms', 'Commercial spaces', 'Feature walls', 'Conference rooms', 'Luxury homes']
    },
    {
      size: '36" × 24"',
      dimensions: '36 × 24 inches',
      price: '$199.99',
      ideal: 'Premium statement pieces',
      rooms: ['living', 'office', 'commercial'],
      description: 'Premium large format for maximum impact. Creates a stunning focal point in any space.',
      wallSize: '8ft × 10ft wall',
      limitations: [],
      bestFor: ['Large living rooms', 'Hotel lobbies', 'Office spaces', 'Conference rooms', 'Luxury homes']
    },
    {
      size: '40" × 30"',
      dimensions: '40 × 30 inches',
      price: '$269.99',
      ideal: 'Gallery-sized, maximum impact',
      rooms: ['living', 'office', 'commercial'],
      description: 'Our largest and most dramatic size. Creates museum-quality impact in spacious rooms and commercial settings.',
      wallSize: '10ft × 12ft wall',
      limitations: [],
      bestFor: ['Commercial spaces', 'Hotel lobbies', 'Large living rooms', 'Conference rooms', 'Gallery walls', 'Luxury homes']
    }
  ];

  const rooms = [
    { id: 'living', name: 'Living Room', icon: '🛋️' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'office', name: 'Office', icon: '💼' },
    { id: 'dining', name: 'Dining Room', icon: '🍽️' },
    { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
    { id: 'commercial', name: 'Commercial', icon: '🏢' }
  ];

  const tips = [
    {
      icon: Ruler,
      title: 'Wall Space Rule',
      description: 'Your print should fill 50-75% of the available wall space for optimal visual impact.'
    },
    {
      icon: Home,
      title: 'Viewing Distance',
      description: 'Hang prints at eye level (57-60 inches from floor). View distance = print width × 1.5 for best experience.'
    },
    {
      icon: Maximize2,
      title: 'Gallery Walls',
      description: 'Mix 12×8 and 17×11 sizes for dynamic gallery walls. Keep 2-3 inches between prints.'
    },
    {
      icon: Image,
      title: 'Resolution Matters',
      description: 'Larger sizes need higher resolution images. Our configurator will warn if quality is too low.'
    }
  ];

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
              <h1 className="text-gray-900 dark:text-white">Metal Print Size Guide</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Find the perfect size for your space
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close size guide"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Room Filter */}
        <div className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4 text-center">
            Shop by Room
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedRoom === room.id
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{room.icon}</span>
                <span className="text-sm">{room.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Size Comparison Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sizes
            .filter(size => selectedRoom === 'living' || size.rooms.includes(selectedRoom))
            .map((sizeInfo, index) => (
              <motion.div
                key={sizeInfo.size}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#ff6b35]/50 transition-colors"
              >
                {/* Visual Size Representation */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-8 flex items-center justify-center h-48">
                  <div 
                    className="bg-[#ff6b35]/20 border-2 border-[#ff6b35] rounded-lg flex items-center justify-center"
                    style={{
                      width: sizeInfo.size === '5" × 7"' ? '50px' :
                             sizeInfo.size === '12" × 8"' ? '70px' :
                             sizeInfo.size === '17" × 11"' ? '90px' :
                             sizeInfo.size === '24" × 16"' ? '110px' :
                             sizeInfo.size === '30" × 20"' ? '130px' :
                             sizeInfo.size === '36" × 24"' ? '150px' : '170px',
                      height: sizeInfo.size === '5" × 7"' ? '70px' :
                              sizeInfo.size === '12" × 8"' ? '47px' :
                              sizeInfo.size === '17" × 11"' ? '58px' :
                              sizeInfo.size === '24" × 16"' ? '73px' :
                              sizeInfo.size === '30" × 20"' ? '87px' :
                              sizeInfo.size === '36" × 24"' ? '100px' : '127px',
                    }}
                  >
                    <Ruler className="w-6 h-6 text-[#ff6b35]" />
                  </div>
                </div>

                {/* Size Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl text-gray-900 dark:text-white">
                      {sizeInfo.size}
                    </h3>
                    <span className="text-xl text-[#ff6b35]">
                      {sizeInfo.price}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sizeInfo.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="w-4 h-4 text-[#ff6b35]" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Ideal for {sizeInfo.wallSize}
                      </span>
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      BEST FOR:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {sizeInfo.bestFor.map((use) => (
                        <span
                          key={use}
                          className="text-xs bg-[#ff6b35]/10 text-[#ff6b35] px-2 py-1 rounded-full"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Limitations */}
                  {sizeInfo.limitations.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-800 dark:text-yellow-400">
                          <p className="font-semibold mb-1">Note:</p>
                          <ul className="space-y-1">
                            {sizeInfo.limitations.map((limit) => (
                              <li key={limit}>• {limit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
        </div>

        {/* Pro Tips */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 text-center">
            Sizing Pro Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-gradient-to-br from-[#ff6b35]/5 to-orange-100/10 dark:from-[#ff6b35]/10 dark:to-orange-900/5 rounded-2xl p-6 border border-[#ff6b35]/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#ff6b35]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#ff6b35]" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                        {tip.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Visual Size Showcase */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-4">
              Size Visualization Gallery
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See how different sizes look in real living spaces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Size Comparison Stacked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#ff6b35]/50 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white dark:bg-gray-900 p-4">
                <img
                  src={imgSizeComparisonStacked}
                  alt="Metal print size comparison stacked showing all available sizes"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-gray-900 dark:text-white mb-2">
                  Size Comparison Stacked
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  See all available sizes stacked together to understand the size differences and proportions.
                </p>
              </div>
            </motion.div>

            {/* 20×20 in Living Room */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#ff6b35]/50 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white dark:bg-gray-900 p-4">
                <img
                  src={img20x20LivingRoom}
                  alt="20x20 metal print displayed in modern living room setting above gray couch"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-gray-900 dark:text-white mb-2">
                  20 × 20 in Living Room
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Perfect focal point size for living rooms and bedrooms. Creates impact without overwhelming the space.
                </p>
              </div>
            </motion.div>

            {/* 24×36 in Living Room */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#ff6b35]/50 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white dark:bg-gray-900 p-4">
                <img
                  src={img24x36LivingRoom}
                  alt="24x36 large metal print as statement piece in spacious living room with modern chair"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-gray-900 dark:text-white mb-2">
                  24 × 36 Statement Print
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Our largest size creates dramatic impact in spacious rooms, commercial spaces, and luxury settings.
                </p>
              </div>
            </motion.div>

            {/* Size Comparison Lineup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#ff6b35]/50 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white dark:bg-gray-900 p-4">
                <img
                  src={imgSizeComparisonLineup}
                  alt="Gallery wall featuring multiple metal print sizes arranged in a lineup"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-gray-900 dark:text-white mb-2">
                  Side-by-Side Comparison
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  All sizes displayed side-by-side to help you visualize the proportional differences between each option.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing with Frame Options */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-6 text-center">
            Frame Pricing by Size
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Size</th>
                  <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Base Print</th>
                  <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">+ Black Frame</th>
                  <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">+ Gold Frame</th>
                  <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">+ Wood Frame</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">5" × 7"</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$25.00</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">Not Available</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">Not Available</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">Not Available</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">12" × 8"</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$49.99</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$139.98</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$189.97</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$159.98</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">17" × 11"</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$69.99</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$159.98</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$209.97</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$179.98</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">24" × 16"</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$109.99</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$199.98</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$249.97</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$219.98</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">30" × 20"</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$149.99</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$239.98</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$289.97</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$259.98</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">36" × 24"</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$199.99</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$289.98</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$339.97</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$309.98</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">40" × 30"</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$269.99</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$359.98</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$409.97</td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">$379.98</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-4">
            💎 Use code <span className="text-[#ff6b35] font-semibold">WELCOME10</span> for 10% OFF all sizes
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">
            Ready to Choose Your Size?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our configurator will help you preview your photo at different sizes
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#ff5722] text-white px-8 py-4 rounded-full transition-all shadow-lg shadow-[#ff6b35]/20 transform hover:scale-105"
          >
            <span>Start Designing</span>
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Metal Print Sizes',
            description: 'Available sizes for ChromaLuxe metal prints from Bespoke Metal Prints',
            itemListElement: sizes.map((size, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                name: `${size.size} Metal Print`,
                description: size.description,
                offers: {
                  '@type': 'Offer',
                  price: size.price.replace('$', ''),
                  priceCurrency: 'USD'
                }
              }
            }))
          })
        }}
      />
    </motion.div>
  );
}