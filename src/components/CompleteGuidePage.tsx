import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Shield, Droplets, Star, Package, Palette, Frame, X } from 'lucide-react';

interface CompleteGuidePageProps {
  onClose: () => void;
}

export function CompleteGuidePage({ onClose }: CompleteGuidePageProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white dark:bg-[#0a0a0a] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Back to Home Button - Fixed Position */}
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-full shadow-lg transition-colors border border-gray-200 dark:border-[#2a2a2a] group"
          aria-label="Return to Home"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
            Return to Home
          </span>
        </button>

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-[#ff6b35]/10 rounded-full">
            <Sparkles className="w-5 h-5 text-[#ff6b35]" />
            <span className="text-[#ff6b35] font-medium">Complete Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl mb-6 text-black dark:text-white">
            Everything You Need to Know About<br />
            <span className="text-[#ff6b35]">HD Metal Prints</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From selecting the perfect photo to caring for your finished print,
            we've got you covered.
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          className="bg-gradient-to-br from-gray-50 to-white dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-2xl p-8 mb-12 border border-gray-200 dark:border-[#ff6b35]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-black dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-[#ff6b35]" />
            Quick Navigation
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'What is HD Metal Print?', id: 'what-is' },
              { title: 'Print Quality & Resolution', id: 'quality' },
              { title: 'Finish Options', id: 'finishes' },
              { title: 'Mounting & Framing', id: 'mounting' },
              { title: 'Care Instructions', id: 'care' },
              { title: 'Best Practices', id: 'best-practices' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-4 py-3 bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#ff6b35]/20 hover:border-[#ff6b35] dark:hover:border-[#ff6b35] transition-all text-gray-700 dark:text-gray-300 hover:text-[#ff6b35]"
              >
                {item.title} →
              </a>
            ))}
          </div>
        </motion.div>

        {/* What is HD Metal Print */}
        <motion.section
          id="what-is"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-black dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#ff6b35]" />
            What is HD Metal Print?
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              HD Metal Printing, also known as dye-sublimation metal printing, is a cutting-edge process that infuses
              your images directly into specially coated aluminum panels. Unlike traditional prints, the image becomes
              part of the metal surface itself, creating stunning depth and luminosity.
            </p>
            <div className="bg-[#ff6b35]/10 border-l-4 border-[#ff6b35] p-6 rounded-r-lg my-6">
              <h4 className="text-lg font-semibold mb-2 text-black dark:text-white">The Process:</h4>
              <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>1. Image Preparation:</strong> Your photo is optimized for maximum quality</li>
                <li><strong>2. Heat Transfer:</strong> Dye is sublimated at 400°F, infusing into the metal</li>
                <li><strong>3. Permanent Bond:</strong> Image becomes one with the aluminum surface</li>
                <li><strong>4. Protective Coating:</strong> Clear coat ensures durability for decades</li>
              </ol>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The result? Museum-quality prints with incredible color vibrancy, exceptional detail, and a sleek,
              modern aesthetic that traditional prints simply can't match.
            </p>
          </div>
        </motion.section>

        {/* Print Quality */}
        <motion.section
          id="quality"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-black dark:text-white flex items-center gap-3">
            <Star className="w-8 h-8 text-[#ff6b35]" />
            Print Quality & Resolution
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              For the best results, we recommend images with a minimum resolution based on your chosen size:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-8">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h4 className="text-lg font-semibold mb-3 text-green-800 dark:text-green-400">✓ Excellent Quality</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2"><strong>300+ DPI</strong></p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Professional quality with sharp, crisp details. Ideal for any size up to 24×36"
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <h4 className="text-lg font-semibold mb-3 text-amber-800 dark:text-amber-400">⚠ Good Quality</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2"><strong>200-300 DPI</strong></p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Good quality suitable for most applications. Consider smaller sizes for best results
                </p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-300">
                <strong>💡 Pro Tip:</strong> Our configurator automatically analyzes your image and recommends optimal
                print sizes based on resolution. Upload your photo to see instant quality feedback!
              </p>
            </div>
          </div>
        </motion.section>

        {/* Finishes */}
        <motion.section
          id="finishes"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-black dark:text-white flex items-center gap-3">
            <Palette className="w-8 h-8 text-[#ff6b35]" />
            Finish Options
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Gloss Finish */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-gray-200 dark:border-[#ff6b35]/20 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 shadow-lg"></div>
              <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">Gloss Finish</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                High-shine surface that makes colors pop with incredible vibrancy and depth. Perfect for vibrant
                landscapes, colorful art, and images with rich colors.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span>✓</span> Maximum color vibrancy
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span>✓</span> Reflective, modern look
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span>✓</span> Best for bright environments
                </div>
              </div>
            </div>

            {/* Matte Finish */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-gray-200 dark:border-[#ff6b35]/20 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">Matte Finish</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Elegant, non-reflective surface perfect for professional settings. Reduces glare and provides
                a sophisticated, gallery-quality appearance.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span>✓</span> No glare or reflections
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span>✓</span> Elegant, refined look
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span>✓</span> Perfect for offices
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Mounting & Framing */}
        <motion.section
          id="mounting"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-black dark:text-white flex items-center gap-3">
            <Frame className="w-8 h-8 text-[#ff6b35]" />
            Mounting & Framing Options
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20">
                <h4 className="text-lg font-semibold mb-2 text-black dark:text-white">Stick Tape (Included)</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Double-sided adhesive tape for easy wall mounting. Perfect for lightweight prints and temporary displays.
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20">
                <h4 className="text-lg font-semibold mb-2 text-black dark:text-white">Float Mount (+$23)</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Standoffs create a stunning 3/4" gap between wall and print, adding depth and dimension.
                  Premium choice for modern interiors.
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#ff6b35]/20">
                <h4 className="text-lg font-semibold mb-2 text-black dark:text-white">Frames (+$35-45)</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Choose from Black, White, or Natural Wood frames. All frames include easy-hang hardware and
                  protective corners.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Care Instructions */}
        <motion.section
          id="care"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-black dark:text-white flex items-center gap-3">
            <Droplets className="w-8 h-8 text-[#ff6b35]" />
            Care Instructions
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Metal prints are incredibly durable, but proper care ensures they last for decades:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-600 dark:text-green-400">✓ Do:</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Clean with soft, dry microfiber cloth</li>
                  <li>Use glass cleaner for stubborn marks</li>
                  <li>Hang in any room - even bathrooms!</li>
                  <li>Display in direct sunlight (UV resistant)</li>
                  <li>Handle by edges during installation</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">✗ Don't:</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Use abrasive cleaners or rough cloths</li>
                  <li>Submerge in water</li>
                  <li>Use acetone or harsh chemicals</li>
                  <li>Bend or flex the metal panel</li>
                  <li>Touch print surface with bare hands</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Best Practices */}
        <motion.section
          id="best-practices"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-black dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#ff6b35]" />
            Best Practices for Amazing Results
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-[#1a1a1a] rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold mb-3 text-purple-800 dark:text-purple-400">Photo Selection</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Choose high-resolution images (3000+ pixels). Photos with vibrant colors and good contrast work best.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-[#1a1a1a] rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-400">Size Selection</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Consider viewing distance. Larger prints work great from far away, smaller for close viewing.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-[#1a1a1a] rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold mb-3 text-green-800 dark:text-green-400">Placement</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Gloss finish: Avoid direct light angles. Matte finish: Perfect for any lighting condition.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-center bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-2xl p-12 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Metal Print?</h2>
          <p className="text-lg mb-8 opacity-90">
            Use our configurator to upload your photo and see instant quality feedback!
          </p>
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white text-[#ff6b35] rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
          >
            Start Creating →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}