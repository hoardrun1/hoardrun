// Simple navigation performance monitoring

interface NavigationMetric {
  from: string;
  to: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class NavigationPerformanceMonitor {
  private metrics: NavigationMetric[] = [];
  private currentNavigation: NavigationMetric | null = null;

  startNavigation(from: string, to: string) {
    this.currentNavigation = {
      from,
      to,
      startTime: performance.now()
    };
  }

  endNavigation() {
    if (this.currentNavigation) {
      const endTime = performance.now();
      const duration = endTime - this.currentNavigation.startTime;
      
      const completedMetric = {
        ...this.currentNavigation,
        endTime,
        duration
      };

      this.metrics.push(completedMetric);
      
      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 Navigation ${completedMetric.from} → ${completedMetric.to}: ${duration.toFixed(2)}ms`);
      }

      this.currentNavigation = null;
      return completedMetric;
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  getAverageNavigationTime() {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    return total / this.metrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const navigationPerformance = new NavigationPerformanceMonitor();

// Hook to monitor navigation performance
export const useNavigationPerformance = () => {
  const startNavigation = (from: string, to: string) => {
    navigationPerformance.startNavigation(from, to);
  };

  const endNavigation = () => {
    return navigationPerformance.endNavigation();
  };

  return {
    startNavigation,
    endNavigation,
    getMetrics: () => navigationPerformance.getMetrics(),
    getAverageTime: () => navigationPerformance.getAverageNavigationTime(),
    clearMetrics: () => navigationPerformance.clearMetrics()
  };
};
