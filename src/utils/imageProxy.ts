import { projectId } from './supabase/info';
import { getServerUrl } from './serverUrl';

/**
 * Proxies S3 images through our server to avoid CORS issues
 * Only proxies S3 URLs, returns other URLs unchanged
 */
export function getProxiedImageUrl(imageUrl: string): string {
  // Don't proxy blob URLs or data URLs
  if (!imageUrl || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // IMPORTANT: Don't proxy Unsplash URLs - they work directly with CORS
  if (imageUrl.includes('unsplash.com') || imageUrl.includes('images.unsplash')) {
    return imageUrl;
  }
  
  // Check if it's an S3 URL that we CAN proxy (our own buckets)
  if (imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com')) {
    // Proxy through our server
    const encodedUrl = encodeURIComponent(imageUrl);
    return `${getServerUrl()}/proxy-image?url=${encodedUrl}`;
  }
  
  // Return unchanged for other URLs
  return imageUrl;
}

/**
 * Loads an image with the proxy and converts to a data URL
 * This is useful for canvas operations that require same-origin images
 */
export async function loadImageAsDataUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Still set crossOrigin for safety
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    // Use the proxied URL
    img.src = getProxiedImageUrl(imageUrl);
  });
}