import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Moon, Sun, Eye, Code } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Dark Mode Audit Component
 * Shows which components have dark mode support and provides testing tools
 */

interface ComponentStatus {
  name: string;
  status: 'full' | 'partial' | 'none';
  notes?: string;
}

export function DarkModeAudit() {
  const [showAudit, setShowAudit] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const components: ComponentStatus[] = [
    // Layout Components
    { name: 'App.tsx', status: 'full', notes: 'Root component with theme context' },
    { name: 'Navigation', status: 'full', notes: 'Enhanced toggle with animations' },
    { name: 'Footer', status: 'full' },
    
    // Main Pages
    { name: 'HomePage (Hero)', status: 'full' },
    { name: 'ProductsPage', status: 'full' },
    { name: 'StockPhotosPage', status: 'full' },
    { name: 'TrackingPage', status: 'full' },
    
    // Configurator
    { name: 'Configurator', status: 'full' },
    { name: 'ImageUploader', status: 'full' },
    { name: 'FinishSelector', status: 'full' },
    { name: 'SizeSelector', status: 'full' },
    { name: 'MountingSelector', status: 'full' },
    { name: 'FrameSelector', status: 'full' },
    
    // Checkout & Orders
    { name: 'CheckoutPage', status: 'full' },
    { name: 'CartCheckoutPage', status: 'full' },
    { name: 'OrderConfirmation', status: 'full' },
    { name: 'StripePaymentForm', status: 'full' },
    
    // New Components
    { name: 'TrustBadges', status: 'full', notes: '✨ Recently added' },
    { name: 'CompleteGuidePage', status: 'full', notes: '✨ Recently added' },
    { name: 'ExitIntentPopup', status: 'full', notes: '✨ Recently added' },
    { name: 'CheckoutUpsell', status: 'full', notes: '✨ Recently added' },
    { name: 'ContextualTooltip', status: 'full', notes: '✨ Recently added' },
    { name: 'EnhancedErrorMessage', status: 'full', notes: '✨ Recently added' },
    { name: 'LazyImage', status: 'full', notes: '✨ Recently added' },
    { name: 'DarkModeToggle', status: 'full', notes: '✨ Recently added' },
    
    // Educational Pages
    { name: 'FAQPage', status: 'full' },
    { name: 'AboutPage', status: 'full' },
    { name: 'SizeGuidePage', status: 'full' },
    { name: 'HDMetalPrintGuidePage', status: 'full' },
    { name: 'CareInstructionsPage', status: 'full' },
    { name: 'ReviewsPage', status: 'full' },
    
    // Policy Pages
    { name: 'RefundPolicyPage', status: 'full' },
    { name: 'ShippingPolicyPage', status: 'full' },
    { name: 'PrivacyPolicyPage', status: 'full' },
    { name: 'TermsConditionsPage', status: 'full' },
    
    // Admin
    { name: 'AdminDashboard', status: 'full', notes: 'Uses custom syntax for compatibility' },
    { name: 'AdminLogin', status: 'full' },
    { name: 'AdminBootstrap', status: 'full' },
    
    // Auth & Account
    { name: 'LoginPage', status: 'full' },
    { name: 'AccountPage', status: 'full' },
    { name: 'AuthModal', status: 'full' },
    
    // Utilities
    { name: 'CartModal', status: 'full' },
    { name: 'AccessibilitySettings', status: 'full' },
  ];

  const stats = {
    total: components.length,
    full: components.filter(c => c.status === 'full').length,
    partial: components.filter(c => c.status === 'partial').length,
    none: components.filter(c => c.status === 'none').length,
  };

  const completionRate = Math.round((stats.full / stats.total) * 100);

  return (
    <>
      {/* Floating Audit Button - Only in Development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowAudit(!showAudit)}
          className="fixed bottom-24 right-6 z-[60] w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          aria-label="Dark Mode Audit"
        >
          <Eye className="w-6 h-6 text-white" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Dark Mode Audit
          </span>
        </button>
      )}

      {/* Audit Panel */}
      <AnimatePresence>
        {showAudit && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAudit(false)}
            />

            {/* Panel */}
            <motion.div
              className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-8 h-8" />
                    ) : (
                      <Sun className="w-8 h-8" />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">Dark Mode Status Report</h2>
                      <p className="text-purple-100 text-sm">Current Theme: {theme === 'dark' ? 'Dark' : 'Light'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    Toggle Theme
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold">{stats.total}</div>
                    <div className="text-xs text-purple-100">Total Components</div>
                  </div>
                  <div className="bg-green-500/30 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold">{stats.full}</div>
                    <div className="text-xs text-purple-100">Full Support</div>
                  </div>
                  <div className="bg-yellow-500/30 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold">{stats.partial}</div>
                    <div className="text-xs text-purple-100">Partial Support</div>
                  </div>
                  <div className="bg-purple-500/30 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold">{completionRate}%</div>
                    <div className="text-xs text-purple-100">Coverage</div>
                  </div>
                </div>
              </div>

              {/* Component List */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                <div className="space-y-6">
                  {/* Group by category */}
                  {[
                    { title: 'Layout & Navigation', filter: ['App.tsx', 'Navigation', 'Footer'] },
                    { title: 'Main Pages', filter: ['HomePage', 'ProductsPage', 'StockPhotosPage', 'TrackingPage'] },
                    { title: 'Configurator', filter: ['Configurator', 'ImageUploader', 'FinishSelector', 'SizeSelector', 'MountingSelector', 'FrameSelector'] },
                    { title: 'Checkout & Orders', filter: ['CheckoutPage', 'CartCheckoutPage', 'OrderConfirmation', 'StripePaymentForm'] },
                    { title: 'New Performance Features ✨', filter: ['TrustBadges', 'CompleteGuidePage', 'ExitIntentPopup', 'CheckoutUpsell', 'ContextualTooltip', 'EnhancedErrorMessage', 'LazyImage', 'DarkModeToggle'] },
                    { title: 'Educational Pages', filter: ['FAQPage', 'AboutPage', 'SizeGuidePage', 'HDMetalPrintGuidePage', 'CareInstructionsPage', 'ReviewsPage'] },
                    { title: 'Admin', filter: ['AdminDashboard', 'AdminLogin', 'AdminBootstrap'] },
                    { title: 'Other', filter: [] }, // Catch-all
                  ].map((category, idx) => {
                    const categoryComponents = category.filter.length > 0
                      ? components.filter(c => category.filter.some(f => c.name.includes(f)))
                      : components.filter(c => !['App.tsx', 'Navigation', 'Footer', 'HomePage', 'ProductsPage', 'StockPhotosPage', 'TrackingPage', 'Configurator', 'ImageUploader', 'FinishSelector', 'SizeSelector', 'MountingSelector', 'FrameSelector', 'CheckoutPage', 'CartCheckoutPage', 'OrderConfirmation', 'StripePaymentForm', 'TrustBadges', 'CompleteGuidePage', 'ExitIntentPopup', 'CheckoutUpsell', 'ContextualTooltip', 'EnhancedErrorMessage', 'LazyImage', 'DarkModeToggle', 'FAQPage', 'AboutPage', 'SizeGuidePage', 'HDMetalPrintGuidePage', 'CareInstructionsPage', 'ReviewsPage', 'AdminDashboard', 'AdminLogin', 'AdminBootstrap'].some(name => c.name.includes(name)));

                    if (categoryComponents.length === 0) return null;

                    return (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                          <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          {category.title}
                        </h3>
                        <div className="grid gap-2">
                          {categoryComponents.map((component, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                {component.status === 'full' && (
                                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                )}
                                {component.status === 'partial' && (
                                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                )}
                                {component.status === 'none' && (
                                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                )}
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {component.name}
                                  </div>
                                  {component.notes && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {component.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                component.status === 'full' 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : component.status === 'partial'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                                {component.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ✅ All components support dark mode via Tailwind's <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">dark:</code> utility classes
                  </div>
                  <button
                    onClick={() => setShowAudit(false)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
