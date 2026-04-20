import React from 'react';
import { motion } from 'motion/react';
import { X, Check, Gift } from 'lucide-react';

interface BestPhotoPrintMaterialGiftsPageProps {
  onClose: () => void;
}

export function BestPhotoPrintMaterialGiftsPage({ onClose }: BestPhotoPrintMaterialGiftsPageProps) {
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
            Photo print gifts require materials that balance durability, presentation quality, and portability. Metal prints provide long lifespan and ready-to-display format. Canvas and paper prints offer traditional gift presentation.
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

        {/* Photo Print Materials for Gifts */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-[#ff6b35]" />
            <h2 className="text-2xl text-gray-900 dark:text-white">Photo Print Materials for Gifts</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Metal Prints</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Metal prints arrive ready to hang with mounting hardware included. No additional framing required.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Durable aluminum construction resists damage during shipping</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Moisture-resistant for display in any indoor room</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Long lifespan reduces need for replacement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Modern appearance suitable for contemporary homes</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Canvas Prints</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Canvas prints provide traditional art appearance. Lightweight and ready to hang.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Textured surface creates artistic presentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Lower cost than metal or acrylic options</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Gallery-wrap format eliminates framing needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Suitable for traditional home decor</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Paper Prints (Framed)</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Framed paper prints offer customizable presentation with matting and frame selection.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Frame style can match recipient's decor</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Matting adds elegant presentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Traditional gift format widely recognized</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Glass protection preserves print quality</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Gift-Giving Considerations */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Gift-Giving Considerations</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When selecting photo print materials for gifts, consider the following:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 list-disc">
              <li><strong>Recipient's home style:</strong> Modern homes may prefer metal; traditional homes may prefer canvas or framed paper</li>
              <li><strong>Shipping requirements:</strong> Durable materials reduce damage risk during transit</li>
              <li><strong>Installation ease:</strong> Ready-to-hang formats simplify recipient experience</li>
              <li><strong>Longevity:</strong> Long-lasting materials create enduring gift value</li>
              <li><strong>Budget:</strong> Material cost affects overall gift budget</li>
              <li><strong>Image content:</strong> High-detail photographs benefit from materials with sharp image reproduction</li>
            </ul>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Summary</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Photo print gifts benefit from materials that combine durability, presentation quality, and recipient convenience.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Metal prints provide ready-to-display format with long lifespan and modern appearance. Canvas prints offer traditional artistic presentation. Framed paper prints allow customizable styling. Material selection depends on recipient preferences, home decor style, and gift budget.
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
            headline: 'Best Photo Print Material for Gifts',
            description: 'Photo print gifts require materials that balance durability, presentation quality, and portability. Metal prints provide long lifespan and ready-to-display format. Canvas and paper prints offer traditional gift presentation.',
            articleBody: 'Guide to selecting photo print materials for gifts including metal prints, canvas prints, and framed paper prints with gift-giving considerations.',
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