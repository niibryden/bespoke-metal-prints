import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object;
}

export function SEO({
  title = 'Bespoke Metal Prints - Premium Metal Art Printing',
  description = 'Transform your photos into stunning metal prints. Premium quality aluminum prints with vibrant colors, exceptional durability, and modern aesthetic. Custom sizes, professional finishes, and fast shipping.',
  keywords = 'metal prints, aluminum prints, photo prints, metal wall art, custom metal prints, high quality prints, professional photo printing, modern wall art, durable prints, metal photo prints',
  image = 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1200&h=630&fit=crop',
  url = 'https://bespokemetalprints.com',
  type = 'website',
  author = 'Bespoke Metal Prints',
  publishedTime,
  modifiedTime,
  structuredData,
}: SEOProps) {
  
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper to set or update meta tag
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);
    
    // Open Graph tags for social media
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', 'Bespoke Metal Prints', true);
    
    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);
    
    // Additional meta tags
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('language', 'English');
    setMetaTag('revisit-after', '7 days');
    setMetaTag('theme-color', '#ff6b35');
    
    // Article specific tags
    if (type === 'article' && publishedTime) {
      setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, true);
      }
      setMetaTag('article:author', author, true);
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = url;

    // Structured Data (JSON-LD)
    const defaultStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Bespoke Metal Prints',
      description: 'Premium metal print and aluminum print services for custom photo printing. Based in Kennesaw, Georgia with nationwide shipping.',
      url: 'https://bespokemetalprints.com',
      logo: 'https://bespokemetalprints.com/logo.png',
      image: image,
      priceRange: '$$',
      telephone: '+1-770-555-0123',
      email: 'info@bespokemetalprints.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '2851 Barrett Lakes Blvd NW',
        addressLocality: 'Kennesaw',
        addressRegion: 'GA',
        postalCode: '30144',
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '34.0234',
        longitude: '-84.6155'
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '00:00',
        closes: '23:59',
        description: 'Online ordering available 24/7'
      },
      sameAs: [
        'https://www.facebook.com/bespokemetalprints',
        'https://www.instagram.com/bespokemetalprints',
        'https://twitter.com/bespokemetalprints'
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '157'
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Metal Print Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'HD Metal Print - Gloss',
              description: 'High-quality metal prints on aluminum with glossy finish. Available in sizes from 5×7 to 40×30.'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'HD Metal Print - Matte',
              description: 'Premium metal prints with matte finish and enhanced durability. Perfect for professional displays.'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'Framed Metal Print',
              description: 'Metal prints with professional framing options: Black, Gold, or Natural Wood frames.'
            }
          }
        ]
      },
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: '34.0234',
          longitude: '-84.6155'
        },
        description: 'Serving Kennesaw, Marietta, Atlanta, and nationwide shipping across the United States'
      }
    };

    const jsonLdData = structuredData || defaultStructuredData;
    
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData);

  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, structuredData]);

  return null;
}

