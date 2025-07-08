import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export const usePerformanceMonitor = () => {
  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Measure TTFB
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.TTFB = navigation.responseStart - navigation.fetchStart;
    }

    // Measure FCP
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.FCP = fcpEntry.startTime;
    }

    // Measure LCP using Performance Observer (fallback)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            metrics.LCP = lastEntry.startTime;
            logMetrics('LCP', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('Performance Observer not supported for LCP');
      }
    }

    return metrics;
  }, []);

  const logMetrics = useCallback((name: string, value: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}:`, value);
    }

    // Send to analytics service (replace with your analytics endpoint)
    if (process.env.NODE_ENV === 'production') {
      // Example: Analytics service call
      // analytics.track('performance_metric', { metric: name, value });
    }
  }, []);

  const measureBundleSize = useCallback(() => {
    if (typeof window === 'undefined') return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalJSSize = 0;
    let totalCSSSize = 0;
    let totalImageSize = 0;

    resources.forEach((resource) => {
      const transferSize = resource.transferSize || 0;
      
      if (resource.name.includes('.js')) {
        totalJSSize += transferSize;
      } else if (resource.name.includes('.css')) {
        totalCSSSize += transferSize;
      } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
        totalImageSize += transferSize;
      }
    });

    const bundleMetrics = {
      totalJS: (totalJSSize / 1024).toFixed(2) + ' KB',
      totalCSS: (totalCSSSize / 1024).toFixed(2) + ' KB',
      totalImages: (totalImageSize / 1024).toFixed(2) + ' KB',
      totalAssets: ((totalJSSize + totalCSSSize + totalImageSize) / 1024).toFixed(2) + ' KB'
    };

    if (process.env.NODE_ENV === 'development') {
      console.table(bundleMetrics);
    }

    return bundleMetrics;
  }, []);

  const measureComponentLoadTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Component ${componentName} load time:`, loadTime.toFixed(2) + 'ms');
      }
      
      return loadTime;
    };
  }, []);

  useEffect(() => {
    // Measure initial page load performance
    const timer = setTimeout(() => {
      measurePerformance();
      measureBundleSize();
    }, 1000); // Wait 1 second after initial render

    return () => clearTimeout(timer);
  }, [measurePerformance, measureBundleSize]);

  return {
    measurePerformance,
    measureBundleSize,
    measureComponentLoadTime,
    logMetrics
  };
};

// Hook for monitoring route changes
export const useRoutePerformance = () => {
  const { measureComponentLoadTime } = usePerformanceMonitor();

  useEffect(() => {
    const endMeasurement = measureComponentLoadTime('Route Change');
    
    return () => {
      endMeasurement();
    };
  }, [measureComponentLoadTime]);
};