// Performance Monitoring Utilities for Bespoke Metal Prints

export interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  tti: number | null; // Time to Interactive
}

// Core Web Vitals thresholds (Google recommendations)
export const THRESHOLDS = {
  fcp: { good: 1800, needsImprovement: 3000 },
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  ttfb: { good: 800, needsImprovement: 1800 },
  tti: { good: 3500, needsImprovement: 5000 },
};

let metrics: PerformanceMetrics = {
  fcp: null,
  lcp: null,
  fid: null,
  cls: null,
  ttfb: null,
  tti: null,
};

// Measure First Contentful Paint
export function measureFCP(): void {
  try {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
      logMetric('FCP', metrics.fcp, THRESHOLDS.fcp);
    }
  } catch (error) {
    console.error('Error measuring FCP:', error);
  }
}

// Measure Largest Contentful Paint
export function measureLCP(): void {
  try {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = lastEntry.startTime;
        logMetric('LCP', metrics.lcp, THRESHOLDS.lcp);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  } catch (error) {
    console.error('Error measuring LCP:', error);
  }
}

// Measure First Input Delay
export function measureFID(): void {
  try {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.fid = entry.processingStart - entry.startTime;
          logMetric('FID', metrics.fid, THRESHOLDS.fid);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  } catch (error) {
    console.error('Error measuring FID:', error);
  }
}

// Measure Cumulative Layout Shift
export function measureCLS(): void {
  try {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            metrics.cls = clsValue;
          }
        }
        logMetric('CLS', metrics.cls, THRESHOLDS.cls);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  } catch (error) {
    console.error('Error measuring CLS:', error);
  }
}

// Measure Time to First Byte
export function measureTTFB(): void {
  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      logMetric('TTFB', metrics.ttfb, THRESHOLDS.ttfb);
    }
  } catch (error) {
    console.error('Error measuring TTFB:', error);
  }
}

// Measure Time to Interactive (approximation)
export function measureTTI(): void {
  try {
    // TTI is when the page is fully loaded and responsive
    // We approximate using load event + any long tasks
    window.addEventListener('load', () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        metrics.tti = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
        logMetric('TTI', metrics.tti, THRESHOLDS.tti);
      }
    });
  } catch (error) {
    console.error('Error measuring TTI:', error);
  }
}

// Log metric with visual indicator
function logMetric(
  name: string,
  value: number | null,
  threshold: { good: number; needsImprovement: number }
): void {
  if (value === null) return;
  
  let status = '🔴'; // Poor
  if (value <= threshold.good) {
    status = '🟢'; // Good
  } else if (value <= threshold.needsImprovement) {
    status = '🟡'; // Needs improvement
  }
  
  console.log(`${status} ${name}: ${Math.round(value)}ms`);
}

// Initialize all performance measurements
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;
  
  console.log('📊 Initializing performance monitoring...');
  
  measureTTFB();
  measureFCP();
  measureLCP();
  measureFID();
  measureCLS();
  measureTTI();
  
  // Report final metrics after page is fully loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('📊 Final Performance Metrics:', metrics);
      reportMetrics();
    }, 5000); // Wait 5 seconds after load for accurate measurements
  });
}

// Get current metrics
export function getMetrics(): PerformanceMetrics {
  return { ...metrics };
}

// Report metrics to analytics (placeholder)
function reportMetrics(): void {
  // In production, send to analytics service
  // For now, just log to console
  const summary = {
    fcp: metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A',
    lcp: metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A',
    fid: metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A',
    cls: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
    ttfb: metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A',
    tti: metrics.tti ? `${Math.round(metrics.tti)}ms` : 'N/A',
  };
  
  console.table(summary);
}

// Measure component render time
export function measureRenderTime(componentName: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) {
      // Longer than one frame (16.67ms)
      console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  };
}

// Measure API call time
export async function measureAPICall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ API ${name}: ${Math.round(duration)}ms`);
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow API call: ${name} took ${Math.round(duration)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`❌ API ${name} failed after ${Math.round(duration)}ms:`, error);
    throw error;
  }
}

// Check bundle size
export function checkBundleSize(): void {
  if (typeof window === 'undefined') return;
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  let imageSize = 0;
  
  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    totalSize += size;
    
    if (resource.name.endsWith('.js')) {
      jsSize += size;
    } else if (resource.name.endsWith('.css')) {
      cssSize += size;
    } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      imageSize += size;
    }
  });
  
  console.log('📦 Bundle Size Analysis:');
  console.log(`  Total: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`  JavaScript: ${(jsSize / 1024).toFixed(2)} KB`);
  console.log(`  CSS: ${(cssSize / 1024).toFixed(2)} KB`);
  console.log(`  Images: ${(imageSize / 1024).toFixed(2)} KB`);
  
  if (jsSize > 300 * 1024) {
    console.warn('⚠️ JavaScript bundle is large (>300KB). Consider code splitting.');
  }
}
