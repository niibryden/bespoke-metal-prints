import officeImage from 'figma:asset/5200336f78fc246d11e145c8559b9f6ec3901ea2.png';
import bedroomImage from 'figma:asset/660fa4e9dac957905a2abdd453250c25fa2bbad2.png';

interface StockPhotosPreviewProps {
  onViewAll: () => void;
}

const GALLERY_PANELS = [
  {
    id: 1,
    image: bedroomImage,
    title: 'Bedroom Inspiration',
    subtitle: 'Transform your space'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZpbmclMjByb29tJTIwZGVjb3J8ZW58MXx8fHwxNzY1MDc2MjA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Living Room Art',
    subtitle: 'Elevate your decor'
  },
  {
    id: 3,
    image: officeImage,
    title: 'Office Gallery',
    subtitle: 'Inspire productivity'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600489000300-e590b381ce48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaW5pbmclMjByb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1MDc2MjA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dining Room Style',
    subtitle: 'Make every meal special'
  }
];

export function StockPhotosPreview({ onViewAll }: StockPhotosPreviewProps) {
  return (
    <section id="stock-photos" className="py-16 md:py-24 bg-gradient-to-b from-white via-orange-50/30 to-white dark:from-[#0a0a0a] dark:via-orange-900/5 dark:to-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-black dark:text-white">
            Be Inspired by Our Gallery
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Discover how premium metal prints transform any space
          </p>
        </div>

        {/* 4 Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 mb-12 max-w-[1800px] mx-auto">
          {GALLERY_PANELS.map((panel) => (
            <div
              key={panel.id}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-300"
              onClick={onViewAll}
            >
              {/* Background Image */}
              <img
                src={panel.image}
                alt={panel.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-7 text-center">
                <div>
                  <h3 className="text-white text-3xl md:text-4xl mb-3">
                    {panel.title}
                  </h3>
                  <p className="text-white/90 text-lg md:text-xl mb-4">
                    {panel.subtitle}
                  </p>
                  <div className="inline-flex items-center gap-2 px-7 py-3 bg-[#ff6b35] text-white rounded-full text-base transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span>Explore</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* Border Accent */}
              <div className="absolute inset-0 border-3 border-[#ff6b35]/0 group-hover:border-[#ff6b35]/50 rounded-2xl transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <button
            onClick={onViewAll}
            className="px-10 py-4 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all dark:text-black shadow-xl hover:shadow-2xl text-lg hover:scale-105 active:scale-95"
          >
            View All Stock Photos
          </button>
        </div>
      </div>
    </section>
  );
}