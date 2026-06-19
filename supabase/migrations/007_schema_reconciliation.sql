-- GroIntel Migration 007 — Schema Reconciliation
-- Adds missing columns to CIE tables without removing existing data.
-- All operations use ALTER TABLE ADD COLUMN IF NOT EXISTS (safe to re-run).

-- ============================================================
-- growth_capability_dna
-- ============================================================
alter table growth_capability_dna add column if not exists execution_score int default 0;
alter table growth_capability_dna add column if not exists trust_score int default 0;
alter table growth_capability_dna add column if not exists authority_score int default 0;
alter table growth_capability_dna add column if not exists reach_score int default 0;
alter table growth_capability_dna add column if not exists audience_fit_score int default 0;
alter table growth_capability_dna add column if not exists industry_expertise_score int default 0;
alter table growth_capability_dna add column if not exists pricing_score int default 0;
alter table growth_capability_dna add column if not exists availability_score int default 0;
alter table growth_capability_dna add column if not exists innovation_score int default 0;
alter table growth_capability_dna add column if not exists roi_score int default 0;
alter table growth_capability_dna add column if not exists overall_score int default 0;
alter table growth_capability_dna add column if not exists confidence int default 0;
alter table growth_capability_dna add column if not exists evidence_count int default 0;
alter table growth_capability_dna add column if not exists calculation_version int default 1;
alter table growth_capability_dna add column if not exists extra_dimensions jsonb default '{}'::jsonb;
alter table growth_capability_dna add column if not exists last_calculated timestamptz default now();
alter table growth_capability_dna add column if not exists updated_at timestamptz default now();

-- ============================================================
-- growth_audience_dna
-- ============================================================
alter table growth_audience_dna add column if not exists industries text[];
alter table growth_audience_dna add column if not exists company_sizes text[];
alter table growth_audience_dna add column if not exists buyer_roles text[];
alter table growth_audience_dna add column if not exists buyer_stage text[];
alter table growth_audience_dna add column if not exists budget_range text;
alter table growth_audience_dna add column if not exists regions text[];
alter table growth_audience_dna add column if not exists languages text[];
alter table growth_audience_dna add column if not exists pain_points text[];
alter table growth_audience_dna add column if not exists preferred_channels text[];
alter table growth_audience_dna add column if not exists decision_cycle text;
alter table growth_audience_dna add column if not exists confidence int default 50;
alter table growth_audience_dna add column if not exists metadata jsonb default '{}'::jsonb;
alter table growth_audience_dna add column if not exists updated_at timestamptz default now();

-- ============================================================
-- growth_capability_history
-- ============================================================
alter table growth_capability_history add column if not exists capability_snapshot jsonb default '{}'::jsonb;
alter table growth_capability_history add column if not exists overall_score int default 0;
alter table growth_capability_history add column if not exists confidence int default 0;
alter table growth_capability_history add column if not exists reason text;
alter table growth_capability_history add column if not exists evidence_used jsonb default '[]'::jsonb;
alter table growth_capability_history add column if not exists calculated_at timestamptz default now();

-- ============================================================
-- growth_evidence
-- ============================================================
alter table growth_evidence add column if not exists source_url text;
alter table growth_evidence add column if not exists source_title text;
alter table growth_evidence add column if not exists source_description text;
alter table growth_evidence add column if not exists source_date date;
alter table growth_evidence add column if not exists source_author text;
alter table growth_evidence add column if not exists source_platform text;
alter table growth_evidence add column if not exists credibility_score int default 50;
alter table growth_evidence add column if not exists verification_status text default 'unverified';
alter table growth_evidence add column if not exists metadata jsonb default '{}'::jsonb;
alter table growth_evidence add column if not exists updated_at timestamptz default now();

-- ============================================================
-- growth_capability_explanations
-- ============================================================
alter table growth_capability_explanations add column if not exists capability_name text;
alter table growth_capability_explanations add column if not exists score int default 0;
alter table growth_capability_explanations add column if not exists confidence int default 0;
alter table growth_capability_explanations add column if not exists reason text;
alter table growth_capability_explanations add column if not exists evidence_used jsonb default '[]'::jsonb;
alter table growth_capability_explanations add column if not exists ai_model_version text;
alter table growth_capability_explanations add column if not exists generated_at timestamptz default now();

-- ============================================================
-- growth_relationships
-- ============================================================
alter table growth_relationships add column if not exists evidence_url text;
alter table growth_relationships add column if not exists description text;
alter table growth_relationships add column if not exists metadata jsonb default '{}'::jsonb;
alter table growth_relationships add column if not exists updated_at timestamptz default now();

-- ============================================================
-- growth_passports (D2 columns from 006 — may not have fully applied)
-- ============================================================
alter table growth_passports add column if not exists status text not null default 'draft';
alter table growth_passports add column if not exists completeness_score int default 0;
alter table growth_passports add column if not exists health_score int default 0;
alter table growth_passports add column if not exists last_ai_update timestamptz;
alter table growth_passports add column if not exists last_evidence_update timestamptz;
-- Note: If constraint was already created, drop+add is needed; skip to avoid error
