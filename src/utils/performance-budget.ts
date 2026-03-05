/**
 * Performance Budget Checker
 * Ensures the app stays within performance targets
 */

export interface PerformanceBudget {
  maxBundleSize: number; // KB
  maxImageSize: number; // KB per image
  maxTotalImages: number; // KB
  maxFonts: number; // KB
  maxCSS: number; // KB
  maxJS: number; // KB
  maxFCP: number; // ms
  maxLCP: number; // ms
  maxTTI: number; // ms
  maxCLS: number; // score
  maxAPIResponse: number; // ms
}

// Default performance budgets for Bespoke Metal Prints
export const DEFAULT_BUDGET: PerformanceBudget = {
  maxBundleSize: 500, // 500 KB total
  maxImageSize: 200, // 200 KB per image
  maxTotalImages: 2000, // 2 MB total images
  maxFonts: 100, // 100 KB fonts
  maxCSS: 50, // 50 KB CSS
  maxJS: 300, // 300 KB JavaScript
  maxFCP: 1500, // 1.5s First Contentful Paint
  maxLCP: 2500, // 2.5s Largest Contentful Paint
  maxTTI: 3500, // 3.5s Time to Interactive
  maxCLS: 0.1, // 0.1 Cumulative Layout Shift
  maxAPIResponse: 1000, // 1s API response
};

export interface BudgetResult {
  passed: boolean;
  category: string;
  metric: string;
  current: number;
  budget: number;
  unit: string;
  percentage: number;
  status: 'pass' | 'warning' | 'fail';
}

/**
 * Check if bundle size is within budget
 */
export function checkBundleSize(budget: PerformanceBudget = DEFAULT_BUDGET): BudgetResult[] {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return [];
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const results: BudgetResult[] = [];

  // Categorize resources
  const categorized = {
    js: 0,
    css: 0,
    images: 0,
    fonts: 0,
    total: 0,
  };

  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    categorized.total += size;

    if (resource.name.endsWith('.js')) {
      categorized.js += size;
    } else if (resource.name.endsWith('.css')) {
      categorized.css += size;
    } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      categorized.images += size;
    } else if (resource.name.match(/\.(woff|woff2|ttf|eot)$/i)) {
      categorized.fonts += size;
    }
  });

  // Convert to KB
  const jsKB = categorized.js / 1024;
  const cssKB = categorized.css / 1024;
  const imagesKB = categorized.images / 1024;
  const fontsKB = categorized.fonts / 1024;
  const totalKB = categorized.total / 1024;

  // Check JavaScript budget
  results.push({
    passed: jsKB <= budget.maxJS,
    category: 'Bundle Size',
    metric: 'JavaScript',
    current: Math.round(jsKB),
    budget: budget.maxJS,
    unit: 'KB',
    percentage: Math.round((jsKB / budget.maxJS) * 100),
    status: jsKB <= budget.maxJS ? 'pass' : jsKB <= budget.maxJS * 1.2 ? 'warning' : 'fail',
  });

  // Check CSS budget
  results.push({
    passed: cssKB <= budget.maxCSS,
    category: 'Bundle Size',
    metric: 'CSS',
    current: Math.round(cssKB),
    budget: budget.maxCSS,
    unit: 'KB',
    percentage: Math.round((cssKB / budget.maxCSS) * 100),
    status: cssKB <= budget.maxCSS ? 'pass' : cssKB <= budget.maxCSS * 1.2 ? 'warning' : 'fail',
  });

  // Check Images budget
  results.push({
    passed: imagesKB <= budget.maxTotalImages,
    category: 'Bundle Size',
    metric: 'Images',
    current: Math.round(imagesKB),
    budget: budget.maxTotalImages,
    unit: 'KB',
    percentage: Math.round((imagesKB / budget.maxTotalImages) * 100),
    status: imagesKB <= budget.maxTotalImages ? 'pass' : imagesKB <= budget.maxTotalImages * 1.2 ? 'warning' : 'fail',
  });

  // Check Fonts budget
  results.push({
    passed: fontsKB <= budget.maxFonts,
    category: 'Bundle Size',
    metric: 'Fonts',
    current: Math.round(fontsKB),
    budget: budget.maxFonts,
    unit: 'KB',
    percentage: Math.round((fontsKB / budget.maxFonts) * 100),
    status: fontsKB <= budget.maxFonts ? 'pass' : fontsKB <= budget.maxFonts * 1.2 ? 'warning' : 'fail',
  });

  // Check Total budget
  results.push({
    passed: totalKB <= budget.maxBundleSize,
    category: 'Bundle Size',
    metric: 'Total',
    current: Math.round(totalKB),
    budget: budget.maxBundleSize,
    unit: 'KB',
    percentage: Math.round((totalKB / budget.maxBundleSize) * 100),
    status: totalKB <= budget.maxBundleSize ? 'pass' : totalKB <= budget.maxBundleSize * 1.2 ? 'warning' : 'fail',
  });

  return results;
}

