import React from 'react';
import { motion } from 'motion/react';
import { X, Package, Sparkles, Shield, Home, Check } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface MetalPrintsExplainedPageProps {
  onClose: () => void;
}

export function MetalPrintsExplainedPage({ onClose }: MetalPrintsExplainedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-900 dark:text-white">Metal Prints Explained: Sizes, Finishes, Durability, and Use Cases</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Close page"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Return to Home Button */}
        <div className="mb-6">
          <ReturnToHomeButton onClick={onClose} />
        </div>

        {/* Introduction */}
        <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Metal prints are photographs infused directly into aluminum panels using a dye-sublimation printing process. Unlike paper or canvas prints, the image becomes part of the metal surface rather than being applied on top.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            This production method produces prints with high image clarity, color stability, and resistance to environmental factors such as humidity.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            High-quality metal prints produced on aluminum panels are commonly rated to last 50–60+ years indoors without noticeable fading when displayed away from prolonged direct sunlight.
          </p>
        </div>

        {/* What Are Metal Prints */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-[#ff6b35]" />
            <h2 className="text-2xl text-gray-900 dark:text-white">What Are Metal Prints</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Metal prints are photographs transferred onto specially coated aluminum panels through a heat-based process.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The dye-sublimation printing process bonds photographic dyes to the aluminum surface at high temperature. The dyes transition from solid to gas and infuse into the coating.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The result is a lightweight, rigid print with the image embedded into the material rather than sitting on the surface.
            </p>
          </div>
        </section>

        {/* What Is ChromaLuxe */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[#ff6b35]" />
            <h2 className="text-2xl text-gray-900 dark:text-white">What Is ChromaLuxe</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              ChromaLuxe is a manufacturer of coated aluminum panels designed for dye-sublimation printing.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              ChromaLuxe panels use a proprietary coating formulation that accepts and retains sublimation dyes. The panels are available in white and clear-coated finishes.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              ChromaLuxe aluminum panels are used in professional photography, art reproduction, and signage applications.
            </p>
          </div>
        </section>

        {/* Metal Print Finishes */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Metal Print Finishes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Gloss Finish</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Reflective surface with high color saturation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Produces deeper blacks and more vibrant colors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>May show reflections under direct lighting</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Matte Finish</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Non-reflective surface that reduces glare</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Softer color appearance compared to gloss</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Suitable for bright lighting conditions</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Available Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Available Sizes</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Metal prints are manufactured in standard and custom dimensions. Common sizes include:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li>5" × 7" (small format, often used for samples or test prints)</li>
              <li>12" × 8" (small to medium format)</li>
              <li>17" × 11" (medium format)</li>
              <li>24" × 16" (medium to large format)</li>
              <li>30" × 20" (large format)</li>
              <li>36" × 24" (extra large format)</li>
              <li>40" × 30" (gallery-sized format)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Larger panel sizes are available through specialized manufacturers. Panel thickness typically ranges from 0.045" to 0.125".
            </p>
          </div>
        </section>

        {/* Mounting Methods */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Mounting Methods</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Adhesive Backing</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Metal prints may include adhesive strips or pads applied to the reverse side. This allows direct mounting to flat wall surfaces without additional hardware.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Float Mount Hangers</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Float mounting systems use brackets attached to the panel's back. These create a gap between the wall and the print, producing a floating visual effect.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Magnetic Systems</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Magnetic mounting uses metal plates or strips on the wall and magnets on the panel. This allows for repositioning without tools or permanent wall attachment.
              </p>
            </div>
          </div>
        </section>

        {/* Durability and Lifespan */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#ff6b35]" />
            <h2 className="text-2xl text-gray-900 dark:text-white">Durability and Lifespan</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Metal prints are rated to last 50–60+ years indoors when displayed away from prolonged direct sunlight.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The aluminum substrate is moisture-resistant and does not absorb water. This makes metal prints suitable for indoor display in areas with higher humidity levels compared to paper-based prints.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The surface coating resists minor scratches and impacts. Cleaning can be performed with a damp cloth without damaging the image.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              UV exposure from direct sunlight can cause gradual color degradation over time. Displays in shaded areas or indirect lighting preserve color integrity longer.
            </p>
          </div>
        </section>

        {/* Common Use Cases */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-6 h-6 text-[#ff6b35]" />
            <h2 className="text-2xl text-gray-900 dark:text-white">Common Use Cases</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Metal prints are used in the following contexts:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li>Residential wall art in living rooms, bedrooms, and kitchens</li>
              <li>Commercial spaces including offices, restaurants, and retail stores</li>
              <li>Professional photography portfolios and gallery displays</li>
              <li>Indoor signage and wayfinding systems</li>
              <li>Bathroom and kitchen displays where moisture resistance is beneficial</li>
            </ul>
          </div>
        </section>

        {/* Situations Where Metal Prints May Not Be Ideal */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Situations Where Metal Prints May Not Be Ideal</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Metal prints may not be the preferred option in the following scenarios:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li>When a textured canvas appearance is desired</li>
              <li>Budget-limited projects where lower initial cost is the primary factor</li>
              <li>Outdoor installations exposed to direct weather elements (unless specifically rated for outdoor use)</li>
              <li>Applications requiring flexibility or the ability to roll the print for transport</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Metal Prints Explained: Sizes, Finishes, Durability, and Use Cases',
            description: 'Metal prints are photographs infused directly into aluminum panels using a dye-sublimation printing process. This production method produces prints with high image clarity, color stability, and resistance to environmental factors.',
            articleBody: 'Metal prints are photographs infused directly into aluminum panels using a dye-sublimation printing process. Unlike paper or canvas prints, the image becomes part of the metal surface rather than being applied on top. This production method produces prints with high image clarity, color stability, and resistance to environmental factors such as humidity. High-quality metal prints produced on aluminum panels are commonly rated to last 50–60+ years indoors without noticeable fading when displayed away from prolonged direct sunlight.',
            publisher: {
              '@type': 'Organization',
              name: 'Bespoke Metal Prints',
              url: 'https://bespokemetalprints.com'
            }
          })
        }}
      />
    </motion.div>
  );
}