// Pre-defined SEO configurations for different pages
export const SEOConfig = {
  home: {
    title: 'Bespoke Metal Prints - Premium Metal Art Printing',
    description: 'Transform your photos into stunning metal prints. Premium quality aluminum prints with vibrant colors, exceptional durability, and modern aesthetic. Custom sizes, professional finishes, and fast shipping.',
    keywords: 'metal prints, aluminum prints, photo prints, metal wall art, custom metal prints, high quality prints, professional photo printing, modern wall art',
    url: 'https://bespokemetalprints.com',
  },
  
  configurator: {
    title: 'Create Your Metal Print - Custom Photo Printing | Bespoke Metal Prints',
    description: 'Design your perfect metal print with our easy configurator. Upload your photo, choose size and finish, preview your custom metal print. Professional quality guaranteed.',
    keywords: 'custom metal print, photo upload, metal print configurator, create metal print, design metal print, personalized metal art',
    url: 'https://bespokemetalprints.com/configurator',
  },
  
  stockPhotos: {
    title: 'Stock Photo Gallery - Metal Print Ready Images | Bespoke Metal Prints',
    description: 'Browse our curated collection of professional stock photos perfect for metal prints. Landscapes, abstracts, cityscapes, and more. High-resolution images ready to print.',
    keywords: 'stock photos, metal print photos, professional images, curated photography, landscape photos, abstract art, ready to print',
    url: 'https://bespokemetalprints.com/gallery',
  },
  
  tracking: {
    title: 'Track Your Order - Order Status | Bespoke Metal Prints',
    description: 'Track your metal print order status. Real-time shipping updates, estimated delivery, and order history. Stay informed about your custom metal print.',
    keywords: 'order tracking, shipping status, delivery tracking, order status, package tracking',
    url: 'https://bespokemetalprints.com/tracking',
  },
  
  shipping: {
    title: 'Shipping Policy - Fast & Safe Delivery | Bespoke Metal Prints',
    description: 'Our shipping policy ensures your metal prints arrive safely. Free shipping on orders over $100. Fast processing, secure packaging, tracking included.',
    keywords: 'shipping policy, delivery, free shipping, order delivery, shipping rates',
    url: 'https://bespokemetalprints.com/shipping-policy',
  },
  
  refund: {
    title: 'Refund Policy - 100% Satisfaction Guarantee | Bespoke Metal Prints',
    description: '30-day satisfaction guarantee on all metal prints. Easy returns, full refunds, no questions asked. Your satisfaction is our priority.',
    keywords: 'refund policy, return policy, satisfaction guarantee, money back guarantee',
    url: 'https://bespokemetalprints.com/refund-policy',
  },
  
  privacy: {
    title: 'Privacy Policy - Data Protection | Bespoke Metal Prints',
    description: 'Learn how we protect your privacy and personal information. Secure payment processing, data encryption, GDPR compliant.',
    keywords: 'privacy policy, data protection, GDPR, secure payment, privacy',
    url: 'https://bespokemetalprints.com/privacy-policy',
  },
  
  terms: {
    title: 'Terms & Conditions - Service Terms | Bespoke Metal Prints',
    description: 'Read our terms and conditions for using Bespoke Metal Prints services. Clear policies on orders, payments, shipping, and customer rights.',
    keywords: 'terms and conditions, service terms, user agreement, legal terms, terms of service',
    url: 'https://bespokemetalprints.com/terms-conditions',
  },
  
  products: {
    title: 'Metal Print Products & Pricing - HD Metal Print Aluminum Prints | Bespoke Metal Prints',
    description: 'Explore our premium HD Metal Print products. Custom sizes from 5"×7" to 40"×30", professional finishes (gloss & matte), frame options, and mounting solutions. Based in Kennesaw, GA with nationwide shipping.',
    keywords: 'metal print products, aluminum print pricing, HD Metal Print, metal print sizes, custom metal prints, metal print frames, float mount, 3D magnet mount, Kennesaw GA',
    url: 'https://bespokemetalprints.com/products',
  },
  
  account: {
    title: 'My Account - Order History & Tracking | Bespoke Metal Prints',
    description: 'Manage your metal print orders, view order history, track shipments, and download print-ready files. Access your Bespoke Metal Prints account.',
    keywords: 'order history, track order, my account, customer portal, order management',
    url: 'https://bespokemetalprints.com/account',
  },
  
  faq: {
    title: 'FAQ - Frequently Asked Questions | Bespoke Metal Prints',
    description: 'Common questions about metal prints, ChromaLuxe aluminum printing, shipping, sizing, and ordering. Get answers about custom metal wall art from Kennesaw, GA.',
    keywords: 'metal print FAQ, ChromaLuxe questions, metal print help, printing questions, custom metal prints guide',
    url: 'https://bespokemetalprints.com/faq',
  },
  
  about: {
    title: 'About Us - Premium Metal Prints from Kennesaw, GA | Bespoke Metal Prints',
    description: 'Learn about Bespoke Metal Prints - your local Kennesaw, Georgia source for premium ChromaLuxe metal prints. Quality craftsmanship, 24/7 online ordering, nationwide shipping.',
    keywords: 'about Bespoke Metal Prints, Kennesaw GA printer, local metal prints, ChromaLuxe Kennesaw, metal print company',
    url: 'https://bespokemetalprints.com/about',
  },
  
  sizeGuide: {
    title: 'Metal Print Size Guide - Choose the Perfect Size | Bespoke Metal Prints',
    description: 'Complete guide to choosing metal print sizes. Room recommendations, wall space tips, and sizing advice for 5×7 to 40×30 prints. Based in Kennesaw, GA.',
    keywords: 'metal print sizes, metal print size guide, what size metal print, metal print dimensions, how to choose metal print size, gallery wall sizes, metal print room guide',
    url: 'https://bespokemetalprints.com/size-guide',
  },
  
  hDMetalPrintGuide: {
    title: 'What are HD Metal Prints? Metal Print Technology Guide | Bespoke Metal Prints',
    description: 'Learn about HD Metal Print dye-sublimation technology. Understand why HD Metal Prints last 75+ years and outperform canvas and paper prints.',
    keywords: 'HD Metal Print, what is HD Metal Print, dye sublimation, metal print technology, HD Metal Print vs canvas, aluminum print process, metal print durability',
    url: 'https://bespokemetalprints.com/hd-metal-print-guide',
  },
  
  careInstructions: {
    title: 'Metal Print Care Instructions - Cleaning & Maintenance | Bespoke Metal Prints',
    description: 'Simple care guide for HD Metal Prints. Learn how to clean, maintain, and protect your metal prints for 75+ years of vibrancy.',
    keywords: 'metal print care, how to clean metal prints, metal print maintenance, HD Metal Print cleaning, metal print durability, aluminum print care',
    url: 'https://bespokemetalprints.com/care-instructions',
  },
  
  reviews: {
    title: 'Customer Reviews - 4.9 Star Metal Prints | Bespoke Metal Prints',
    description: 'Read 157+ verified customer reviews of our HD Metal Prints. Real feedback from Georgia customers. 4.9-star rating, 99% would recommend.',
    keywords: 'metal print reviews, HD Metal Print reviews, customer testimonials, metal prints Kennesaw reviews, are metal prints worth it, verified reviews',
    url: 'https://bespokemetalprints.com/reviews',
  },

  metalPrintsExplained: {
    title: 'Metal Prints Explained: Sizes, Finishes, Durability, and Use Cases | Bespoke Metal Prints',
    description: 'Metal prints are photographs infused directly into aluminum panels using a dye-sublimation printing process. Rated to last 50–60+ years indoors.',
    keywords: 'metal prints explained, what are metal prints, ChromaLuxe, aluminum panels, dye-sublimation, metal print durability, metal print finishes, metal print sizes',
    url: 'https://bespokemetalprints.com/metal-prints-explained',
  },

  metalPrintsVsCanvas: {
    title: 'Metal Prints vs Canvas Prints - Comparison Guide | Bespoke Metal Prints',
    description: 'Metal prints provide higher image sharpness and greater resistance to moisture than canvas prints. Canvas prints typically offer a textured surface and lower initial cost.',
    keywords: 'metal prints vs canvas, canvas vs metal, print comparison, metal or canvas, best print type, aluminum vs canvas prints',
    url: 'https://bespokemetalprints.com/metal-prints-vs-canvas',
  },

  metalPrintsVsAcrylic: {
    title: 'Metal Prints vs Acrylic Prints - Comparison Guide | Bespoke Metal Prints',
    description: 'Metal prints are lightweight and moisture-resistant. Acrylic prints provide depth and a glass-like appearance but are heavier and more fragile.',
    keywords: 'metal prints vs acrylic, acrylic vs metal, print comparison, metal or acrylic, aluminum vs acrylic prints',
    url: 'https://bespokemetalprints.com/metal-prints-vs-acrylic',
  },

  metalPrintsVsPaper: {
    title: 'Metal Prints vs Paper Prints - Comparison Guide | Bespoke Metal Prints',
    description: 'Metal prints provide longer lifespan and superior moisture resistance compared to paper prints. Paper prints offer lower cost and traditional photographic appearance.',
    keywords: 'metal prints vs paper, paper vs metal, print comparison, metal or paper, aluminum vs paper prints',
    url: 'https://bespokemetalprints.com/metal-prints-vs-paper',
  },

  bestPrintTypeWallArt: {
    title: 'Best Print Type for Wall Art - Selection Guide | Bespoke Metal Prints',
    description: 'Print type selection for wall art depends on display environment, aesthetic goals, and maintenance preferences. Metal prints, canvas prints, paper prints, and acrylic prints each serve different functional requirements.',
    keywords: 'best print type for wall art, wall art materials, metal vs canvas vs paper, best wall art prints, photo print selection',
    url: 'https://bespokemetalprints.com/best-print-type-for-wall-art',
  },

  bestPhotoPrintMaterialGifts: {
    title: 'Best Photo Print Material for Gifts - Selection Guide | Bespoke Metal Prints',
    description: 'Photo print gifts require materials that balance durability, presentation quality, and portability. Metal prints provide long lifespan and ready-to-display format.',
    keywords: 'best photo print for gifts, photo gift materials, metal print gifts, canvas vs metal gifts, best gift prints',
    url: 'https://bespokemetalprints.com/best-photo-print-material-for-gifts',
  },

  bestWallArtOffices: {
    title: 'Best Wall Art for Offices - Selection Guide | Bespoke Metal Prints',
    description: 'Office wall art requires durability, low maintenance, and professional appearance. Metal prints provide these characteristics along with resistance to environmental factors common in commercial buildings.',
    keywords: 'best wall art for offices, office wall art, commercial wall art, metal prints for offices, professional wall decor',
    url: 'https://bespokemetalprints.com/best-wall-art-for-offices',
  },

  bestWallArtBathrooms: {
    title: 'Best Wall Art for Bathrooms - Selection Guide | Bespoke Metal Prints',
    description: 'Bathroom wall art must resist moisture and humidity exposure. Metal prints provide moisture-resistant indoor display suitable for bathroom environments.',
    keywords: 'best wall art for bathrooms, bathroom wall art, moisture-resistant wall art, metal prints for bathrooms, bathroom decor',
    url: 'https://bespokemetalprints.com/best-wall-art-for-bathrooms',
  },
};

// Product structured data generator
export const generateProductSchema = (product: {
  name: string;
  description: string;
  price: number;
  image: string;
  sku?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  sku: product.sku || 'METAL-PRINT-001',
  brand: {
    '@type': 'Brand',
    name: 'Bespoke Metal Prints'
  },
  offers: {
    '@type': 'Offer',
    url: 'https://bespokemetalprints.com/configurator',
    priceCurrency: 'USD',
    price: product.price,
    priceValidUntil: '2025-12-31',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: 'Bespoke Metal Prints'
    }
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '157'
  }
});