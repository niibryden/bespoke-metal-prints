// Optimization Tools - Quick access to all v4.0.0 features

import { initPerformanceMonitoring, getMetrics } from './performance';
import { runAllPerformanceTests } from './performance-test';
import { clearServiceWorkerCache } from './serviceWorker';
import { runBudgetCheck, displayBudgetResults, getPerformanceGrade } from './performance-budget';
import { initializePreloads, preloadImages, preloadAPI, clearPreloads } from './preload';

/**
 * Quick access to optimization tools via browser console
 * 
 * Usage in console:
 *   window.optimizationTools.testPerformance()
 *   window.optimizationTools.viewMetrics()
 *   window.optimizationTools.clearCache()
 */

export const optimizationTools = {
  /**
   * Run complete performance test suite
   */
  async testPerformance() {
    console.log('🧪 Running performance tests...');
    await runAllPerformanceTests();
  },

  /**
   * View current performance metrics
   */
  viewMetrics() {
    const metrics = getMetrics();
    console.log('📊 Current Performance Metrics:');
    console.table(metrics);
    return metrics;
  },

  /**
   * Clear service worker cache
   */
  async clearCache() {
    console.log('🧹 Clearing service worker cache...');
    await clearServiceWorkerCache();
    console.log('✅ Cache cleared successfully');
  },

  /**
   * Check current bundle size
   */
  checkBundleSize() {
    if (typeof window === 'undefined') {
      console.warn('⚠️ Bundle size analysis only available in browser');
      return;
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;

    resources.forEach((resource) => {
      totalSize += resource.transferSize || 0;
    });

    const sizeKB = (totalSize / 1024).toFixed(2);
    console.log(`📦 Total Bundle Size: ${sizeKB} KB`);

    if (totalSize > 300 * 1024) {
      console.warn('⚠️ Bundle is large (>300KB). Consider optimization.');
    } else {
      console.log('✅ Bundle size is good!');
    }

    return { totalSize, sizeKB };
  },

  /**
   * Monitor API performance
   */
  async testAPI(endpoint: string, headers?: Record<string, string>) {
    console.log(`⏱️ Testing ${endpoint}...`);
    const startTime = performance.now();

    try {
      const response = await fetch(endpoint, { headers });
      const data = await response.json();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const size = new Blob([JSON.stringify(data)]).size;
      const sizeKB = Math.round(size / 1024);

      console.log(`✅ ${endpoint}`);
      console.log(`  Duration: ${duration}ms`);
      console.log(`  Size: ${sizeKB} KB`);
      console.log(`  Status: ${response.status}`);

      return { duration, sizeKB, status: response.status, data };
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      console.error(`❌ ${endpoint} failed after ${duration}ms`);
      console.error(error);

      return { duration, error };
    }
  },

  /**
   * Get optimization status
   */
  getStatus() {
    const status = {
      serviceWorker: 'serviceWorker' in navigator,
      serviceWorkerActive: false,
      performanceAPI: 'performance' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      cacheAPI: 'caches' in window,
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        status.serviceWorkerActive = !!registration.active;
        console.log('📊 Optimization Status:');
        console.table(status);
      });
    } else {
      console.log('📊 Optimization Status:');
      console.table(status);
    }

    return status;
  },

  /**
   * Show performance tips
   */
  showTips() {
    console.log(`
🎯 Performance Optimization Tips:

1. Use OptimizedImage for all images
   import { OptimizedImage } from './components/OptimizedImage';

2. Implement virtual scrolling for long lists
   import { VirtualOrderList } from './components/admin/VirtualOrderList';

3. Enable service worker caching (already enabled)
   
4. Use React.memo for expensive components
   const MyComponent = memo(() => { ... });

5. Test performance regularly
   window.optimizationTools.testPerformance();

6. Monitor Core Web Vitals
   window.optimizationTools.viewMetrics();

7. Clear cache if issues persist
   window.optimizationTools.clearCache();
    `);
  },

  /**
   * Quick health check
   */
  async healthCheck() {
    console.log('🏥 Running health check...\n');

    // Check service worker
    const swStatus = 'serviceWorker' in navigator ? '✅' : '❌';
    console.log(`${swStatus} Service Worker Support`);

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const swActive = registration.active ? '✅' : '❌';
      console.log(`${swActive} Service Worker Active`);
    }

    // Check cache API
    const cacheStatus = 'caches' in window ? '✅' : '❌';
    console.log(`${cacheStatus} Cache API Support`);

    // Check performance API
    const perfStatus = 'performance' in window ? '✅' : '❌';
    console.log(`${perfStatus} Performance API Support`);

    // Check Intersection Observer
    const ioStatus = 'IntersectionObserver' in window ? '✅' : '❌';
    console.log(`${ioStatus} Intersection Observer Support`);

    // Check bundle size
    console.log('\n📦 Checking bundle size...');
    const { sizeKB } = this.checkBundleSize();
    const bundleStatus = parseFloat(sizeKB) < 300 ? '✅' : '⚠️';
    console.log(`${bundleStatus} Bundle Size: ${sizeKB} KB`);

    console.log('\n✅ Health check complete!');
  },

  /**
   * Check performance budget
   */
  async checkBudget() {
    console.log('💰 Checking performance budget...\n');
    
    const metrics = getMetrics();
    const results = await runBudgetCheck({
      checkBundle: true,
      checkVitals: true,
      vitalsMetrics: metrics,
    });
    
    displayBudgetResults(results);
    
    const grade = getPerformanceGrade(results);
    console.log(`\n🎓 Performance Grade: ${grade.grade} (${grade.score}%)`);
    console.log(`   ${grade.message}`);
    
    return { results, grade };
  },

  /**
   * Preload critical images
   */
  preloadImages(urls: string[]) {
    console.log(`📥 Preloading ${urls.length} images...`);
    preloadImages(urls);
    console.log('✅ Images queued for preload');
  },

  /**
   * Clear all preloads
   */
  clearPreloads() {
    console.log('🧹 Clearing preload hints...');
    clearPreloads();
    console.log('✅ Preloads cleared');
  },

  /**
   * Show all available commands
   */
  help() {
    console.log(`
🛠️ Available Optimization Tools:

window.optimizationTools.testPerformance()  - Run complete performance tests
window.optimizationTools.viewMetrics()      - View current performance metrics
window.optimizationTools.clearCache()       - Clear service worker cache
window.optimizationTools.checkBundleSize()  - Check current bundle size
window.optimizationTools.testAPI(url)       - Test API endpoint performance
window.optimizationTools.getStatus()        - Get optimization feature status
window.optimizationTools.showTips()         - Show performance tips
window.optimizationTools.healthCheck()      - Run complete health check
window.optimizationTools.checkBudget()      - Check performance budget
window.optimizationTools.preloadImages(urls)- Preload critical images
window.optimizationTools.clearPreloads()    - Clear all preloads
window.optimizationTools.help()             - Show this help message

Examples:
  window.optimizationTools.testAPI('https://api.example.com/orders')
  window.optimizationTools.healthCheck()
    `);
  },
};

// Make available globally in development
if (typeof window !== 'undefined') {
  (window as any).optimizationTools = optimizationTools;
  console.log('🛠️ Optimization tools loaded! Type window.optimizationTools.help() for commands');
}

export default optimizationTools;