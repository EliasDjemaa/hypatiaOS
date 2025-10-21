import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(performance.now());
  const mountTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstRender.current) {
      // Component mounted
      mountTime.current = performance.now() - renderStartTime.current;
      isFirstRender.current = false;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${componentName} mounted in ${mountTime.current.toFixed(2)}ms`);
      }
    } else {
      // Component updated
      updateCount.current += 1;
      const updateTime = performance.now() - renderStartTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 ${componentName} updated in ${updateTime.toFixed(2)}ms (update #${updateCount.current})`);
      }
    }

    // Reset render start time for next render
    renderStartTime.current = performance.now();
  });

  const getMetrics = (): PerformanceMetrics => ({
    componentName,
    renderTime: performance.now() - renderStartTime.current,
    mountTime: mountTime.current,
    updateCount: updateCount.current,
  });

  const logMetrics = () => {
    const metrics = getMetrics();
    console.table(metrics);
  };

  return { getMetrics, logMetrics };
};

// Web Vitals monitoring
export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            console.log(`📊 ${entry.name}: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });

      // Cleanup
      return () => observer.disconnect();
    }
  }, []);
};

// Bundle size monitoring
export const useBundleAnalyzer = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log bundle information
      const scripts = document.querySelectorAll('script[src]');
      let totalSize = 0;

      scripts.forEach((script) => {
        const src = (script as HTMLScriptElement).src;
        if (src.includes('localhost') || src.includes('127.0.0.1')) {
          fetch(src, { method: 'HEAD' })
            .then((response) => {
              const size = parseInt(response.headers.get('content-length') || '0');
              totalSize += size;
              console.log(`📦 Bundle: ${src.split('/').pop()} - ${(size / 1024).toFixed(2)}KB`);
            })
            .catch(() => {
              // Ignore errors for development
            });
        }
      });

      setTimeout(() => {
        console.log(`📦 Total estimated bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
      }, 1000);
    }
  }, []);
};

export default usePerformanceMonitor;
