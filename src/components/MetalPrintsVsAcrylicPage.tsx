import React from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

interface MetalPrintsVsAcrylicPageProps {
  onClose: () => void;
}

export function MetalPrintsVsAcrylicPage({ onClose }: MetalPrintsVsAcrylicPageProps) {
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
            <h1 className="text-gray-900 dark:text-white">Metal Prints vs Acrylic Prints</h1>
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
        {/* Summary Block */}
        <div className="bg-gradient-to-br from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10 rounded-2xl p-6 mb-8">
          <p className="text-gray-900 dark:text-white leading-relaxed">
            Metal prints are lightweight and moisture-resistant. Acrylic prints provide depth and a glass-like appearance but are heavier and more fragile.
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

        {/* What Are Acrylic Prints */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">What Are Acrylic Prints</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Acrylic prints are photographs printed on paper or vinyl and mounted behind transparent acrylic sheeting. The print is sandwiched between the acrylic and a backing material.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The acrylic layer creates a glass-like surface with depth and reflectivity. Acrylic prints are also known as face-mounted prints or Plexiglass prints.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Acrylic thickness typically ranges from 1/8" to 1/4". Thicker acrylic provides increased depth but also adds weight and cost.
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
                  <th className="px-6 py-4 text-left text-gray-900 dark:text-white">Acrylic Prints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Image Depth</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Flat surface with no added depth</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Dimensional depth from acrylic layer</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Weight</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Lightweight aluminum substrate</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Heavy due to acrylic thickness</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Durability</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Scratch-resistant metal surface</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Susceptible to scratches and cracks</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Reflectivity</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Low to moderate (finish-dependent)</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">High gloss with glass-like reflections</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Moisture Resistance</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Moisture-resistant aluminum substrate</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Sealed edges resist moisture penetration</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Installation Complexity</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Simple mounting with included hardware</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Requires reinforced mounting due to weight</td>
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
                  <span>Lightweight installations in residential or commercial spaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>High-traffic areas where impact resistance is important</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Budget-conscious projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Frequent repositioning or temporary displays</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-4">Acrylic Prints</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Premium gallery displays with dimensional appearance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Corporate lobbies and high-end commercial installations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Art reproductions requiring depth and luminosity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Permanent installations with reinforced mounting</span>
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
              Metal prints and acrylic prints differ primarily in weight, depth appearance, and installation requirements.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Metal prints offer a lightweight, durable solution suitable for various environments. Acrylic prints provide a premium glass-like appearance with added dimensional depth at higher weight and cost. Selection depends on aesthetic goals, budget, and installation constraints.
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
            headline: 'Metal Prints vs Acrylic Prints',
            description: 'Metal prints are lightweight and moisture-resistant. Acrylic prints provide depth and a glass-like appearance but are heavier and more fragile.',
            articleBody: 'Comparison of metal prints and acrylic prints covering image depth, weight, durability, reflectivity, moisture resistance, and installation complexity.',
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