/**
 * Check if Core Web Vitals are within budget
 */
export function checkWebVitals(
  metrics: {
    fcp?: number;
    lcp?: number;
    tti?: number;
    cls?: number;
  },
  budget: PerformanceBudget = DEFAULT_BUDGET
): BudgetResult[] {
  const results: BudgetResult[] = [];

  // Check FCP
  if (metrics.fcp !== undefined) {
    results.push({
      passed: metrics.fcp <= budget.maxFCP,
      category: 'Web Vitals',
      metric: 'FCP',
      current: Math.round(metrics.fcp),
      budget: budget.maxFCP,
      unit: 'ms',
      percentage: Math.round((metrics.fcp / budget.maxFCP) * 100),
      status: metrics.fcp <= budget.maxFCP ? 'pass' : metrics.fcp <= budget.maxFCP * 1.2 ? 'warning' : 'fail',
    });
  }

  // Check LCP
  if (metrics.lcp !== undefined) {
    results.push({
      passed: metrics.lcp <= budget.maxLCP,
      category: 'Web Vitals',
      metric: 'LCP',
      current: Math.round(metrics.lcp),
      budget: budget.maxLCP,
      unit: 'ms',
      percentage: Math.round((metrics.lcp / budget.maxLCP) * 100),
      status: metrics.lcp <= budget.maxLCP ? 'pass' : metrics.lcp <= budget.maxLCP * 1.2 ? 'warning' : 'fail',
    });
  }

  // Check TTI
  if (metrics.tti !== undefined) {
    results.push({
      passed: metrics.tti <= budget.maxTTI,
      category: 'Web Vitals',
      metric: 'TTI',
      current: Math.round(metrics.tti),
      budget: budget.maxTTI,
      unit: 'ms',
      percentage: Math.round((metrics.tti / budget.maxTTI) * 100),
      status: metrics.tti <= budget.maxTTI ? 'pass' : metrics.tti <= budget.maxTTI * 1.2 ? 'warning' : 'fail',
    });
  }

  // Check CLS
  if (metrics.cls !== undefined) {
    results.push({
      passed: metrics.cls <= budget.maxCLS,
      category: 'Web Vitals',
      metric: 'CLS',
      current: parseFloat(metrics.cls.toFixed(3)),
      budget: budget.maxCLS,
      unit: '',
      percentage: Math.round((metrics.cls / budget.maxCLS) * 100),
      status: metrics.cls <= budget.maxCLS ? 'pass' : metrics.cls <= budget.maxCLS * 1.2 ? 'warning' : 'fail',
    });
  }

  return results;
}

/**
 * Check API response times
 */
