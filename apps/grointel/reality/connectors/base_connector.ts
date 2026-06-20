// REALITY-2 — Base Connector with shared logic
import { ConnectorSignal, ConnectorEvidence, ConnectorHealth, ConnectorMetrics, SignalCategory } from "../reality_types";

export abstract class BaseConnector {
  protected totalObs = 0; protected totalSigs = 0; protected totalErrors = 0;
  protected lastSuccess: string | null = null; protected lastError: string | null = null;
  protected latencies: number[] = [];

  abstract get id(): string;
  abstract get name(): string;
  abstract get type(): string;

  health(): ConnectorHealth {
    const avgLat = this.latencies.length > 0 ? Math.round(this.latencies.reduce((s, l) => s + l, 0) / this.latencies.length) : 0;
    const total = this.totalObs + this.totalErrors;
    const sr = total > 0 ? Math.round(this.totalObs / total * 100) : 100;
    return { connector_id: this.id, state: this.totalErrors > 10 ? "degraded" : this.totalErrors > 0 ? "degraded" : "healthy", availability: 95, latency_ms: avgLat, success_rate: sr, error_rate: 100 - sr, freshness_hours: 0, last_successful_fetch: this.lastSuccess, last_error: this.lastError };
  }

  metrics(): ConnectorMetrics {
    return { total_observations: this.totalObs, total_signals: this.totalSigs, total_errors: this.totalErrors, uptime_percentage: 95, avg_latency_ms: this.latencies.length > 0 ? Math.round(this.latencies.reduce((s, l) => s + l, 0) / this.latencies.length) : 0 };
  }

  protected recordSuccess(latency: number): void { this.totalObs++; this.lastSuccess = new Date().toISOString(); this.latencies.push(latency); if (this.latencies.length > 100) this.latencies.shift(); }
  protected recordError(err: string): void { this.totalErrors++; this.lastError = err; }

  protected makeSignal(entity: string, type: string, category: SignalCategory, summary: string, confidence: number, source: string, url: string, evidence: ConnectorEvidence[]): ConnectorSignal {
    return { id: "sig_" + Math.random().toString(36).slice(2, 10), type, category, entity, summary, confidence, evidence, source, url, timestamp: new Date().toISOString() };
  }

  protected makeEvidence(source: string, url: string, connector: string, summary: string, confidence: number, entity: string): ConnectorEvidence {
    return { id: "ev_" + Math.random().toString(36).slice(2, 10), source, url, connector, evidence_summary: summary, confidence, entity, observed_at: new Date().toISOString() };
  }
}
