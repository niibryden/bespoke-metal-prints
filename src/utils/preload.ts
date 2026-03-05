/**
 * Resource preloading utilities for critical assets
 * Helps improve performance by loading resources before they're needed
 */

interface PreloadOptions {
  as: 'script' | 'style' | 'image' | 'font' | 'fetch';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  importance?: 'high' | 'low' | 'auto';
}

/**
 * Preload a critical resource
 */
export function preloadResource(href: string, options: PreloadOptions): void {
  if (typeof document === 'undefined') return;

  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = options.as;

  if (options.type) {
    link.type = options.type;
  }

  if (options.crossOrigin) {
    link.crossOrigin = options.crossOrigin;
  }

  if (options.importance) {
    (link as any).importance = options.importance;
  }

  document.head.appendChild(link);
}

/**
 * Prefetch a resource that might be needed soon
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  // Check if already prefetched
  const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;

  document.head.appendChild(link);
}

/**
 * Preconnect to an origin to establish early connection
 */
export function preconnect(origin: string, crossOrigin?: boolean): void {
  if (typeof document === 'undefined') return;

  // Check if already preconnected
  const existing = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;

  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * DNS prefetch for an origin
 */
export function dnsPrefetch(origin: string): void {
  if (typeof document === 'undefined') return;

  const existing = document.querySelector(`link[rel="dns-prefetch"][href="${origin}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = origin;

  document.head.appendChild(link);
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    preloadResource(url, {
      as: 'image',
      importance: 'high',
    });
  });
}

/**
 * Preload fonts
 */
export function preloadFonts(urls: string[]): void {
  urls.forEach((url) => {
    preloadResource(url, {
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
      importance: 'high',
    });
  });
}

/**
 * Preload stylesheets
 */
export function preloadStyles(urls: string[]): void {
  urls.forEach((url) => {
    preloadResource(url, {
      as: 'style',
      importance: 'high',
    });
  });
}

/**
 * Preload scripts
 */
export function preloadScripts(urls: string[]): void {
  urls.forEach((url) => {
    preloadResource(url, {
      as: 'script',
      importance: 'high',
    });
  });
}

/**
 * Preload API endpoints (data prefetching)
 */
export function preloadAPI(urls: string[]): void {
  urls.forEach((url) => {
    preloadResource(url, {
      as: 'fetch',
      crossOrigin: 'anonymous',
    });
  });
}

/**
 * Smart preload for next likely page
 */
export function preloadNextPage(page: string): void {
  const routes: Record<string, string[]> = {
    home: ['/styles/globals.css'],
    configurator: ['/styles/globals.css'],
    collections: ['/styles/globals.css'],
    admin: ['/styles/globals.css'],
  };

  const resources = routes[page] || [];
  resources.forEach((resource) => {
    prefetchResource(resource);
  });
}

/**
 * Preload critical resources for current page
 */
export function preloadCriticalResources(page: string): void {
  // Always preload global styles
  preloadStyles(['/styles/globals.css']);

  // Page-specific preloads
  switch (page) {
    case 'home':
      // Preconnect to image CDN
      preconnect('https://images.unsplash.com', true);
      dnsPrefetch('https://images.unsplash.com');
      break;

    case 'configurator':
      // Preconnect to Supabase
      preconnect('https://supabase.co', true);
      break;

    case 'collections':
      // Preconnect to image sources
      preconnect('https://images.unsplash.com', true);
      break;

    case 'admin':
      // Preconnect to API
      const projectId = import.meta.env?.VITE_SUPABASE_PROJECT_ID;
      if (projectId) {
        preconnect(`https://${projectId}.supabase.co`, true);
      }
      break;
  }
}

/**
 * Lazy load non-critical images using Intersection Observer
 */
export function lazyLoadImages(selector: string = 'img[data-src]'): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const images = document.querySelectorAll(selector);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  images.forEach((img) => observer.observe(img));
}

/**
 * Prefetch on hover (for better perceived performance)
 */
export function setupHoverPrefetch(selector: string, getUrl: (element: HTMLElement) => string): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('mouseover', (e) => {
    const target = (e.target as HTMLElement).closest(selector);
    if (target) {
      const url = getUrl(target as HTMLElement);
      if (url) {
        prefetchResource(url);
      }
    }
  });
}

/**
 * Initialize all critical preloads
 */
export function initializePreloads(currentPage: string): void {
  console.log(`🚀 Preloading critical resources for: ${currentPage}`);

  // Preload critical resources for current page
  preloadCriticalResources(currentPage);

  // Setup lazy loading for images
  lazyLoadImages();

  // Prefetch likely next pages based on current page
  const nextPages: Record<string, string> = {
    home: 'configurator',
    configurator: 'checkout',
    collections: 'configurator',
  };

  const nextPage = nextPages[currentPage];
  if (nextPage) {
    setTimeout(() => {
      preloadNextPage(nextPage);
    }, 2000); // Prefetch after 2 seconds
  }
}

/**
 * Measure preload effectiveness
 */
export function measurePreloadEffectiveness(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        const isPreloaded = resourceEntry.initiatorType === 'link';

        if (isPreloaded) {
          console.log(
            `⚡ Preloaded: ${entry.name} (${Math.round(resourceEntry.duration)}ms)`
          );
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}

/**
 * Clear all preload/prefetch links
 */
export function clearPreloads(): void {
  if (typeof document === 'undefined') return;

  const links = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]');
  links.forEach((link) => link.remove());
}
