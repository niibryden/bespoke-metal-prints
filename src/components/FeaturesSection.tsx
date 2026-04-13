import { motion } from 'motion/react';
import { Palette, Maximize2, Magnet, Frame, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const features = [
  {
    icon: Palette,
    title: 'Finish',
    options: [
      { name: 'Matte', tooltip: 'Smooth, non-reflective finish that reduces glare and fingerprints' },
      { name: 'Gloss', tooltip: 'High-shine finish that enhances colors and contrast' },
    ],
    description: 'Choose your perfect finish',
    gradient: 'from-purple-500/10 to-pink-500/10',
    iconBg: 'bg-purple-500/20 dark:bg-purple-500/10',
  },
  {
    icon: Maximize2,
    title: 'Size',
    options: [
      { name: '5" × 7"', tooltip: 'Sample print size - perfect for testing quality before larger orders', badge: 'Sample' },
      { name: '12" × 8"', tooltip: 'Our most popular size - great for any room', badge: 'Popular' },
      { name: '17" × 11"', tooltip: 'Versatile medium size for most spaces' },
      { name: '24" × 16"', tooltip: 'Large format for statement pieces' },
      { name: '30" × 20"', tooltip: 'Extra large for dramatic impact' },
      { name: '36" × 24"', tooltip: 'Premium large format' },
      { name: '40" × 30"', tooltip: 'Gallery-sized for maximum impact' },
      { name: 'Custom Size', tooltip: 'Need a specific size? We can create custom dimensions for your unique space', badge: 'New' },
    ],
    description: 'From sample to wall-sized',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconBg: 'bg-blue-500/20 dark:bg-blue-500/10',
  },
  {
    icon: Magnet,
    title: 'Mount Type',
    options: [
      { name: 'Stick Tape', tooltip: 'Easy peel-and-stick mounting for lightweight installations' },
      { name: 'Float Mount', tooltip: 'Creates a modern floating effect with 3/4" standoff from wall' },
      { name: '3D Magnet', tooltip: 'Magnetic mounting system for easy swapping and repositioning' },
    ],
    description: 'Easy installation options',
    gradient: 'from-green-500/10 to-emerald-500/10',
    iconBg: 'bg-green-500/20 dark:bg-green-500/10',
  },
  {
    icon: Frame,
    title: 'Frame',
    options: [
      { name: 'None', tooltip: 'Frameless design for a sleek, contemporary look' },
      { name: 'Black', tooltip: 'Classic black metal frame for timeless elegance' },
      { name: 'Gold', tooltip: 'Luxurious gold frame that adds warmth and sophistication' },
      { name: 'Natural Wood', tooltip: 'Sustainable wood frame for organic, rustic charm' },
    ],
    description: 'Enhance your artwork',
    gradient: 'from-orange-500/10 to-red-500/10',
    iconBg: 'bg-orange-500/20 dark:bg-orange-500/10',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-[#0a0a0a] dark:to-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-block mb-4"
          >
            <motion.span 
              className="text-[#ff6b35] uppercase tracking-wider text-sm font-semibold"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Premium Customization
            </motion.span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-black mb-4 dark:text-white">
            Tailor Every Detail
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto dark:text-gray-400">
            Endless possibilities to create your perfect metal print
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200 hover:border-[#ff6b35]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#ff6b35]/10 dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:hover:border-[#ff6b35]/40 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div 
                  className={`w-14 h-14 sm:w-16 sm:h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#ff6b35]" />
                </motion.div>

                {/* Title & Description */}
                <h3 className="text-xl sm:text-2xl text-black mb-2 dark:text-white group-hover:text-[#ff6b35] dark:group-hover:text-[#ff6b35] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 dark:text-gray-400">
                  {feature.description}
                </p>
                
                {/* Options with enhanced tooltips */}
                <div className="space-y-2.5">
                  {feature.options.map((option) => (
                    <TooltipProvider key={option.name}>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <motion.div 
                            className="flex items-center gap-3 text-gray-700 hover:text-[#ff6b35] transition-colors cursor-help p-2 rounded-lg hover:bg-[#ff6b35]/5 dark:text-gray-300 dark:hover:bg-[#ff6b35]/10 group/item"
                            whileHover={{ x: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <div className="w-5 h-5 rounded-full bg-[#ff6b35]/20 dark:bg-[#ff6b35]/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#ff6b35] transition-colors">
                              <Check className="w-3 h-3 text-[#ff6b35] group-hover/item:text-white transition-colors" />
                            </div>
                            <span className="text-sm font-medium flex items-center gap-2 flex-1">
                              {option.name}
                            </span>
                            {option.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                option.badge === 'Sample' ? 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400' :
                                option.badge === 'Popular' ? 'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400' :
                                'bg-[#ff6b35]/20 text-[#ff6b35] dark:bg-[#ff6b35]/30'
                              }`}>
                                {option.badge}
                              </span>
                            )}
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent 
                          className="max-w-xs bg-gradient-to-br from-[#ff6b35] to-[#ff8555] text-white border-none shadow-2xl p-4 rounded-xl"
                          side="top"
                          sideOffset={10}
                        >
                          <div className="flex items-start gap-2">
                            <p className="text-sm leading-relaxed">{option.tooltip}</p>
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff6b35] rotate-45" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>

                {/* Count badge */}
                <motion.div
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a2a] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <span>{feature.options.length} options</span>
                  <motion.span
                    className="text-[#ff6b35] font-medium"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    Hover for details
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start customizing your perfect metal print below ↓
          </p>
          <motion.div
            className="w-12 h-12 mx-auto bg-[#ff6b35]/10 rounded-full flex items-center justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}