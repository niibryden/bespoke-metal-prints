import React from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

interface MetalPrintsVsPaperPageProps {
  onClose: () => void;
}

export function MetalPrintsVsPaperPage({ onClose }: MetalPrintsVsPaperPageProps) {
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
            <h1 className="text-gray-900 dark:text-white">Metal Prints vs Paper Prints</h1>
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
            Metal prints provide longer lifespan and superior moisture resistance compared to paper prints. Paper prints offer lower cost and traditional photographic appearance.
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

        {/* What Are Paper Prints */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">What Are Paper Prints</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Paper prints are photographs printed on photographic paper using inkjet or chemical development processes. Paper prints have been the standard medium for photography since the late 19th century.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Paper types include glossy, matte, satin, and metallic finishes. Archival-quality paper combined with pigment-based inks can extend print lifespan significantly.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Paper prints are typically framed behind glass for protection from moisture, UV exposure, and physical contact.
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
                  <th className="px-6 py-4 text-left text-gray-900 dark:text-white">Paper Prints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Substrate Material</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Aluminum panel</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Cellulose-based or resin-coated paper</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Moisture Resistance</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Moisture-resistant aluminum substrate</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Highly absorbent; requires protective framing</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Expected Indoor Lifespan</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">50–60+ years</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">10–200+ years (varies by ink and paper quality)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Framing Requirements</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">No protective framing required</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Glass or acrylic framing recommended</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Initial Cost</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Moderate to high</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Low to moderate (excluding frame)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Rigidity</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Rigid aluminum substrate</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Flexible; may require backing board</td>
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
                  <span>Long-term indoor display without protective framing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Humid environments such as kitchens and bathrooms</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Modern interior designs requiring frameless appearance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Commercial installations with minimal maintenance needs</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-4">Paper Prints</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Traditional framed photography displays</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Portfolio prints for photographers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Budget-conscious projects with lower initial cost</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Archival storage and matted presentations</span>
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
              Metal prints and paper prints represent different approaches to photographic display with distinct cost, durability, and presentation characteristics.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Metal prints eliminate the need for protective framing and provide long-term durability. Paper prints offer traditional presentation methods and lower initial cost but require framing for protection. Selection depends on budget, display environment, and aesthetic preferences.
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
            headline: 'Metal Prints vs Paper Prints',
            description: 'Metal prints provide longer lifespan and superior moisture resistance compared to paper prints. Paper prints offer lower cost and traditional photographic appearance.',
            articleBody: 'Comparison of metal prints and paper prints covering substrate material, moisture resistance, expected indoor lifespan, framing requirements, initial cost, and rigidity.',
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