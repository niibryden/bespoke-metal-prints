/**
 * Creates a thumbnail version of an image for storage
 * Reduces image size to a maximum of 200x200 pixels with quality reduction
 */
export async function createThumbnail(
  imageDataUrl: string,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw image with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to data URL with reduced quality
      try {
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(thumbnailDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Estimates the size of a base64 data URL in bytes
 */
export function estimateBase64Size(dataUrl: string): number {
  // Remove data URL prefix
  const base64String = dataUrl.split(',')[1] || dataUrl;
  
  // Base64 encoding increases size by ~33%, so actual bytes = (base64.length * 3) / 4
  const padding = (base64String.match(/=/g) || []).length;
  return (base64String.length * 3) / 4 - padding;
}

/**
 * Formats bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
