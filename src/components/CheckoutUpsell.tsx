import { motion } from 'motion/react';
import { Plus, TrendingUp, Gift, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface UpsellOption {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  icon: typeof Gift;
}

interface CheckoutUpsellProps {
  currentItems: Array<{
    size: string;
    finish: string;
    frame: string;
    mountType: string;
  }>;
  onAddUpsell: (option: UpsellOption) => void;
  className?: string;
}

export function CheckoutUpsell({ currentItems, onAddUpsell, className = '' }: CheckoutUpsellProps) {
  const [selectedUpsell, setSelectedUpsell] = useState<string | null>(null);

  // Smart upsell suggestions based on current order
  const getUpsellOptions = (): UpsellOption[] => {
    const options: UpsellOption[] = [];

    // 1. Multi-print discount (always show if only 1 item)
    if (currentItems.length === 1) {
      options.push({
        id: 'second-print',
        title: 'Add 2nd Print - Save 15%!',
        description: 'Same or different design. Mix & match sizes.',
        price: 0, // Will be calculated based on selection
        badge: 'Most Popular',
        icon: TrendingUp,
      });
    }

    // 2. Gift wrapping
    options.push({
      id: 'gift-wrap',
      title: 'Premium Gift Wrapping',
      description: 'Elegant packaging with ribbon and gift card.',
      price: 7.99,
      icon: Gift,
    });

    // 3. Matching frame if they didn't select one
    const hasUnframedPrint = currentItems.some(item => item.frame === 'None');
    if (hasUnframedPrint) {
      options.push({
        id: 'add-frame',
        title: 'Add Matching Frame',
        description: 'Protect and enhance your print with our custom frames.',
        price: 35,
        originalPrice: 45,
        badge: 'Save $10',
        icon: Sparkles,
      });
    }

    // 4. Upgrade to float mount if they have stick tape
    const hasStickTape = currentItems.some(item => item.mountType === 'Stick Tape');
    if (hasStickTape) {
      options.push({
        id: 'upgrade-mount',
        title: 'Upgrade to Float Mount',
        description: '3/4" standoff creates stunning depth and dimension.',
        price: 23,
        badge: 'Premium',
        icon: Plus,
      });
    }

    return options;
  };

  const upsellOptions = getUpsellOptions();

  if (upsellOptions.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={`bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete Your Order
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customers who added these saved an average of $18
          </p>
        </div>
      </div>

      {/* Upsell Options */}
      <div className="space-y-3">
        {upsellOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedUpsell === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => {
                setSelectedUpsell(option.id);
                onAddUpsell(option);
              }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30'
                  : 'border-purple-200 dark:border-purple-800 bg-white dark:bg-[#0a0a0a] hover:border-purple-400 dark:hover:border-purple-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isSelected 
                    ? 'bg-purple-500' 
                    : 'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isSelected 
                      ? 'text-white' 
                      : 'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {option.title}
                    </h4>
                    {option.badge && (
                      <span className="px-2 py-0.5 bg-[#ff6b35] text-white text-xs font-medium rounded">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {option.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${option.originalPrice.toFixed(2)}
                      </span>
                    )}
                    {option.price > 0 && (
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        +${option.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected && (
                    <motion.svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Social proof */}
      <motion.div
        className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          <strong className="text-purple-600 dark:text-purple-400">87%</strong> of customers who added these options said they'd recommend them
        </p>
      </motion.div>
    </motion.div>
  );
}
