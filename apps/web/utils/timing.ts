/**
 * Timing utilities for performance monitoring
 * Provides safe timing comparisons and performance measurement utilities
 */

// Performance measurement class
export class PerformanceTimer {
  private startTime: number = 0;
  private measurements: Array<{ label: string; duration: number; }> = [];

  start(label: string): void {
    this.startTime = performance.now();
    console.log(`⏱️ ${label}`);
  }

  end(label: string): number {
    const duration = performance.now() - this.startTime;
    this.measurements.push({ label, duration });
    
    console.log(`⏹️ ${label}: ${duration.toFixed(2)}ms`);
    
    const totalDuration = this.measurements.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / this.measurements.length;
    
    this.measurements = []; // Reset for next measurement
    this.startTime = 0;
    
    return averageDuration;
  }

  getAverageMeasurement(label: string): number {
    const measurements = this.measurements.filter(m => m.label === label);
    if (measurements.length === 0) return 0;
    
    const total = measurements.reduce((sum, m) => sum + m.duration, 0);
    return total / measurements.length;
  }

  getAllMeasurements(): Array<{ label: string; duration: number; count: number }> {
    return [...this.measurements];
  }

  // Export constants
  export const TIMING_CONSTANTS = {
    FAST_THRESHOLD: 100, // ms
    MEDIUM_THRESHOLD: 1000, // ms
    SLOW_THRESHOLD: 2000, // ms
    CRITICAL_THRESHOLD: 5000, // ms
  } as const;