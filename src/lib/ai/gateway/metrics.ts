// GroIntel AI Gateway - Metrics Collector

export interface MetricEntry {
  provider: string;
  capability: string;
  success: boolean;
  latencyMs: number;
  fallbackUsed: boolean;
  timestamp: string;
}

export class MetricsCollector {
  private entries: MetricEntry[] = [];
  private maxEntries = 1000;

  record(provider: string, capability: string, success: boolean, latencyMs: number, fallbackUsed: boolean): void {
    if (this.entries.length >= this.maxEntries) this.entries.shift();
    this.entries.push({ provider, capability, success, latencyMs, fallbackUsed, timestamp: new Date().toISOString() });
  }

  getStats(): { totalRequests: number; successRate: number; avgLatencyMs: number; fallbackRate: number } {
    const total = this.entries.length;
    if (total === 0) return { totalRequests: 0, successRate: 0, avgLatencyMs: 0, fallbackRate: 0 };
    const success = this.entries.filter((e) => e.success).length;
    const fallbacks = this.entries.filter((e) => e.fallbackUsed).length;
    const avgLat = this.entries.reduce((s, e) => s + e.latencyMs, 0) / total;
    return { totalRequests: total, successRate: success / total, avgLatencyMs: Math.round(avgLat), fallbackRate: fallbacks / total };
  }

  getEntries(): MetricEntry[] { return [...this.entries]; }
  clear(): void { this.entries = []; }
}
