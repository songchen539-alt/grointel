// GroIntel DATA-1 — Company Types
export type CompanySignalType = "funding_signal" | "hiring_signal" | "layoff_signal" | "product_launch_signal" | "partnership_signal" | "market_expansion_signal" | "pricing_change_signal" | "technology_adoption_signal" | "traffic_growth_signal" | "social_growth_signal" | "content_growth_signal" | "regulation_signal" | "risk_signal" | "trust_signal";
export type SourceType = "website" | "linkedin" | "crunchbase" | "github" | "news" | "job_board" | "product_hunt" | "app_store" | "play_store" | "social" | "manual" | "api" | "public_dataset";
export type ChangeType = "new_company" | "profile_update" | "funding_update" | "hiring_update" | "product_update" | "market_update" | "technology_update" | "growth_channel_update" | "risk_update" | "trust_update";
export type FundingRound = "seed" | "angel" | "series_a" | "series_b" | "series_c" | "series_d" | "series_e" | "growth" | "ipo" | "grant" | "debt";

export interface CompanyProfile {
  id: string; name: string; domain: string; website: string; industry: string;
  country: string; region: string; description: string; founders: string[];
  employees_estimate: number; funding_stage: string; total_funding: number;
  growth_channels: string[]; products: string[]; technologies: string[]; social_links: string[];
  confidence: number; last_observed_at: string; last_verified_at: string;
  source_count: number; evidence_count: number; version: number;
  history: { timestamp: string; change: string; confidence: number }[];
}

export interface CompanySource {
  source_id: string; type: SourceType; url: string; trust_score: number;
  freshness: number; coverage: number; rate_limit: number; enabled: boolean;
}

export interface CompanyObservation {
  id: string; company_id: string | null; source: string; raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown>; confidence: number; timestamp: string;
  evidence: string[]; detected_changes: string[];
}

export interface CompanySignal {
  id: string; type: CompanySignalType; strength: number; confidence: number;
  evidence: string[]; freshness: number; affected_entities: string[];
}

export interface CompanyChange {
  id: string; type: ChangeType; company_id: string; before: Record<string, unknown>;
  after: Record<string, unknown>; delta: string; importance: "low" | "medium" | "high" | "critical";
  confidence: number; requires_review: boolean; timestamp: string;
}

export interface CompanyFundingEvent {
  id: string; company_id: string; round_type: FundingRound; amount: number;
  currency: string; investors: string[]; date: string; source: string; confidence: number;
}

export interface CompanyHiringEvent {
  id: string; company_id: string; role: string; function: string; seniority: string;
  location: string; remote: boolean; department: string; volume: number; growth_implication: string;
}

export interface CompanyProductEvent {
  id: string; company_id: string; product_name: string; launch_type: string;
  category: string; target_user: string; positioning: string; pricing: string;
  technology: string; growth_implication: string;
}

export interface CompanyGrowthEvent {
  id: string; company_id: string; campaign: string; channel: string; partner: string;
  creator: string; agency: string; region: string; audience: string;
  evidence: string[]; outcome: string;
}

export interface CompanyTrace {
  id: string; action: string; company_id: string; details: string; timestamp: string;
}
