// Service Worker Registration Utility

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Only register in production and if service workers are supported
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    window.location.hostname === 'localhost'
  ) {
    console.log('[SW] Service worker not supported or in development mode');
    return Promise.resolve(null);
  }

  return window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('[SW] Service worker registered:', registration.scope);

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New version available, refreshing...');
            
            // Notify user about update
            if (confirm('A new version is available. Refresh to update?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
      return null;
    }
  }) as any;
}

export function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.unregister();
    })
    .catch((error) => {
      console.error('[SW] Unregister failed:', error);
      return false;
    });
}

export async function clearServiceWorkerCache(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const sw = registration.active;

    if (sw) {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('[SW] Cache cleared successfully');
            resolve();
          } else {
            reject(new Error('Failed to clear cache'));
          }
        };

        sw.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    }
  } catch (error) {
    console.error('[SW] Failed to clear cache:', error);
  }
}

// Prefetch important URLs
export async function prefetchUrls(urls: string[]): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open('prefetch-v1');
    await Promise.all(
      urls.map((url) =>
        fetch(url)
          .then((response) => {
            if (response.ok) {
              cache.put(url, response);
            }
          })
          .catch((err) => console.warn('[SW] Prefetch failed for:', url, err))
      )
    );
    console.log('[SW] Prefetched', urls.length, 'URLs');
  } catch (error) {
    console.error('[SW] Prefetch error:', error);
  }
}
