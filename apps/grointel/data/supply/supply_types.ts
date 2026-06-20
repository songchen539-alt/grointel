// GroIntel DATA-2 — Supply Types
export type SupplyEntityType = "agency" | "creator" | "kol" | "consultant" | "freelancer" | "software" | "ai_agent" | "community" | "newsletter" | "podcast" | "media" | "open_source";
export type SupplySourceType = "website" | "linkedin" | "x" | "tiktok" | "youtube" | "instagram" | "facebook" | "reddit" | "github" | "product_hunt" | "app_store" | "play_store" | "newsletter" | "podcast" | "marketplace" | "manual" | "api" | "public_dataset";
export type SupplySignalType = "audience_growth_signal" | "engagement_signal" | "case_study_signal" | "client_win_signal" | "partnership_signal" | "pricing_signal" | "capability_signal" | "trust_signal" | "risk_signal" | "content_velocity_signal" | "community_growth_signal" | "software_adoption_signal" | "open_source_momentum_signal" | "market_relevance_signal";
export type SupplyChangeType = "new_supply_entity" | "profile_update" | "audience_update" | "capability_update" | "pricing_update" | "case_study_update" | "client_update" | "platform_update" | "trust_update" | "risk_update";
export type CapabilityType = "seo" | "paid_ads" | "content" | "influencer_marketing" | "community_growth" | "partnerships" | "pr" | "sales_outbound" | "product_growth" | "conversion_optimization" | "brand_strategy" | "market_entry" | "localization" | "ai_automation" | "analytics" | "creative_production" | "video_production";

export interface GrowthSupplyProfile {
  id: string; name: string; entity_type: SupplyEntityType; website: string;
  social_links: string[]; platforms: string[]; country: string; region: string;
  languages: string[]; industries_served: string[]; audiences: string[];
  capabilities: string[]; case_studies: string[]; proof_points: string[];
  pricing_signals: string[]; trust_signals: string[]; reach_metrics: Record<string, number>;
  engagement_metrics: Record<string, number>; conversion_evidence: string[];
  confidence: number; last_observed_at: string; last_verified_at: string;
  source_count: number; evidence_count: number; version: number;
  history: { timestamp: string; change: string; confidence: number }[];
}

export interface GrowthSupplyObservation {
  id: string; supply_id: string | null; source: string; raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown>; confidence: number; timestamp: string;
  evidence: string[]; detected_changes: string[];
}

export interface SupplySource { source_id: string; type: SupplySourceType; url: string; trust_score: number; freshness: number; coverage: number; rate_limit: number; enabled: boolean; }

export interface SupplySignal { id: string; type: SupplySignalType; strength: number; confidence: number; evidence: string[]; freshness: number; affected_entities: string[]; }
export interface SupplyChange { id: string; type: SupplyChangeType; supply_id: string; before: Record<string, unknown>; after: Record<string, unknown>; delta: string; importance: "low"|"medium"|"high"|"critical"; confidence: number; requires_review: boolean; timestamp: string; }
export interface CreatorProfile { id: string; supply_id: string; platform: string; handle: string; followers: number; engagement_rate: number; audience_geo: string[]; audience_industry: string[]; content_topics: string[]; content_velocity: number; brand_collaborations: string[]; proof_points: string[]; }
export interface AgencyProfile { id: string; supply_id: string; services: string[]; industries: string[]; regions: string[]; clients: string[]; case_studies: string[]; team_size: number; pricing_model: string; growth_channels: string[]; proof_points: string[]; }
export interface SoftwareProfile { id: string; supply_id: string; product_name: string; category: string; use_case: string; target_user: string; pricing: string; integrations: string[]; adoption_signals: string[]; reviews: number; growth_implication: string; }
export interface CommunityProfile { id: string; supply_id: string; community_name: string; platform: string; members: number; activity_level: string; topics: string[]; region: string; audience: string; trust_level: number; growth_implication: string; }
export interface CapabilityProfile { id: string; supply_id: string; capability_type: CapabilityType; strength: number; evidence: string[]; industry_fit: string[]; region_fit: string[]; audience_fit: string[]; price_fit: string; trust_level: number; confidence: number; }
export interface SupplyTrace { id: string; action: string; supply_id: string; details: string; timestamp: string; }
