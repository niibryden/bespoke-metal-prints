import React from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface MetalPrintsVsCanvasPageProps {
  onClose: () => void;
}

export function MetalPrintsVsCanvasPage({ onClose }: MetalPrintsVsCanvasPageProps) {
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
            <h1 className="text-gray-900 dark:text-white">Metal Prints vs Canvas Prints</h1>
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
            Metal prints provide higher image sharpness and greater resistance to moisture than canvas prints. Canvas prints typically offer a textured surface and lower initial cost.
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

        {/* What Are Canvas Prints */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">What Are Canvas Prints</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Canvas prints are images printed on cotton or polyester fabric using inkjet printing technology. The printed fabric is then stretched over a wooden frame.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The fabric texture creates a traditional art appearance. Canvas prints are commonly used to replicate painted artworks or to provide a textured finish to photographs.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Canvas prints may require protective coatings to resist moisture and UV exposure. Expected lifespan varies based on ink type, coating, and display environment.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Comparison Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-gray-900 dark:text-white">Attribute</th>
                  <th className="px-6 py-4 text-left text-gray-900 dark:text-white">Metal Prints</th>
                  <th className="px-6 py-4 text-left text-gray-900 dark:text-white">Canvas Prints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Image Sharpness</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">High resolution with crisp detail</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Moderate resolution affected by fabric texture</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Surface Texture</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Smooth (gloss or matte finish)</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Textured fabric weave</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Moisture Resistance</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Moisture-resistant aluminum substrate</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Absorbent unless coated</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Fade Resistance</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">50–60+ years indoors (dye-sublimation)</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Varies by ink type (10–100+ years)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Expected Indoor Lifespan</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">50–60+ years</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">10–75+ years depending on materials</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Maintenance Requirements</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Wipe with damp cloth</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Dust with soft brush; avoid moisture</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Use Case Summary */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Use Case Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-4">Metal Prints</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Photography displays requiring high detail preservation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Bathrooms, kitchens, and humid indoor environments</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Modern interiors with clean aesthetic preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Commercial installations in high-traffic areas</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-4">Canvas Prints</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Traditional or classical interior design styles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Art reproductions with textured appearance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Budget-conscious projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Dry indoor environments with controlled lighting</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Summary</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Metal prints and canvas prints serve different display needs based on environment, aesthetic preference, and durability requirements.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Metal prints offer superior moisture resistance and image clarity. Canvas prints provide a textured surface and traditional art appearance. Selection depends on the intended display location and desired visual characteristics.
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
            headline: 'Metal Prints vs Canvas Prints',
            description: 'Metal prints provide higher image sharpness and greater resistance to moisture than canvas prints. Canvas prints typically offer a textured surface and lower initial cost.',
            articleBody: 'Comparison of metal prints and canvas prints covering image sharpness, surface texture, moisture resistance, fade resistance, expected indoor lifespan, and maintenance requirements.',
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
