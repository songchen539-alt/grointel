-- GroIntel Database Migration 011
-- Growth Intelligence Engine v1
-- Goal Library, Constraint Model, Strategy Knowledge

-- ============================================================
-- Table 1: growth_goals
-- Standardized growth goals
-- ============================================================
create table if not exists growth_goals (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  slug              text        unique,
  category          text,
  description       text,
  typical_budget    text,
  typical_timeline  text,
  required_capabilities jsonb   default '[]'::jsonb,
  suggested_metrics jsonb       default '[]'::jsonb,
  metadata          jsonb       default '{}'::jsonb,
  created_at        timestamptz default now()
);

-- ============================================================
-- Table 2: growth_constraints
-- Structured constraint profiles
-- ============================================================
create table if not exists growth_constraints (
  id                uuid        primary key default gen_random_uuid(),
  name              text,
  source_type       text,        -- 'business_knowledge' | 'manual' | 'inferred'
  source_id         text,        -- FK to business_knowledge_profiles or null
  budget_min        numeric,
  budget_max        numeric,
  timeline_text     text,
  regions           text[],
  languages         text[],
  compliance_needs  text[],
  company_stage     text,
  industry_focus    text[],
  urgency           text,
  other_constraints jsonb       default '{}'::jsonb,
  confidence        int         default 50,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================
-- Table 3: growth_strategies
-- Reasoned strategy outputs (capability stack, not partners)
-- ============================================================
create table if not exists growth_strategies (
  id                    uuid        primary key default gen_random_uuid(),
  source_type           text,        -- 'business_knowledge' | 'manual'
  source_id             text,        -- FK to business_knowledge_profiles or null
  goal_ids              jsonb        default '[]'::jsonb,
  constraint_id         uuid        references growth_constraints(id),
  reasoning             text,
  capability_stack      jsonb        default '[]'::jsonb,
  priorities            jsonb        default '[]'::jsonb,
  risk_factors          jsonb        default '[]'::jsonb,
  confidence_score      int          default 0,
  ai_model_version      text         default 'gie-v1',
  status                text         default 'draft',
  created_at            timestamptz  default now(),
  updated_at            timestamptz  default now()
);

create index if not exists idx_goals_slug on growth_goals(slug);
create index if not exists idx_goals_category on growth_goals(category);
create index if not exists idx_constraints_source on growth_constraints(source_type, source_id);
create index if not exists idx_strategies_source on growth_strategies(source_type, source_id);
create index if not exists idx_strategies_constraint on growth_strategies(constraint_id);
create index if not exists idx_strategies_status on growth_strategies(status);

alter table growth_goals enable row level security;
alter table growth_constraints enable row level security;
alter table growth_strategies enable row level security;
