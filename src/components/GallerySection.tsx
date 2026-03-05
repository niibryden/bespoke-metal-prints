import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const galleryImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1603826779844-2f4e66bd270c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2MjU3NDY0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Mountain Vista',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1546840557-d51868891957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzJTIwYWVyaWFsfGVufDF8fHx8MTc2MjUwMDY0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Ocean Waves',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1615406020658-6c4b805f1f30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBtb2Rlcm58ZW58MXx8fHwxNzYyNDg0Nzc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Modern Architecture',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1729011373667-cc344d939de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjI1MjYzMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Autumn Forest',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1736265024403-01663c4862d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMHByaW50fGVufDF8fHx8MTc2MjU0NDk4MXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Abstract Art',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1617363127851-7c89223b92cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaW50ZXJpb3IlMjBhcnR8ZW58MXx8fHwxNzYyNTc0NjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Minimalist Interior',
  },
];

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-white">Stock Photos</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our collection of photography and digital art. We offer a curated collection of images to choose from. Create high quality HD Metal Print.
          </p>
        </motion.div>

        {/* Upload Option */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="border-2 border-dashed border-[#ff6b35]/50 rounded-2xl p-12 text-center hover:border-[#ff6b35] transition-colors cursor-pointer bg-[#1a1a1a]">
            <Upload className="w-12 h-12 mx-auto mb-4 text-[#ff6b35]" />
            <h3 className="text-2xl mb-2 text-white">Upload Your Own Image</h3>
            <p className="text-gray-400">Drag and drop or click to browse</p>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <div>
          <h3 className="text-2xl mb-8 text-center text-gray-400">Or Choose from Our Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-[4/3] border border-[#ff6b35]/20"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setHoveredId(image.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => setSelectedImage(image)}
              >
                <ImageWithFallback
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-[#ff6b35]/70 via-black/20 to-transparent transition-opacity duration-300 ${
                    hoveredId === image.id ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Mock wall preview on hover */}
                {hoveredId === image.id && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-[#ff6b35] text-black px-6 py-3 rounded-full">
                      <p className="text-sm">Preview on Wall</p>
                    </div>
                  </motion.div>
                )}

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white">{image.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 p-6 dark:bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-4xl w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute -top-12 right-0 text-white hover:text-[#ff6b35] transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-8 h-8" />
              </button>

              {/* Mock wall with image */}
              <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-[#ff6b35]/30">
                <div className="relative">
                  <ImageWithFallback
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl mb-2 text-white">{selectedImage.title}</h3>
                    <button className="px-8 py-3 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-colors dark:text-black">
                      Use This Image
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}