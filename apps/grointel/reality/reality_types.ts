// GroIntel REALITY-2 — Reality Connector Types
export type ConnectorState = "healthy" | "degraded" | "error" | "disabled";
export type SignalCategory = "hiring" | "funding" | "pricing" | "product" | "expansion" | "partnership" | "policy" | "community" | "engineering" | "traffic" | "customer" | "documentation";

export interface ConnectorSignal { id: string; type: string; category: SignalCategory; entity: string; summary: string; confidence: number; evidence: ConnectorEvidence[]; source: string; url: string; timestamp: string; }
export interface ConnectorEvidence { id: string; source: string; url: string; connector: string; evidence_summary: string; confidence: number; entity: string; observed_at: string; }
export interface ConnectorHealth { connector_id: string; state: ConnectorState; availability: number; latency_ms: number; success_rate: number; error_rate: number; freshness_hours: number; last_successful_fetch: string | null; last_error: string | null; }
export interface ConnectorMetrics { total_observations: number; total_signals: number; total_errors: number; uptime_percentage: number; avg_latency_ms: number; }

export interface ConnectorResult { signals: ConnectorSignal[]; evidence: ConnectorEvidence[]; health: ConnectorHealth; }

export interface IKConnector {
  id: string; name: string; type: string; discover(entity: string): Promise<string[]>; health(): ConnectorHealth;
  fetch(url: string): Promise<any>; normalize(raw: any): any; extractSignals(data: any, entity: string): ConnectorSignal[];
  extractEvidence(data: any, url: string, entity: string): ConnectorEvidence[]; estimateConfidence(raw: any): number;
  metrics(): ConnectorMetrics;
  run(entity: string): Promise<ConnectorResult>;
}
