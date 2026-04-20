import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Check, ArrowRight, Palette, Feather, Package, Mountain, Shield, Sparkles, DollarSign } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useInventory } from '../hooks/useInventory';
import imgFrontBack from 'figma:asset/fc5326d3ef96710ce5e71421bdceec94c8906060.png';
import imgWallHanging from 'figma:asset/5fa90e3609deca3bf85101c0d5901f800cd5b5bb.png';

interface ProductsPageProps {
  onClose: () => void;
  onStartDesigning?: () => void;
}

export function ProductsPage({ onClose, onStartDesigning }: ProductsPageProps) {
  const [selectedSize, setSelectedSize] = useState<string>('12" x 8"');
  const [selectedFinish, setSelectedFinish] = useState<string>('Gloss');
  const [selectedFrame, setSelectedFrame] = useState<string>('None');
  const [selectedMount, setSelectedMount] = useState<string>('Stick Tape');
  
  // Use inventory hook to get real prices
  const { inventory } = useInventory();
  
  // Helper to get price from inventory
  const getPriceFromInventory = (category: 'size' | 'frame' | 'mounting' | 'finish', name: string, fallbackPrice: number): number => {
    const item = inventory.find(
      (item) => item.category === category && item.name.toLowerCase() === name.toLowerCase()
    );
    return item ? item.price : fallbackPrice;
  };

  const features = [
    {
      icon: '🎨',
      title: 'Exceptional Detail',
      description: 'ChromaLuxe allows for images to be infused directly into coated metal sheets, meaning each and every detail is vividly and accurately displayed.'
    },
    {
      icon: '🏛️',
      title: 'Archival Quality',
      description: 'Our substrates and coatings mean images are rendered for virtually ageless medium that can withstand environmental factors such as sun and rain.'
    },
    {
      icon: '🖼️',
      title: 'Personalized Presentation',
      description: 'With both wall-mount and easel configurations, you have the option to determine the best way to show off your artwork.'
    },
    {
      icon: '🏠',
      title: 'Easy to Hang',
      description: 'ChromaLuxe photographic panels are easy to mount in interior and outdoor environments and do not require additional framing before hanging.'
    },
    {
      icon: '🪶',
      title: 'Lightweight',
      description: 'Every metal print from ChromaLuxe is lightweight and easy to carry, relocate or display without additional mounting hardware required.'
    },
    {
      icon: '🔥',
      title: 'Flame Resistant',
      description: 'All ChromaLuxe products meet ASTM standards for flame spread and smoke development, making them exceptionally safe for every environment.'
    },
  ];

  const sizes = [
    { name: '5\" x 7\"', price: getPriceFromInventory('size', '5" x 7"', 25.00), dimensions: '5 x 7 inches' },
    { name: '12\" x 8\"', price: getPriceFromInventory('size', '12" x 8"', 49.99), dimensions: '12 x 8 inches', popular: true },
    { name: '17\" x 11\"', price: getPriceFromInventory('size', '17" x 11"', 69.99), dimensions: '17 x 11 inches' },
    { name: '24\" x 16\"', price: getPriceFromInventory('size', '24" x 16"', 109.99), dimensions: '24 x 16 inches' },
    { name: '30\" x 20\"', price: getPriceFromInventory('size', '30" x 20"', 149.99), dimensions: '30 x 20 inches' },
    { name: '36\" x 24\"', price: getPriceFromInventory('size', '36" x 24"', 199.99), dimensions: '36 x 24 inches', popular: true },
    { name: '40\" x 30\"', price: getPriceFromInventory('size', '40" x 30"', 269.99), dimensions: '40 x 30 inches' },
  ];

  const finishes = [
    { name: 'Gloss', price: getPriceFromInventory('finish', 'Gloss', 0), description: 'High-gloss, vibrant colors' },
    { name: 'Matte', price: getPriceFromInventory('finish', 'Matte', 0), description: 'Soft, elegant, glare-free' },
  ];

  const frames = [
    { name: 'None', basePrice: 0 },
    { name: 'Black', basePrice: getPriceFromInventory('frame', 'Black', 89.99) },
    { name: 'Gold', basePrice: getPriceFromInventory('frame', 'Gold', 129.99) },
    { name: 'Natural Wood', basePrice: getPriceFromInventory('frame', 'Natural Wood', 109.99) },
  ];

  const mountings = [
    { name: 'Stick Tape', price: getPriceFromInventory('mounting', 'Stick Tape', 0) },
    { name: 'Float Mount', price: getPriceFromInventory('mounting', 'Float Mount', 39.99) },
    { name: '3D Magnet', price: getPriceFromInventory('mounting', '3D Magnet', 49.99) },
  ];

  // Calculate frame price based on size
  const getFramePrice = (frameName: string, sizeName: string) => {
    const frame = frames.find(f => f.name === frameName);
    if (!frame || frame.basePrice === 0) return 0;
    
    // 5\" x 7\" is sample size - cannot be framed
    if (sizeName === '5\" x 7\"') return 0;
    
    // Return the inventory price directly (no multipliers)
    // This matches the ConfiguratorSection pricing
    return frame.basePrice;
  };

  const calculateTotal = () => {
    const size = sizes.find(s => s.name === selectedSize);
    const finish = finishes.find(f => f.name === selectedFinish);
    const mount = mountings.find(m => m.name === selectedMount);

    // For 5" x 7" sample size, don't include frame or mounting
    const isSampleSize = selectedSize === '5" x 7"';
    const framePrice = isSampleSize ? 0 : getFramePrice(selectedFrame, selectedSize);
    const mountPrice = isSampleSize ? 0 : (mount?.price || 0);

    return (size?.price || 0) + (finish?.price || 0) + framePrice + mountPrice;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 dark:text-white">Our Metal Prints</h1>
            <p className="text-gray-600 dark:text-gray-400">Premium ChromaLuxe aluminum prints</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
            aria-label="Return to Home"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
              Return to Home
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features Section - ChromaLuxe Style */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">
              Features of Our Metal Prints
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our metal prints are in a class of their own, boasting exceptional brilliance and clarity in every photographic product.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                {/* Icon Circle */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center mb-6 shadow-lg shadow-[#ff6b35]/30">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                
                {/* Title */}
                <h3 className="text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Product Showcase Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">
              Premium Construction & Display Options
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See the quality and versatility of our metal prints up close
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Front/Back Construction View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-800"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white dark:bg-gray-900 p-4">
                <img
                  src={imgFrontBack}
                  alt="HD Metal Print construction showing 0.045 inch aluminum thickness and glossy finish"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-gray-900 dark:text-white mb-2">
                  Premium Construction
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  0.045" aluminum thickness with professional glossy or matte finish. Dye-sublimation process ensures vibrant, long-lasting colors.
                </p>
              </div>
            </motion.div>

            {/* Wall Mounting Hardware Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-800"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white dark:bg-gray-900 p-4">
                <img
                  src={imgWallHanging}
                  alt="Wall mounting hardware options for metal prints including float mount and magnetic systems"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-gray-900 dark:text-white mb-2">
                  Multiple Mounting Options
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Choose from stick tape (free), float mount (${getPriceFromInventory('mounting', 'Float Mount', 39.99).toFixed(2)}), or premium 3D magnetic mount (${getPriceFromInventory('mounting', '3D Magnet', 49.99).toFixed(2)}) for easy installation and repositioning.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Component */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-full mb-4">
              <DollarSign className="w-5 h-5" />
              <span>Price Calculator</span>
            </div>
            <h2 className="text-gray-900 dark:text-white mb-4">
              Build Your Custom Metal Print
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select your preferred options below to see the total price for your custom metal print.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              {/* Left Column - Options */}
              <div className="space-y-8">
                {/* Size Selection */}
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#ff6b35]" />
                    Select Size
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size.name)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          selectedSize === size.name
                            ? 'border-[#ff6b35] bg-[#ff6b35]/5'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {size.popular && (
                          <span className="absolute top-2 right-2 bg-[#ff6b35] text-white text-xs px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <div className="text-gray-900 dark:text-white mb-1">
                          {size.name}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          ${size.price.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Finish Selection */}
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                    Select Finish
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {finishes.map((finish) => (
                      <button
                        key={finish.name}
                        onClick={() => setSelectedFinish(finish.name)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedFinish === finish.name
                            ? 'border-[#ff6b35] bg-[#ff6b35]/5'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="text-gray-900 dark:text-white mb-1">
                          {finish.name}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {finish.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Selection */}
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#ff6b35]" />
                    Select Frame
                    {selectedSize === '5" x 7"' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        (Not available for sample size)
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {frames.map((frame) => (
                      <button
                        key={frame.name}
                        onClick={() => {
                          if (selectedSize !== '5" x 7"') {
                            setSelectedFrame(frame.name);
                          }
                        }}
                        disabled={selectedSize === '5" x 7"' && frame.name !== 'None'}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedSize === '5" x 7"' && frame.name !== 'None'
                            ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700'
                            : selectedFrame === frame.name
                            ? 'border-[#ff6b35] bg-[#ff6b35]/5'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="text-gray-900 dark:text-white mb-1">
                          {frame.name}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {frame.basePrice === 0 ? 'Included' : `+$${getFramePrice(frame.name, selectedSize).toFixed(2)}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mounting Selection */}
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-[#ff6b35]" />
                    Select Mounting
                    {selectedSize === '5" x 7"' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        (Not available for sample size)
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {mountings.map((mount) => (
                      <button
                        key={mount.name}
                        onClick={() => {
                          if (selectedSize !== '5" x 7"') {
                            setSelectedMount(mount.name);
                          }
                        }}
                        disabled={selectedSize === '5" x 7"' && mount.name !== 'Stick Tape'}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          selectedSize === '5" x 7"' && mount.name !== 'Stick Tape'
                            ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700'
                            : selectedMount === mount.name
                            ? 'border-[#ff6b35] bg-[#ff6b35]/5'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="text-gray-900 dark:text-white mb-1">
                          {mount.name}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {mount.price === 0 ? 'Free' : `+$${mount.price.toFixed(2)}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-8">
                <div className="sticky top-24">
                  <h3 className="text-gray-900 dark:text-white mb-6">
                    Your Configuration
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Size</span>
                      <span className="text-gray-900 dark:text-white">{selectedSize}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                      <span className="text-gray-900 dark:text-white">
                        ${sizes.find(s => s.name === selectedSize)?.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Finish</span>
                      <span className="text-gray-900 dark:text-white">{selectedFinish}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Frame</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedFrame}
                        {frames.find(f => f.name === selectedFrame)?.basePrice !== 0 && 
                          ` (+$${getFramePrice(selectedFrame, selectedSize).toFixed(2)})`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Mounting</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedMount}
                        {mountings.find(m => m.name === selectedMount)?.price !== 0 && 
                          ` (+$${mountings.find(m => m.name === selectedMount)?.price.toFixed(2)})`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="bg-gradient-to-br from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10 rounded-2xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Total Price</span>
                      <span className="text-gray-900 dark:text-white text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                        10% OFF with WELCOME10
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl text-[#ff6b35]">
                        ${(calculateTotal() * 0.9).toFixed(2)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 line-through">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Key Benefits */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">Free shipping on orders over $100</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">Lifetime quality guarantee</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">75+ year fade resistance</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={onStartDesigning ? onStartDesigning : onClose}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#ff5722] text-white px-6 py-4 rounded-full transition-colors shadow-lg shadow-[#ff6b35]/20"
                  >
                    Start Designing
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location & Availability Banner */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-10 text-center border border-gray-700/50 shadow-lg">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-full mb-4">
                <Mountain className="w-5 h-5" />
                <span className="font-medium">Local Business, Global Service</span>
              </div>
              <h3 className="text-white text-2xl md:text-3xl mb-4">
                Based in Kennesaw, Georgia
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Proudly serving customers nationwide with our online ordering system available 24/7. Order anytime, from anywhere, and we'll create your premium metal prints with care and precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35]" />
                  <span>24/7 Online Ordering</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35]" />
                  <span>Nationwide Shipping</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35]" />
                  <span>Local Craftsmanship</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}