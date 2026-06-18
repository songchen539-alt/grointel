// GroIntel Capability Intelligence Engine - Core Types
// Provider-agnostic types for the CIE layer

export interface CapabilityScores {
  execution_score: number;           // Execution capability (0-100)
  trust_score: number;               // Trustworthiness (0-100)
  authority_score: number;           // Authority in domain (0-100)
  reach_score: number;               // Reach/audience size (0-100)
  audience_fit_score: number;        // Fit for target audiences (0-100)
  industry_expertise_score: number;  // Industry depth (0-100)
  pricing_score: number;             // Pricing competitiveness (0-100)
  availability_score: number;        // Availability/friction (0-100)
  innovation_score: number;          // Innovation index (0-100)
  roi_score: number;                 // ROI track record (0-100)
  overall_score: number;             // Aggregate score (0-100)
  extra_dimensions: Record<string, number>; // Flexible extra dims
}

export interface AudienceProfile {
  industries: string[];
  company_sizes: string[];
  buyer_roles: string[];
  buyer_stage: string[];
  budget_range: string | null;
  regions: string[];
  languages: string[];
  pain_points: string[];
  preferred_channels: string[];
  decision_cycle: string | null;
  confidence: number;
  metadata: Record<string, unknown>;
}

export interface EvidenceItem {
  id?: string;
  passport_id?: string;
  evidence_type: EvidenceType;
  source_url: string | null;
  source_title: string | null;
  source_description: string | null;
  source_date: string | null;
  source_author: string | null;
  source_platform: string | null;
  credibility_score: number;
  verification_status: VerificationStatus;
  metadata: Record<string, unknown>;
}

export type EvidenceType =
  | "website" | "linkedin" | "x" | "github" | "youtube"
  | "podcast" | "newsletter" | "case_study" | "review"
  | "media_mention" | "public_dataset" | "other";

export type VerificationStatus =
  | "unverified" | "auto_verified" | "manual_verified" | "disputed";

export interface CapabilityExplanation {
  capability_name: string;
  score: number;
  confidence: number;
  reason: string;
  evidence_used: string[];
  ai_model_version: string;
  generated_at: string;
}

export interface CapabilityHistoryEntry {
  capability_snapshot: Partial<CapabilityScores>;
  overall_score: number;
  confidence: number;
  reason: string;
  evidence_used: string[];
  calculated_at: string;
}

export interface Relationship {
  source_passport_id: string;
  target_passport_id: string;
  relationship_type: RelationshipType;
  confidence: number;
  evidence_url: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
}

export type RelationshipType =
  | "works_with" | "served" | "collaborated_with" | "featured_on"
  | "invested_in" | "partner_of" | "sponsored_by" | "other";

export interface CapabilityCalculationResult {
  scores: CapabilityScores;
  confidence: number;
  evidence_count: number;
  calculation_version: number;
  history_entry: CapabilityHistoryEntry;
}

export interface HealthResult {
  health_score: number;         // 0-100
  completeness_score: number;   // 0-100
  factors: HealthFactor[];
}

export interface HealthFactor {
  name: string;
  score: number;
  weight: number;
  detail: string;
}

export interface CompletenessResult {
  completeness_score: number;
  filled_fields: string[];
  missing_fields: string[];
  total_required: number;
  total_filled: number;
}

// Passport data shape for CIE input
export interface PassportData {
  id: string;
  headline: string | null;
  description: string | null;
  mission: string | null;
  primary_industry: string | null;
  secondary_industries: string[] | null;
  primary_region: string | null;
  service_regions: string[] | null;
  company_size: string | null;
  team_size: number | null;
  year_founded: number | null;
  pricing_level: string | null;
  availability: string | null;
  overall_completion: number | null;
  capabilities?: Record<string, unknown>[];
  audiences?: Record<string, unknown>[];
  evidence?: Record<string, unknown>[];
  social_accounts?: Record<string, unknown>[];
  case_studies?: Record<string, unknown>[];
}

// Entity data
export interface EntityData {
  id: string;
  entity_type: string;
  display_name: string;
  website: string | null;
  country: string | null;
  languages: string[] | null;
}
