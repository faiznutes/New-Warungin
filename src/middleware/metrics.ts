import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class OutletMetrics {
  private static instance: OutletMetrics;
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  private constructor() {
    this.initializeMetrics();
  }

  static getInstance(): OutletMetrics {
    if (!OutletMetrics.instance) {
      OutletMetrics.instance = new OutletMetrics();
    }
    return OutletMetrics.instance;
  }

  private initializeMetrics() {
    this.counters.set('requests_total', 0);
    this.counters.set('requests_success', 0);
    this.counters.set('requests_error', 0);
    this.counters.set('outlets_created', 0);
    this.counters.set('outlets_updated', 0);
    this.counters.set('outlets_deleted', 0);
    this.counters.set('cache_hits', 0);
    this.counters.set('cache_misses', 0);
    this.gauges.set('active_outlets', 0);
    this.gauges.set('memory_usage_mb', 0);
    this.histograms.set('request_duration_ms', []);
    this.histograms.set('query_duration_ms', []);
  }

  incrementCounter(name: string, value: number = 1) {
    this.counters.set(name, (this.counters.get(name) || 0) + value);
  }

  setGauge(name: string, value: number) {
    this.gauges.set(name, value);
  }

  recordHistogram(name: string, value: number) {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    this.histograms.get(name)!.push(value);
    if (this.histograms.get(name)!.length > 1000) {
      this.histograms.get(name)!.shift();
    }
  }

  getMetrics() {
    const stats = {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: {} as any,
    };

    this.histograms.forEach((values, name) => {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        stats.histograms[name] = {
          count: values.length,
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)],
        };
      }
    });

    return stats;
  }

  getPrometheusMetrics() {
    let output = '';
    this.counters.forEach((value, name) => {
      output += `# HELP ${name} Counter\n# TYPE ${name} counter\n${name} ${value}\n\n`;
    });
    this.gauges.forEach((value, name) => {
      output += `# HELP ${name} Gauge\n# TYPE ${name} gauge\n${name} ${value}\n\n`;
    });
    return output;
  }

  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.initializeMetrics();
  }
}

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const metrics = OutletMetrics.getInstance();

  metrics.incrementCounter('requests_total');

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    metrics.recordHistogram('request_duration_ms', duration);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      metrics.incrementCounter('requests_success');
    } else if (res.statusCode >= 400) {
      metrics.incrementCounter('requests_error');
    }

    return originalSend.call(this, data);
  };

  next();
};

export const metricsEndpoint = (req: Request, res: Response) => {
  const metrics = OutletMetrics.getInstance();
  const format = req.query.format || 'json';

  if (format === 'prometheus') {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.send(metrics.getPrometheusMetrics());
  } else {
    res.json(metrics.getMetrics());
  }
};

export default OutletMetrics;
