// GroIntel Reality World — Core Types
export type DomainName =
  | "Technology" | "AI" | "Science" | "Business" | "Market" | "Finance"
  | "Government" | "Policy" | "Education" | "Manufacturing" | "Healthcare"
  | "Transportation" | "Energy" | "Climate" | "Media" | "Community"
  | "Creator" | "OpenSource" | "Investment" | "Employment" | "SupplyChain"
  | "Military" | "Agriculture" | "Research" | "General";

export type EventSource = "web_scan" | "api" | "user_input" | "inference" | "prediction" | "feedback" | "internal" | "external_agent";

export interface WorldEvent {
  id: string;
  timestamp: string;
  domain: DomainName;
  domains: DomainName[];
  source: EventSource;
  event_type: string;
  importance: number;
  confidence: number;
  payload: Record<string, unknown>;
  location: string | null;
  language: string | null;
  entities: string[];
  metadata: Record<string, unknown>;
  trace_id: string;
}

export interface DomainState {
  domain: DomainName;
  current_status: string;
  trend: number;
  velocity: number;
  risk_level: number;
  opportunity_level: number;
  confidence: number;
  reality_fidelity: number;
  knowledge_density: number;
  prediction_accuracy: number;
  learning_velocity: number;
  event_count: number;
  last_event_at: string | null;
}

export interface WorldState {
  domains: Record<string, DomainState>;
  global_event_count: number;
  global_confidence: number;
  global_reality_fidelity: number;
  global_prediction_accuracy: number;
  global_learning_velocity: number;
  last_event_at: string | null;
  updated_at: string;
}

export interface DomainMemory {
  events: WorldEvent[];
  signals: string[];
  entities: string[];
  predictions: string[];
  contradictions: string[];
  learning: string[];
  capacity: number;
}

export interface Subscription {
  id: string;
  domainFilter: DomainName | null;
  importanceMin: number;
  callback: (event: WorldEvent) => void;
}

export interface StreamMetrics {
  total_events_received: number;
  total_events_routed: number;
  events_per_second: number;
  domains_active: number;
  subscribers_active: number;
  memory_usage_estimate: number;
  oldest_event_at: string | null;
  newest_event_at: string | null;
}
