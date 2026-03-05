import React from 'react';
import { motion } from 'motion/react';
import { X, Check, Droplets } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface BestWallArtBathroomsPageProps {
  onClose: () => void;
}

export function BestWallArtBathroomsPage({ onClose }: BestWallArtBathroomsPageProps) {
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
            <h1 className="text-gray-900 dark:text-white">Best Wall Art for Bathrooms</h1>
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

        {/* Summary Block */}
        <div className="bg-gradient-to-br from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10 rounded-2xl p-6 mb-8">
          <p className="text-gray-900 dark:text-white leading-relaxed">
            Bathroom wall art must resist moisture and humidity exposure. Metal prints provide moisture-resistant indoor display suitable for bathroom environments. Paper and canvas prints require protective measures in humid conditions.
          </p>
        </div>

        {/* What Are Metal Prints */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">What Are Metal Prints</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
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
        </section>

        {/* Bathroom Environment Challenges */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-[#ff6b35]" />
            <h2 className="text-2xl text-gray-900 dark:text-white">Bathroom Environment Challenges</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Bathroom environments create specific challenges for wall art materials:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li><strong>Humidity exposure:</strong> Steam from showers and baths increases ambient moisture levels</li>
              <li><strong>Temperature fluctuation:</strong> Hot showers create temporary temperature variations</li>
              <li><strong>Water contact risk:</strong> Splashing or spray may contact wall surfaces</li>
              <li><strong>Ventilation variation:</strong> Moisture levels depend on exhaust fan usage and window ventilation</li>
              <li><strong>Cleaning requirements:</strong> Bathroom cleaning products may contact art surfaces</li>
            </ul>
          </div>
        </section>

        {/* Metal Prints for Bathrooms */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Metal Prints for Bathrooms</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Metal prints address bathroom environment challenges through the following characteristics:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Moisture-resistant substrate:</strong> Aluminum does not absorb water or warp from humidity</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Infused image:</strong> Dye-sublimation process embeds image into coating rather than applying surface layer</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Simple cleaning:</strong> Wipe with damp cloth; compatible with bathroom cleaning products</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>No protective framing required:</strong> Eliminates glass surfaces that collect condensation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Corrosion resistance:</strong> Aluminum naturally resists corrosion in humid environments</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Bathroom Placement Considerations */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Bathroom Placement Considerations</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Near Shower or Tub</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Metal prints withstand steam exposure and occasional water splashing. Position away from direct water spray. Ensure adequate ventilation to reduce prolonged moisture exposure.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Above Toilet or Vanity</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Lower humidity exposure in these locations. Metal prints require no special protection. Easy cleaning maintains appearance between deep bathroom cleaning sessions.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Opposite Wall</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Minimal direct moisture contact. Metal prints provide same longevity as other indoor locations. Matte finish reduces mirror reflections if positioned across from mirror surfaces.
              </p>
            </div>
          </div>
        </section>

        {/* Alternative Materials */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Alternative Materials</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Other materials for bathroom wall art include:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li><strong>Paper prints with sealed frames:</strong> Require airtight framing to prevent moisture penetration; glass must be sealed at edges</li>
              <li><strong>Canvas prints:</strong> Absorbent fabric may develop mold or mildew in high-humidity conditions unless treated with protective coating</li>
              <li><strong>Acrylic prints:</strong> Moisture-resistant but heavy; may show condensation on surface in steamy conditions</li>
              <li><strong>Laminated prints:</strong> Protective lamination provides moisture barrier for paper prints</li>
            </ul>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Summary</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Bathroom wall art selection prioritizes moisture resistance and durability in humid conditions.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Metal prints provide moisture-resistant indoor display suitable for bathroom environments through aluminum substrate and dye-sublimation image infusion. The material withstands humidity exposure and simplifies cleaning. Alternative materials require protective measures such as sealed framing or surface coatings. Placement location affects moisture exposure levels and should be considered during installation planning.
            </p>
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
            headline: 'Best Wall Art for Bathrooms',
            description: 'Bathroom wall art must resist moisture and humidity exposure. Metal prints provide moisture-resistant indoor display suitable for bathroom environments. Paper and canvas prints require protective measures in humid conditions.',
            articleBody: 'Guide to selecting wall art for bathroom environments covering moisture challenges, metal prints characteristics, placement considerations, and alternative materials.',
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
