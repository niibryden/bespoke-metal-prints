import { Instagram, Facebook, MapPin, Mail, Globe, Phone } from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
  onMarketplaceClick?: () => void;
}

export function Footer({ onAdminClick, onMarketplaceClick }: FooterProps) {
  return (
    <footer id="contact" className="bg-white text-black py-8 md:py-12 border-t border-[#ff6b35]/20 dark:bg-black dark:text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          {/* Brand Info */}
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl mb-2 text-[#ff6b35]">Bespoke Metal Prints</h3>
            <p className="text-gray-600 text-sm md:text-base dark:text-gray-400">Pixel Print, Perfect</p>
            
            {/* Location Info */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs md:text-sm justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-[#ff6b35]" />
                <span>Kennesaw, Georgia</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs md:text-sm justify-center md:justify-start">
                <Globe className="w-4 h-4 text-[#ff6b35]" />
                <span>Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs md:text-sm justify-center md:justify-start">
                <Mail className="w-4 h-4 text-[#ff6b35]" />
                <a href="mailto:info@bespokemetalprints.com" className="hover:text-[#ff6b35] transition-colors">
                  info@bespokemetalprints.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs md:text-sm justify-center md:justify-start">
                <Phone className="w-4 h-4 text-[#ff6b35]" />
                <a href="tel:+18578582288" className="hover:text-[#ff6b35] transition-colors">
                  (857) 858-2288
                </a>
              </div>
            </div>
          </div>

          {/* Contact Links */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              🌐 <span className="font-semibold text-[#ff6b35]">Online Ordering 24/7</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              Premium HD Metal Prints
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            <a 
              href="https://www.tiktok.com/@bespokemetalprints" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
              aria-label="TikTok"
            >
              <svg 
                className="w-6 h-6" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/bespokemetalprints" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://www.facebook.com/bespokemetalprints" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#ff6b35]/20 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-600 text-xs md:text-sm dark:text-gray-400">
          {/* Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4 md:mb-6">
            <a 
              href="?page=terms-conditions" 
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
            >
              Terms & Conditions
            </a>
            <a 
              href="?page=refund-policy" 
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
            >
              Refund & Cancellation Policy
            </a>
            <a 
              href="?page=shipping-policy" 
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
            >
              Shipping Policy
            </a>
            <a 
              href="?page=privacy-policy"
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
            >
              Privacy Policy
            </a>
            <a 
              href="?page=metal-prints-explained" 
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
            >
              Metal Prints Explained
            </a>
            <a 
              href="?page=metal-prints-vs-canvas" 
              className="text-gray-600 hover:text-[#ff6b35] transition-colors dark:text-gray-400"
            >
              Metal Prints vs Canvas
            </a>
            {onMarketplaceClick && (
              <button
                onClick={onMarketplaceClick}
                className="text-[#ff6b35] hover:text-[#ff8555] transition-colors font-semibold"
              >
                Marketplace
              </button>
            )}
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="text-gray-500 hover:text-[#ff6b35] transition-colors opacity-50 hover:opacity-100"
              >
                Admin
              </button>
            )}
          </div>
          <p>&copy; 2025 Bespoke Metal Prints. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}