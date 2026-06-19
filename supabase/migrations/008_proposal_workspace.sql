-- GroIntel Database Migration 008
-- Proposal Workspace Foundation
-- Tables for structured growth plans (proposals)

-- ============================================================
-- 1. growth_proposals - Core proposal
-- ============================================================

create table if not exists growth_proposals (
  id                uuid        primary key default gen_random_uuid(),
  title             text        not null,
  business_entity_id uuid       not null references growth_entities(id),
  capability_entity_id uuid    not null references growth_entities(id),
  passport_id       uuid        not null references growth_passports(id),
  goal              text,
  constraints       jsonb       default '{}'::jsonb,
  strategy          jsonb       default '{}'::jsonb,
  capability_stack  jsonb       default '[]'::jsonb,
  execution_plan    jsonb       default '{}'::jsonb,
  budget_min        numeric,
  budget_max        numeric,
  currency          text        default 'USD',
  timeline          text,
  expected_outcome  text,
  reasoning         jsonb       default '{}'::jsonb,
  confidence_score  numeric     default 0,
  status            text        default 'draft',
  version           integer     default 1,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================
-- 2. growth_proposal_versions - Version history
-- ============================================================

create table if not exists growth_proposal_versions (
  id                uuid        primary key default gen_random_uuid(),
  proposal_id       uuid        not null references growth_proposals(id) on delete cascade,
  version           integer     not null,
  snapshot          jsonb       not null,
  change_summary    text,
  created_by        text,
  created_at        timestamptz default now()
);

-- ============================================================
-- 3. growth_proposal_comments - Collaboration comments
-- ============================================================

create table if not exists growth_proposal_comments (
  id                uuid        primary key default gen_random_uuid(),
  proposal_id       uuid        not null references growth_proposals(id) on delete cascade,
  author_type       text,
  author_name       text,
  comment           text,
  created_at        timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_proposals_business on growth_proposals(business_entity_id);
create index if not exists idx_proposals_capability on growth_proposals(capability_entity_id);
create index if not exists idx_proposals_passport on growth_proposals(passport_id);
create index if not exists idx_proposals_status on growth_proposals(status);
create index if not exists idx_proposal_versions_proposal on growth_proposal_versions(proposal_id);
create index if not exists idx_proposal_comments_proposal on growth_proposal_comments(proposal_id);

-- ============================================================
-- RLS
-- ============================================================

alter table growth_proposals enable row level security;
alter table growth_proposal_versions enable row level security;
alter table growth_proposal_comments enable row level security;
