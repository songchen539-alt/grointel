// GroIntel GENESIS-2 — Exploration Types
export type PublicSourceType = "website" | "rss" | "atom" | "news" | "github" | "documentation" | "blog" | "jobs" | "product_updates" | "community" | "social_profile" | "open_dataset" | "government_data" | "search_api" | "partner_feed" | "changelog";
export type ExplorationStatus = "planned" | "in_progress" | "completed" | "failed" | "skipped";

export interface PublicSource { id: string; type: PublicSourceType; url: string; name: string; capability: string; freshness: number; reliability: number; estimated_cost: number; update_frequency_hours: number; enabled: boolean; }
export interface DiscoveryResult { id: string; entity_name: string; entity_type: string; candidate_sources: PublicSource[]; confidence: number; discovered_at: string; }
export interface AccessEvaluation { source_id: string; allowed: boolean; reason: string; policy_violations: string[]; }
export interface ExplorationPlan { id: string; entity_name: string; steps: ExplorationStep[]; total_estimated_cost: number; created_at: string; }
export interface ExplorationStep { id: string; source_type: PublicSourceType; url: string; priority: number; status: ExplorationStatus; result_summary: string | null; }
export interface ExtractedSignal { id: string; plan_id: string; source_type: string; signal_type: string; content: string; confidence: number; evidence: string; timestamp: string; }
export interface SourceReputation { source_id: string; accuracy: number; freshness: number; consistency: number; availability: number; historical_usefulness: number; confidence: number; }
export interface ExplorationMemoryEntry { id: string; entity_name: string; source_type: string; url: string; last_visited: string; last_signal_hash: string; signal_count: number; visit_count: number; }
