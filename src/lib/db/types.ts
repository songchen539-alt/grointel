// GroIntel Database Type Contracts
// Lightweight TypeScript interfaces matching the expected Supabase schema.
// Used by CIE API routes and engine modules.

// ============================================================
// growth_entities
// ============================================================
export interface DbGrowthEntity {
  id: string;
  entity_type: string;
  display_name: string;
  slug: string | null;
  website: string | null;
  logo: string | null;
  country: string | null;
  city: string | null;
  languages: string[] | null;
  verified: boolean | null;
  claimed: boolean | null;
  visibility: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// growth_passports
// ============================================================
export interface DbGrowthPassport {
  id: string;
  entity_id: string;
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
  status: string | null;
  completeness_score: number | null;
  health_score: number | null;
  last_ai_update: string | null;
  last_evidence_update: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  entity?: DbGrowthEntity | null;
}

// ============================================================
// growth_capability_dna
// ============================================================
export interface DbGrowthCapabilityDna {
  id: string;
  passport_id: string;
  execution_score: number | null;
  trust_score: number | null;
  authority_score: number | null;
  reach_score: number | null;
  audience_fit_score: number | null;
  industry_expertise_score: number | null;
  pricing_score: number | null;
  availability_score: number | null;
  innovation_score: number | null;
  roi_score: number | null;
  overall_score: number | null;
  confidence: number | null;
  evidence_count: number | null;
  calculation_version: number | null;
  extra_dimensions: Record<string, number> | null;
  last_calculated: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// growth_audience_dna
// ============================================================
export interface DbGrowthAudienceDna {
  id: string;
  passport_id: string;
  industries: string[] | null;
  company_sizes: string[] | null;
  buyer_roles: string[] | null;
  buyer_stage: string[] | null;
  budget_range: string | null;
  regions: string[] | null;
  languages: string[] | null;
  pain_points: string[] | null;
  preferred_channels: string[] | null;
  decision_cycle: string | null;
  confidence: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// growth_capability_history
// ============================================================
export interface DbGrowthCapabilityHistory {
  id: string;
  passport_id: string;
  capability_snapshot: Record<string, number> | null;
  overall_score: number | null;
  confidence: number | null;
  reason: string | null;
  evidence_used: string[] | null;
  calculated_at: string | null;
  created_at: string | null;
}

// ============================================================
// business_intelligence_profiles
// ============================================================
export interface DbBusinessScanProfile {
  id: string;
  entity_id: string | null;
  website: string;
  normalized_domain: string | null;
  company_name: string | null;
  industry: string | null;
  country: string | null;
  region: string | null;
  public_summary: string | null;
  detected_products: Record<string, unknown>[] | null;
  detected_markets: Record<string, unknown>[] | null;
  detected_growth_channels: Record<string, unknown>[] | null;
  public_signals: Record<string, unknown>[] | null;
  sources: (string | Record<string, unknown>)[] | null;
  confidence: Record<string, number> | null;
  scan_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbBusinessKnowledgeProfile {
  id: string;
  entity_id: string | null;
  scan_profile_id: string | null;
  website: string;
  business_identity: Record<string, unknown> | null;
  business_model: Record<string, unknown> | null;
  market: Record<string, unknown> | null;
  goals: (string | Record<string, unknown>)[] | null;
  constraints: Record<string, unknown> | null;
  growth_stack: Record<string, unknown> | null;
  history: (string | Record<string, unknown>)[] | null;
  preferences: Record<string, unknown> | null;
  knowledge_confidence: Record<string, number> | null;
  knowledge_status: string | null;
  last_conversation_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// growth_evidence
// ============================================================
export interface DbGrowthEvidence {
  id: string;
  passport_id: string;
  evidence_type: string;
  source_url: string | null;
  source_title: string | null;
  source_description: string | null;
  source_date: string | null;
  source_author: string | null;
  source_platform: string | null;
  credibility_score: number | null;
  verification_status: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// growth_capability_explanations
// ============================================================
export interface DbGrowthCapabilityExplanation {
  id: string;
  passport_id: string;
  capability_name: string | null;
  score: number | null;
  confidence: number | null;
  reason: string | null;
  evidence_used: string[] | null;
  ai_model_version: string | null;
  generated_at: string | null;
  created_at: string | null;
}

// ============================================================
// business_intelligence_profiles
// ============================================================
export interface DbBusinessIntelligenceProfile {
  id: string;
  entity_id: string | null;
  website: string;
  company_name: string | null;
  industry: string | null;
  country: string | null;
  region: string | null;
  business_model: Record<string, unknown> | null;
  market: Record<string, unknown> | null;
  growth_stack: Record<string, unknown> | null;
  goals: (string | Record<string, unknown>)[] | null;
  constraints: Record<string, unknown> | null;
  history: (string | Record<string, unknown>)[] | null;
  preferences: Record<string, unknown> | null;
  confidence: Record<string, number> | null;
  sources: Record<string, unknown>[] | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// growth_relationships
// ============================================================
export interface DbGrowthRelationship {
  id: string;
  source_passport_id: string;
  target_passport_id: string;
  relationship_type: string;
  confidence: number | null;
  evidence_url: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// Response wrappers
// ============================================================
export interface DbSuccessResponse<T> {
  success: true;
  [key: string]: T | boolean;
}

export interface DbErrorResponse {
  success: false;
  error: string;
}

export type DbResponse<T> = DbSuccessResponse<T> | DbErrorResponse;

// ============================================================
// growth_proposals
// ============================================================
export interface DbGrowthProposal {
  id: string;
  title: string;
  business_entity_id: string;
  capability_entity_id: string;
  passport_id: string;
  goal: string | null;
  constraints: Record<string, unknown> | null;
  strategy: Record<string, unknown> | null;
  capability_stack: Record<string, unknown>[] | null;
  execution_plan: Record<string, unknown> | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  timeline: string | null;
  expected_outcome: string | null;
  reasoning: Record<string, unknown> | null;
  confidence_score: number | null;
  status: string | null;
  version: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// growth_proposal_versions
// ============================================================
export interface DbGrowthProposalVersion {
  id: string;
  proposal_id: string;
  version: number;
  snapshot: Record<string, unknown>;
  change_summary: string | null;
  created_by: string | null;
  created_at: string | null;
}

// ============================================================
// business_intelligence_profiles
// ============================================================
export interface DbBusinessIntelligenceProfile {
  id: string;
  entity_id: string | null;
  website: string;
  company_name: string | null;
  industry: string | null;
  country: string | null;
  region: string | null;
  business_model: Record<string, unknown> | null;
  market: Record<string, unknown> | null;
  growth_stack: Record<string, unknown> | null;
  goals: (string | Record<string, unknown>)[] | null;
  constraints: Record<string, unknown> | null;
  history: (string | Record<string, unknown>)[] | null;
  preferences: Record<string, unknown> | null;
  confidence: Record<string, number> | null;
  sources: Record<string, unknown>[] | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// growth_proposal_comments
// ============================================================
export interface DbGrowthProposalComment {
  id: string;
  proposal_id: string;
  author_type: string | null;
  author_name: string | null;
  comment: string | null;
  created_at: string | null;
}

// ============================================================
// business_intelligence_profiles
// ============================================================
export interface DbBusinessIntelligenceProfile {
  id: string;
  entity_id: string | null;
  website: string;
  company_name: string | null;
  industry: string | null;
  country: string | null;
  region: string | null;
  business_model: Record<string, unknown> | null;
  market: Record<string, unknown> | null;
  growth_stack: Record<string, unknown> | null;
  goals: (string | Record<string, unknown>)[] | null;
  constraints: Record<string, unknown> | null;
  history: (string | Record<string, unknown>)[] | null;
  preferences: Record<string, unknown> | null;
  confidence: Record<string, number> | null;
  sources: Record<string, unknown>[] | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbCapabilityScanProfile {
  id: string;
  entity_id: string | null;
  passport_id: string | null;
  profile_url: string;
  normalized_domain: string | null;
  display_name: string | null;
  entity_type: string | null;
  public_summary: string | null;
  detected_capabilities: Record<string, unknown>[] | null;
  detected_audiences: Record<string, unknown>[] | null;
  detected_markets: Record<string, unknown>[] | null;
  detected_channels: Record<string, unknown>[] | null;
  public_evidence: Record<string, unknown>[] | null;
  sources: (string | Record<string, unknown>)[] | null;
  confidence: Record<string, number> | null;
  scan_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbCapabilityKnowledgeProfile {
  id: string;
  entity_id: string | null;
  passport_id: string | null;
  scan_profile_id: string | null;
  profile_url: string;
  capability_identity: Record<string, unknown> | null;
  capability_dna: Record<string, unknown> | null;
  audience_dna: Record<string, unknown> | null;
  evidence_summary: Record<string, unknown> | null;
  strengths: (string | Record<string, unknown>)[] | null;
  limitations: (string | Record<string, unknown>)[] | null;
  preferred_collaborations: (string | Record<string, unknown>)[] | null;
  pricing_signals: Record<string, unknown> | null;
  availability_signals: Record<string, unknown> | null;
  knowledge_confidence: Record<string, number> | null;
  knowledge_status: string | null;
  last_conversation_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