export async function checkAPIPerformance(
  endpoints: string[],
  headers?: Record<string, string>,
  budget: PerformanceBudget = DEFAULT_BUDGET
): Promise<BudgetResult[]> {
  const results: BudgetResult[] = [];

  for (const endpoint of endpoints) {
    const startTime = performance.now();

    try {
      await fetch(endpoint, { headers });
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      results.push({
        passed: duration <= budget.maxAPIResponse,
        category: 'API Performance',
        metric: endpoint.split('/').pop() || endpoint,
        current: duration,
        budget: budget.maxAPIResponse,
        unit: 'ms',
        percentage: Math.round((duration / budget.maxAPIResponse) * 100),
        status: duration <= budget.maxAPIResponse ? 'pass' : duration <= budget.maxAPIResponse * 1.2 ? 'warning' : 'fail',
      });
    } catch (error) {
      results.push({
        passed: false,
        category: 'API Performance',
        metric: endpoint.split('/').pop() || endpoint,
        current: -1,
        budget: budget.maxAPIResponse,
        unit: 'ms',
        percentage: 0,
        status: 'fail',
      });
    }
  }

  return results;
}

/**
 * Run complete performance budget check
 */
export async function runBudgetCheck(
  options: {
    checkBundle?: boolean;
    checkVitals?: boolean;
    checkAPI?: boolean;
    apiEndpoints?: string[];
    apiHeaders?: Record<string, string>;
    vitalsMetrics?: {
      fcp?: number;
      lcp?: number;
      tti?: number;
      cls?: number;
    };
  } = {}
): Promise<BudgetResult[]> {
  const {
    checkBundle = true,
    checkVitals = true,
    checkAPI = false,
    apiEndpoints = [],
    apiHeaders = {},
    vitalsMetrics = {},
  } = options;

  let allResults: BudgetResult[] = [];

  // Check bundle size
  if (checkBundle) {
    const bundleResults = checkBundleSize();
    allResults = [...allResults, ...bundleResults];
  }

  // Check Web Vitals
  if (checkVitals) {
    const vitalsResults = checkWebVitals(vitalsMetrics);
    allResults = [...allResults, ...vitalsResults];
  }

  // Check API performance
  if (checkAPI && apiEndpoints.length > 0) {
    const apiResults = await checkAPIPerformance(apiEndpoints, apiHeaders);
    allResults = [...allResults, ...apiResults];
  }

  return allResults;
}

/**
 * Display budget results in console
 */
export function displayBudgetResults(results: BudgetResult[]): void {
  console.log('\n📊 Performance Budget Check Results\n');

  // Group by category
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, BudgetResult[]>);

  // Display each category
  Object.entries(grouped).forEach(([category, categoryResults]) => {
    console.log(`\n${category}:`);
    console.table(
      categoryResults.map((r) => ({
        Metric: r.metric,
        Current: `${r.current}${r.unit}`,
        Budget: `${r.budget}${r.unit}`,
        '% of Budget': `${r.percentage}%`,
        Status: r.status === 'pass' ? '✅ Pass' : r.status === 'warning' ? '⚠️ Warning' : '❌ Fail',
      }))
    );
  });

  // Overall summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\n📈 Overall: ${passed}/${total} checks passed (${percentage}%)`);

  if (percentage === 100) {
    console.log('🎉 All performance budgets met!');
  } else if (percentage >= 80) {
    console.log('👍 Most performance budgets met, minor improvements needed');
  } else if (percentage >= 60) {
    console.log('⚠️ Several performance budgets exceeded, optimization recommended');
  } else {
    console.log('🚨 Performance budgets significantly exceeded, optimization required');
  }
}

/**
 * Get performance grade based on budget results
 */
export function getPerformanceGrade(results: BudgetResult[]): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  message: string;
} {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const score = Math.round((passed / total) * 100);

  if (score >= 90) {
    return { grade: 'A', score, message: 'Excellent performance!' };
  } else if (score >= 80) {
    return { grade: 'B', score, message: 'Good performance, minor improvements possible' };
  } else if (score >= 70) {
    return { grade: 'C', score, message: 'Acceptable performance, optimization recommended' };
  } else if (score >= 60) {
    return { grade: 'D', score, message: 'Poor performance, optimization needed' };
  } else {
    return { grade: 'F', score, message: 'Critical performance issues, immediate optimization required' };
  }
}
