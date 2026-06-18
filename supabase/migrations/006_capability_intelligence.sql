-- GroIntel Database Migration 006
-- Capability Intelligence Foundation
-- Run this in Supabase SQL Editor

-- ============================================================
-- D1: 6 New Tables
-- ============================================================

-- 1. growth_capability_dna
create table if not exists growth_capability_dna (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references growth_passports(id) on delete cascade,
  execution_score int, trust_score int, authority_score int, reach_score int,
  audience_fit_score int, industry_expertise_score int, pricing_score int,
  availability_score int, innovation_score int, roi_score int,
  overall_score int, confidence int, evidence_count int default 0,
  calculation_version int default 1,
  extra_dimensions jsonb default '{}'::jsonb,
  last_calculated timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. growth_audience_dna
create table if not exists growth_audience_dna (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references growth_passports(id) on delete cascade,
  industries text[], company_sizes text[], buyer_roles text[], buyer_stage text[],
  budget_range text, regions text[], languages text[], pain_points text[],
  preferred_channels text[], decision_cycle text,
  confidence int default 50,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. growth_capability_history
create table if not exists growth_capability_history (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references growth_passports(id) on delete cascade,
  capability_snapshot jsonb not null,
  overall_score int, confidence int, reason text,
  evidence_used jsonb default '[]'::jsonb,
  calculated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 4. growth_evidence
create table if not exists growth_evidence (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references growth_passports(id) on delete cascade,
  evidence_type text not null,
  source_url text, source_title text, source_description text,
  source_date date, source_author text, source_platform text,
  credibility_score int default 50,
  verification_status text default 'unverified',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. growth_capability_explanations
create table if not exists growth_capability_explanations (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references growth_passports(id) on delete cascade,
  capability_name text not null,
  score int, confidence int, reason text,
  evidence_used jsonb default '[]'::jsonb,
  ai_model_version text,
  generated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 6. growth_relationships
create table if not exists growth_relationships (
  id uuid primary key default gen_random_uuid(),
  source_passport_id uuid not null references growth_passports(id) on delete cascade,
  target_passport_id uuid not null references growth_passports(id) on delete cascade,
  relationship_type text not null,
  confidence int default 50,
  evidence_url text, description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_cap_dna_passport on growth_capability_dna(passport_id);
create index if not exists idx_audience_dna_passport on growth_audience_dna(passport_id);
create index if not exists idx_cap_history_passport on growth_capability_history(passport_id);
create index if not exists idx_evidence_passport on growth_evidence(passport_id);
create index if not exists idx_evidence_type on growth_evidence(evidence_type);
create index if not exists idx_explanations_passport on growth_capability_explanations(passport_id);
create index if not exists idx_relationships_source on growth_relationships(source_passport_id);
create index if not exists idx_relationships_target on growth_relationships(target_passport_id);
create index if not exists idx_relationships_type on growth_relationships(relationship_type);

-- RLS
alter table growth_capability_dna enable row level security;
alter table growth_audience_dna enable row level security;
alter table growth_capability_history enable row level security;
alter table growth_evidence enable row level security;
alter table growth_capability_explanations enable row level security;
alter table growth_relationships enable row level security;

-- ============================================================
-- D2: Extend growth_passports
-- ============================================================

alter table growth_passports add column if not exists status text not null default 'draft';
alter table growth_passports add column if not exists completeness_score int default 0;
alter table growth_passports add column if not exists health_score int default 0;
alter table growth_passports add column if not exists last_ai_update timestamptz;
alter table growth_passports add column if not exists last_evidence_update timestamptz;
alter table growth_passports add constraint if not exists chk_passport_status
  check (status in ('draft','ai_generated','claimed','verified','enterprise_verified'));
