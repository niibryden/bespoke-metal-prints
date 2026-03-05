// Performance Testing Utilities for Bespoke Metal Prints

import { projectId, publicAnonKey } from './supabase/info';
import { getServerUrl } from './serverUrl';

export async function testAPIPerformance(): Promise<void> {
  console.log('🧪 Starting API Performance Tests...\n');
  
  const results: any[] = [];
  
  // Test 1: Admin Orders Endpoint (20 orders)
  const test1 = await measureEndpoint(
    'GET /admin/orders?limit=20',
    `${getServerUrl()}/admin/orders?limit=20`,
    { 'Authorization': `Bearer ${publicAnonKey}` }
  );
  results.push(test1);
  
  // Test 2: Admin Orders Endpoint (100 orders) - Legacy
  const test2 = await measureEndpoint(
    'GET /admin/orders?limit=100',
    `${getServerUrl()}/admin/orders?limit=100`,
    { 'Authorization': `Bearer ${publicAnonKey}` }
  );
  results.push(test2);
  
  // Test 3: Inventory Endpoint
  const test3 = await measureEndpoint(
    'GET /admin/inventory',
    `${getServerUrl()}/admin/inventory`,
    { 'Authorization': `Bearer ${publicAnonKey}` }
  );
  results.push(test3);
  
  // Test 4: Stats Endpoint
  const test4 = await measureEndpoint(
    'GET /admin/stats',
    `${getServerUrl()}/admin/stats`,
    { 'Authorization': `Bearer ${publicAnonKey}` }
  );
  results.push(test4);
  
  // Print results table
  console.log('\n📊 Performance Test Results:\n');
  console.table(results);
  
  // Check if any endpoint is slow
  const slowEndpoints = results.filter(r => r.duration > 2000);
  if (slowEndpoints.length > 0) {
    console.warn('\n⚠️ Slow Endpoints (>2s):');
    slowEndpoints.forEach(e => {
      console.warn(`  ${e.endpoint}: ${e.duration}ms`);
    });
  }
  
  // Calculate average
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  console.log(`\n📈 Average Response Time: ${Math.round(avgDuration)}ms`);
  
  // Performance grade
  if (avgDuration < 500) {
    console.log('🟢 Performance Grade: A (Excellent)');
  } else if (avgDuration < 1000) {
    console.log('🟡 Performance Grade: B (Good)');
  } else if (avgDuration < 2000) {
    console.log('🟠 Performance Grade: C (Acceptable)');
  } else {
    console.log('🔴 Performance Grade: D (Needs Improvement)');
  }
}

async function measureEndpoint(
  name: string,
  url: string,
  headers: Record<string, string>
): Promise<{ endpoint: string; duration: number; status: number; size: number }> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    const size = new Blob([JSON.stringify(data)]).size;
    const sizeKB = Math.round(size / 1024);
    
    console.log(`${getStatusIcon(duration)} ${name}: ${duration}ms (${sizeKB} KB)`);
    
    return {
      endpoint: name,
      duration,
      status: response.status,
      size: sizeKB,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    console.error(`❌ ${name}: FAILED after ${duration}ms`);
    
    return {
      endpoint: name,
      duration,
      status: 0,
      size: 0,
    };
  }
}

function getStatusIcon(duration: number): string {
  if (duration < 500) return '🟢';
  if (duration < 1000) return '🟡';
  if (duration < 2000) return '🟠';
  return '🔴';
}

// Test frontend bundle size
export async function testBundleSize(): Promise<void> {
  console.log('📦 Analyzing Bundle Size...\n');
  
  if (typeof window === 'undefined') {
    console.warn('⚠️ Bundle size analysis only available in browser');
    return;
  }
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const categorized = {
    javascript: { count: 0, size: 0 },
    css: { count: 0, size: 0 },
    images: { count: 0, size: 0 },
    fonts: { count: 0, size: 0 },
    other: { count: 0, size: 0 },
  };
  
  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    
    if (resource.name.endsWith('.js')) {
      categorized.javascript.count++;
      categorized.javascript.size += size;
    } else if (resource.name.endsWith('.css')) {
      categorized.css.count++;
      categorized.css.size += size;
    } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      categorized.images.count++;
      categorized.images.size += size;
    } else if (resource.name.match(/\.(woff|woff2|ttf|eot)$/i)) {
      categorized.fonts.count++;
      categorized.fonts.size += size;
    } else {
      categorized.other.count++;
      categorized.other.size += size;
    }
  });
  
  const totalSize = Object.values(categorized).reduce((sum, cat) => sum + cat.size, 0);
  
  console.table({
    JavaScript: {
      files: categorized.javascript.count,
      size: `${(categorized.javascript.size / 1024).toFixed(2)} KB`,
      percent: `${((categorized.javascript.size / totalSize) * 100).toFixed(1)}%`,
    },
    CSS: {
      files: categorized.css.count,
      size: `${(categorized.css.size / 1024).toFixed(2)} KB`,
      percent: `${((categorized.css.size / totalSize) * 100).toFixed(1)}%`,
    },
    Images: {
      files: categorized.images.count,
      size: `${(categorized.images.size / 1024).toFixed(2)} KB`,
      percent: `${((categorized.images.size / totalSize) * 100).toFixed(1)}%`,
    },
    Fonts: {
      files: categorized.fonts.count,
      size: `${(categorized.fonts.size / 1024).toFixed(2)} KB`,
      percent: `${((categorized.fonts.size / totalSize) * 100).toFixed(1)}%`,
    },
    Other: {
      files: categorized.other.count,
      size: `${(categorized.other.size / 1024).toFixed(2)} KB`,
      percent: `${((categorized.other.size / totalSize) * 100).toFixed(1)}%`,
    },
    TOTAL: {
      files: resources.length,
      size: `${(totalSize / 1024).toFixed(2)} KB`,
      percent: '100%',
    },
  });
  
  // Warnings
  if (categorized.javascript.size > 300 * 1024) {
    console.warn('⚠️ JavaScript bundle is large (>300KB). Consider code splitting.');
  }
  if (categorized.images.size > 1024 * 1024) {
    console.warn('⚠️ Images are large (>1MB). Consider image optimization.');
  }
  
  console.log(`\n📊 Total Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
}

// Run all tests
export async function runAllPerformanceTests(): Promise<void> {
  console.log('🚀 Running Complete Performance Test Suite\n');
  console.log('='.repeat(60));
  
  await testAPIPerformance();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testBundleSize();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Performance tests complete!');
}
