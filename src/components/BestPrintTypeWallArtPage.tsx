import React from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

interface BestPrintTypeWallArtPageProps {
  onClose: () => void;
}

export function BestPrintTypeWallArtPage({ onClose }: BestPrintTypeWallArtPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-50 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Block */}
        <div className="bg-gradient-to-br from-[#ff6b35]/10 to-orange-100/20 dark:from-[#ff6b35]/20 dark:to-orange-900/10 rounded-2xl p-6 mb-8">
          <p className="text-gray-900 dark:text-white leading-relaxed">
            Print type selection for wall art depends on display environment, aesthetic goals, and maintenance preferences. Metal prints, canvas prints, paper prints, and acrylic prints each serve different functional requirements.
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

        {/* Print Types for Wall Art */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Print Types for Wall Art</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Metal Prints</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Metal prints provide moisture resistance and long lifespan. Suitable for modern interiors and humid environments.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
                <li>No protective framing required</li>
                <li>Lightweight and easy to mount</li>
                <li>Rated to last 50–60+ years indoors</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Canvas Prints</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Canvas prints offer textured fabric surface. Often used for traditional or artistic presentations.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
                <li>Textured appearance resembling painted art</li>
                <li>Frameless gallery-wrap option available</li>
                <li>Lower initial cost than metal or acrylic</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Paper Prints</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Paper prints provide traditional photographic presentation. Require framing for protection.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
                <li>Wide range of paper finishes available</li>
                <li>Lowest initial production cost</li>
                <li>Requires glass or acrylic framing</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Acrylic Prints</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Acrylic prints create depth and glass-like appearance. Higher weight and cost.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
                <li>Dimensional depth from acrylic layer</li>
                <li>High-gloss reflective surface</li>
                <li>Requires reinforced mounting hardware</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Selection Factors */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Selection Factors</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Consider the following factors when selecting a print type:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li><strong>Display location:</strong> Bathrooms and kitchens benefit from moisture-resistant materials</li>
              <li><strong>Interior style:</strong> Modern spaces may prefer metal; traditional spaces may prefer canvas or framed paper</li>
              <li><strong>Lighting conditions:</strong> High-gloss finishes reflect light; matte finishes reduce glare</li>
              <li><strong>Maintenance requirements:</strong> Metal prints require minimal cleaning; paper prints need protective framing</li>
              <li><strong>Budget:</strong> Initial cost varies significantly between print types</li>
              <li><strong>Expected lifespan:</strong> Long-term displays benefit from fade-resistant materials</li>
            </ul>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Summary</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Wall art print selection depends on multiple environmental and aesthetic factors.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Metal prints provide durability and moisture resistance for long-term indoor display. Canvas prints offer traditional textured appearance. Paper prints allow customizable framing. Acrylic prints create premium depth effects. Each option addresses different display requirements and design preferences.
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
            headline: 'Best Print Type for Wall Art',
            description: 'Print type selection for wall art depends on display environment, aesthetic goals, and maintenance preferences. Metal prints, canvas prints, paper prints, and acrylic prints each serve different functional requirements.',
            articleBody: 'Comprehensive guide to selecting print types for wall art including metal prints, canvas prints, paper prints, and acrylic prints with selection factors.',
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