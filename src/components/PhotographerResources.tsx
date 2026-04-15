import { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, DollarSign, TrendingUp, Image, FileText, HelpCircle, Download, ExternalLink, CheckCircle, AlertCircle, Star, Zap, Shield } from 'lucide-react';

export function PhotographerResources() {
  const [activeSection, setActiveSection] = useState<'getting-started' | 'guidelines' | 'best-practices' | 'payouts' | 'faq'>('getting-started');

  const sections = [
    { id: 'getting-started' as const, label: 'Getting Started', icon: Camera },
    { id: 'guidelines' as const, label: 'Submission Guidelines', icon: FileText },
    { id: 'best-practices' as const, label: 'Best Practices', icon: Star },
    { id: 'payouts' as const, label: 'Earnings & Payouts', icon: DollarSign },
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 [data-theme='light']_&:text-gray-900">
          Photographer Resources
        </h1>
        <p className="text-gray-400 text-lg [data-theme='light']_&:text-gray-600">
          Everything you need to succeed on the Bespoke Metal Prints marketplace
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
              ${activeSection === section.id
                ? 'bg-[#ff6b35] text-white shadow-lg'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] [data-theme=\'light\']_&:bg-gray-100 [data-theme=\'light\']_&:hover:bg-gray-200'
              }
            `}
            aria-label={`View ${section.label}`}
          >
            <section.icon className="w-4 h-4" />
            <span className="font-medium">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
      >
        {/* Getting Started */}
        {activeSection === 'getting-started' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 [data-theme='light']_&:text-gray-900">
                <Camera className="w-7 h-7 text-[#ff6b35]" />
                Getting Started as a Photographer
              </h2>
              <p className="text-gray-400 text-lg [data-theme='light']_&:text-gray-600">
                Welcome to the Bespoke Metal Prints photographer marketplace! Follow these steps to start earning from your photography.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-[#0a0a0a] rounded-xl p-6 border-l-4 border-[#ff6b35] [data-theme='light']_&:bg-gray-50">
                <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#ff6b35]">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 [data-theme='light']_&:text-gray-900">
                  Create Your Profile
                </h3>
                <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                  Sign up and complete your photographer profile with a bio, portfolio link, and payment information.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#0a0a0a] rounded-xl p-6 border-l-4 border-blue-500 [data-theme='light']_&:bg-gray-50">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-500">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 [data-theme='light']_&:text-gray-900">
                  Upload Quality Photos
                </h3>
                <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                  Submit high-resolution images (min. 3000x2000px) with proper titles, descriptions, and categories.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#0a0a0a] rounded-xl p-6 border-l-4 border-green-500 [data-theme='light']_&:bg-gray-50">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-500">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 [data-theme='light']_&:text-gray-900">
                  Start Earning
                </h3>
                <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                  Earn 40% royalty on every sale. Track your earnings and request payouts once you reach $50.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gradient-to-br from-[#ff6b35]/20 to-[#ff8c42]/20 border border-[#ff6b35]/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-[#ff6b35]" />
                  <div>
                    <p className="text-2xl font-bold text-white [data-theme='light']_&:text-gray-900">40%</p>
                    <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Royalty Rate</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-white [data-theme='light']_&:text-gray-900">$50</p>
                    <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Min. Payout</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-white [data-theme='light']_&:text-gray-900">Fast</p>
                    <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Auto-Approval</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Guidelines */}
        {activeSection === 'guidelines' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 [data-theme='light']_&:text-gray-900">
                <FileText className="w-7 h-7 text-[#ff6b35]" />
                Submission Guidelines
              </h2>
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                Follow these requirements to ensure your photos are approved quickly.
              </p>
            </div>

            {/* Technical Requirements */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 [data-theme='light']_&:text-gray-900">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Technical Requirements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] rounded-lg p-4 [data-theme='light']_&:bg-gray-50">
                  <p className="text-white font-medium mb-2 [data-theme='light']_&:text-gray-900">Resolution</p>
                  <ul className="space-y-2 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Minimum: 3000 x 2000 pixels
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Recommended: 4000 x 3000 or higher
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Print quality: 300 DPI minimum
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4 [data-theme='light']_&:bg-gray-50">
                  <p className="text-white font-medium mb-2 [data-theme='light']_&:text-gray-900">File Format</p>
                  <ul className="space-y-2 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Accepted: JPG, JPEG, PNG, WebP
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Maximum size: 50 MB
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Color space: sRGB recommended
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4 [data-theme='light']_&:bg-gray-50">
                  <p className="text-white font-medium mb-2 [data-theme='light']_&:text-gray-900">Image Quality</p>
                  <ul className="space-y-2 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Sharp focus (no blur)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Low noise/grain
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Proper exposure (not too dark/bright)
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4 [data-theme='light']_&:bg-gray-50">
                  <p className="text-white font-medium mb-2 [data-theme='light']_&:text-gray-900">Metadata</p>
                  <ul className="space-y-2 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Descriptive title (required)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Detailed description (required)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Accurate category selection
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Content Guidelines */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 [data-theme='light']_&:text-gray-900">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                Content Guidelines
              </h3>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-white font-medium mb-3 [data-theme='light']_&:text-gray-900">Not Allowed:</p>
                <ul className="space-y-2 text-sm text-red-400">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Copyrighted content (unless you own rights)
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Recognizable people without model releases
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Trademarks or logos prominently featured
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Offensive, violent, or inappropriate content
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    AI-generated images (unless disclosed)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Best Practices */}
        {activeSection === 'best-practices' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 [data-theme='light']_&:text-gray-900">
                <Star className="w-7 h-7 text-[#ff6b35]" />
                Best Practices for Success
              </h2>
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                Tips from our top-earning photographers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photography Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white [data-theme='light']_&:text-gray-900">
                  📸 Photography Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                  <li className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
                    <Star className="w-5 h-5 text-[#ff6b35] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium mb-1 [data-theme='light']_&:text-gray-900">Focus on Popular Subjects</p>
                      <p>Nature, landscapes, abstracts, and minimalist compositions sell best</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
                    <Star className="w-5 h-5 text-[#ff6b35] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium mb-1 [data-theme='light']_&:text-gray-900">Think About Print Quality</p>
                      <p>Images with bold colors and strong contrast look amazing on metal</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
                    <Star className="w-5 h-5 text-[#ff6b35] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium mb-1 [data-theme='light']_&:text-gray-900">Consider Aspect Ratios</p>
                      <p>12:8, 16:24, and square (1:1) are most popular print sizes</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Marketing Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white [data-theme='light']_&:text-gray-900">
                  📈 Marketing Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                  <li className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium mb-1 [data-theme='light']_&:text-gray-900">Write Compelling Descriptions</p>
                      <p>Tell the story behind your photo to connect with buyers</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium mb-1 [data-theme='light']_&:text-gray-900">Use Accurate Keywords</p>
                      <p>Help customers find your work with relevant, searchable terms</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium mb-1 [data-theme='light']_&:text-gray-900">Upload Regularly</p>
                      <p>Active photographers with fresh content get more visibility</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Download Resources */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 [data-theme='light']_&:text-gray-900">
                <Download className="w-6 h-6 text-blue-500" />
                Downloadable Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a
                  href="#"
                  className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors group [data-theme='light']_&:bg-white [data-theme='light']_&:hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-white font-medium [data-theme='light']_&:text-gray-900">Submission Checklist PDF</p>
                      <p className="text-xs text-gray-500">Quick reference guide</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-[#ff6b35] transition-colors" />
                </a>

                <a
                  href="#"
                  className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors group [data-theme='light']_&:bg-white [data-theme='light']_&:hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Image className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-white font-medium [data-theme='light']_&:text-gray-900">Print Size Templates</p>
                      <p className="text-xs text-gray-500">Photoshop & Lightroom</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-[#ff6b35] transition-colors" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Payouts */}
        {activeSection === 'payouts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 [data-theme='light']_&:text-gray-900">
                <DollarSign className="w-7 h-7 text-[#ff6b35]" />
                Earnings & Payouts
              </h2>
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                How you earn and get paid on Bespoke Metal Prints
              </p>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 [data-theme='light']_&:text-gray-900">
                40% Royalty on Every Sale
              </h3>
              <div className="space-y-3 text-gray-300 [data-theme='light']_&:text-gray-700">
                <p>You earn 40% of the base print price for each sale. Here's how it works:</p>
                <div className="bg-[#0a0a0a]/50 rounded-lg p-4 [data-theme='light']_&:bg-white/50">
                  <p className="font-mono text-sm">
                    Base Print Price: $49.99<br />
                    Your Royalty (40%): <span className="text-green-500 font-bold">$20.00</span><br />
                    <span className="text-xs text-gray-500">Customer pays full price + mounting/frame options</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0a0a] rounded-xl p-6 [data-theme='light']_&:bg-gray-50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 [data-theme='light']_&:text-gray-900">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Payment Schedule
                </h3>
                <ul className="space-y-3 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Minimum payout: $50
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Earnings available 14 days after sale
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Processing time: 3-5 business days
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Request payouts anytime
                  </li>
                </ul>
              </div>

              <div className="bg-[#0a0a0a] rounded-xl p-6 [data-theme='light']_&:bg-gray-50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 [data-theme='light']_&:text-gray-900">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Payment Methods
                </h3>
                <ul className="space-y-3 text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    PayPal (instant)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Venmo (instant)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Bank Transfer/ACH (1-3 days)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Check (5-7 days)
                  </li>
                </ul>
              </div>
            </div>

            {/* Tax Information */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-500">
                  <p className="font-semibold mb-1">Tax Information</p>
                  <p className="text-yellow-400">
                    You're responsible for reporting your earnings. Download monthly earning statements for tax purposes. 
                    We'll send a 1099 form if you earn over $600 in a calendar year (US photographers).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeSection === 'faq' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 [data-theme='light']_&:text-gray-900">
                <HelpCircle className="w-7 h-7 text-[#ff6b35]" />
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "How long does photo approval take?",
                  a: "Most photos are auto-approved within minutes if they meet our technical requirements. Photos requiring manual review are typically approved within 24-48 hours."
                },
                {
                  q: "Can I upload the same photo to other platforms?",
                  a: "Yes! You retain full rights to your images. You can sell them on other platforms, though we appreciate exclusive content when possible."
                },
                {
                  q: "What happens if a customer returns a print?",
                  a: "Returns are rare but if they happen, the royalty for that sale is deducted from your available balance. You're only paid for completed, non-returned orders."
                },
                {
                  q: "How do I become a 'Trusted Photographer'?",
                  a: "After 10 successful sales with no quality issues, you're automatically upgraded to trusted status, which enables faster auto-approval and higher visibility."
                },
                {
                  q: "Can I see which photos are selling best?",
                  a: "Yes! Your photographer dashboard shows detailed analytics including views, sales, and earnings per photo."
                },
                {
                  q: "What if my photo is rejected?",
                  a: "You'll receive an email explaining why. Common reasons include low resolution, poor image quality, or copyright concerns. You can resubmit after fixing the issues."
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0a] rounded-lg p-6 border-l-4 border-[#ff6b35] [data-theme='light']_&:bg-gray-50"
                >
                  <h3 className="text-lg font-semibold text-white mb-2 [data-theme='light']_&:text-gray-900">
                    {faq.q}
                  </h3>
                  <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 [data-theme='light']_&:text-gray-900">
                Still have questions?
              </h3>
              <p className="text-gray-400 mb-4 [data-theme='light']_&:text-gray-600">
                Our photographer support team is here to help!
              </p>
              <a
                href="mailto:photographers@bespokemetalprints.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors font-semibold"
              >
                Contact Support
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
