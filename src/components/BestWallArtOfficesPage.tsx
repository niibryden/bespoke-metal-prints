import React from 'react';
import { motion } from 'motion/react';
import { X, Check, Briefcase } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface BestWallArtOfficesPageProps {
  onClose: () => void;
}

export function BestWallArtOfficesPage({ onClose }: BestWallArtOfficesPageProps) {
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
            <h1 className="text-gray-900 dark:text-white">Best Wall Art for Offices</h1>
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
            Office wall art requires durability, low maintenance, and professional appearance. Metal prints provide these characteristics along with resistance to environmental factors common in commercial buildings.
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

        {/* Office Environment Requirements */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-[#ff6b35]" />
            <h2 className="text-2xl text-gray-900 dark:text-white">Office Environment Requirements</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Commercial office environments present specific requirements for wall art:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li><strong>Durability:</strong> High-traffic areas require impact-resistant materials</li>
              <li><strong>Maintenance:</strong> Minimal cleaning requirements reduce facility management costs</li>
              <li><strong>Lifespan:</strong> Long-lasting displays avoid frequent replacement</li>
              <li><strong>Professional appearance:</strong> Clean, modern aesthetic maintains business environment</li>
              <li><strong>Installation efficiency:</strong> Easy mounting reduces installation time and labor costs</li>
              <li><strong>Environmental resistance:</strong> Materials must withstand HVAC fluctuations and cleaning protocols</li>
            </ul>
          </div>
        </section>

        {/* Metal Prints for Office Spaces */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Metal Prints for Office Spaces</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Metal prints address office environment requirements through the following characteristics:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Scratch-resistant surface:</strong> Aluminum substrate resists minor impacts and abrasion</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Simple cleaning:</strong> Wipe with damp cloth; compatible with standard cleaning solutions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>No protective framing required:</strong> Reduces installation cost and complexity</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Lightweight construction:</strong> Simplifies mounting on standard office walls</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Moisture-resistant:</strong> Suitable for conference rooms, break rooms, and restroom areas</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span><strong>Modern aesthetic:</strong> Clean appearance matches contemporary office design</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Office Space Types */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Office Space Types</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Reception Areas and Lobbies</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Metal prints create professional first impression. Large-format prints establish brand identity. Moisture resistance accommodates climate control variations.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Conference Rooms</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Metal prints provide clean appearance without glass glare. Matte finish reduces reflection during presentations. Easy cleaning maintains professional environment.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Hallways and Common Areas</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Durability withstands high-traffic conditions. Lightweight mounting reduces wall reinforcement needs. Consistent appearance across multiple installations.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Individual Offices</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Metal prints personalize workspace without framing bulk. Simple repositioning allows office reconfiguration. Long lifespan accommodates extended occupancy.
              </p>
            </div>
          </div>
        </section>

        {/* Alternative Options */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Alternative Options</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Other wall art materials for offices include:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li><strong>Framed paper prints:</strong> Traditional appearance; requires protective glass and regular dusting</li>
              <li><strong>Canvas prints:</strong> Textured surface; less impact-resistant than metal</li>
              <li><strong>Acrylic prints:</strong> Premium appearance; higher weight requires reinforced mounting</li>
            </ul>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Summary</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Office wall art selection prioritizes durability, maintenance efficiency, and professional appearance.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Metal prints address commercial environment requirements through scratch resistance, simple cleaning, and long lifespan. The frameless format and moisture resistance make metal prints suitable for various office spaces including reception areas, conference rooms, hallways, and individual offices. Alternative materials may be selected based on specific aesthetic or budget requirements.
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
            headline: 'Best Wall Art for Offices',
            description: 'Office wall art requires durability, low maintenance, and professional appearance. Metal prints provide these characteristics along with resistance to environmental factors common in commercial buildings.',
            articleBody: 'Guide to selecting wall art for office environments covering durability requirements, metal prints characteristics, and suitability for different office space types.',
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
