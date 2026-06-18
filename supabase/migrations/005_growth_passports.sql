-- GroIntel Database Migration 005
-- Growth Passport Foundation
-- Universal identity system for all Growth Entities.

-- ============================================================
-- 1. growth_entities - Universal identity table
-- ============================================================

create table if not exists growth_entities (
  id          uuid        primary key default gen_random_uuid(),
  entity_type text        not null,
  display_name text       not null,
  slug        text        unique,
  website     text,
  logo        text,
  country     text,
  city        text,
  languages   text[],
  verified    boolean     default false,
  claimed     boolean     default false,
  visibility  text        default 'draft',
  status      text        default 'active',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- 2. growth_passports - One per entity
-- ============================================================

create table if not exists growth_passports (
  id                  uuid        primary key default gen_random_uuid(),
  entity_id           uuid        not null references growth_entities(id) on delete cascade,
  headline            text,
  description         text,
  mission             text,
  primary_industry    text,
  secondary_industries text[],
  primary_region      text,
  service_regions     text[],
  company_size        text,
  team_size           int,
  year_founded        int,
  pricing_level       text,
  availability        text,
  overall_completion  int         default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- 3. growth_capabilities - Capability dimensions
-- ============================================================

create table if not exists growth_capabilities (
  id              uuid        primary key default gen_random_uuid(),
  passport_id     uuid        not null references growth_passports(id) on delete cascade,
  category        text,
  capability_name text        not null,
  description     text,
  evidence_source text,
  confidence      int         default 50,
  created_at      timestamptz default now()
);

-- ============================================================
-- 4. growth_audiences - Audience profiles
-- ============================================================

create table if not exists growth_audiences (
  id              uuid        primary key default gen_random_uuid(),
  passport_id     uuid        not null references growth_passports(id) on delete cascade,
  audience_type   text,
  industry        text,
  region          text,
  language        text,
  estimated_size  int,
  confidence      int         default 50,
  created_at      timestamptz default now()
);

-- ============================================================
-- 5. growth_channels_supported - Marketing channels
-- ============================================================

create table if not exists growth_channels_supported (
  id          uuid        primary key default gen_random_uuid(),
  passport_id uuid        not null references growth_passports(id) on delete cascade,
  channel     text        not null,
  description text,
  created_at  timestamptz default now()
);

-- ============================================================
-- 6. growth_case_studies - Portfolio
-- ============================================================

create table if not exists growth_case_studies (
  id              uuid        primary key default gen_random_uuid(),
  passport_id     uuid        not null references growth_passports(id) on delete cascade,
  client_name     text,
  industry        text,
  problem         text,
  solution        text,
  result_summary  text,
  roi             text,
  proof_url       text,
  visibility      text        default 'public',
  created_at      timestamptz default now()
);

-- ============================================================
-- 7. growth_social_accounts - Platform identity
-- ============================================================

create table if not exists growth_social_accounts (
  id                uuid        primary key default gen_random_uuid(),
  passport_id       uuid        not null references growth_passports(id) on delete cascade,
  platform          text        not null,
  username          text,
  url               text,
  followers         int,
  engagement_rate   numeric,
  verified          boolean     default false,
  last_updated      timestamptz default now()
);

-- ============================================================
-- 8. growth_metrics - Future AI metrics (schema only)
-- ============================================================

create table if not exists growth_metrics (
  id                uuid        primary key default gen_random_uuid(),
  passport_id       uuid        not null references growth_passports(id) on delete cascade,
  trust_score       int,
  authority_score   int,
  reach_score       int,
  audience_score    int,
  execution_score   int,
  roi_score         int,
  reliability_score int,
  overall_score     int,
  confidence        int,
  updated_at        timestamptz default now()
);

-- ============================================================
-- 9. growth_claim_requests - Claim workflow
-- ============================================================

create table if not exists growth_claim_requests (
  id                  uuid        primary key default gen_random_uuid(),
  passport_id         uuid        not null references growth_passports(id) on delete cascade,
  email               text,
  verification_method text,
  status              text        default 'pending',
  submitted_at        timestamptz default now(),
  reviewed_at         timestamptz
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_growth_entities_type on growth_entities(entity_type);
create index if not exists idx_growth_entities_slug on growth_entities(slug);
create index if not exists idx_growth_entities_status on growth_entities(status);
create index if not exists idx_growth_passports_entity on growth_passports(entity_id);
create index if not exists idx_growth_passports_industry on growth_passports(primary_industry);
create index if not exists idx_growth_capabilities_passport on growth_capabilities(passport_id);
create index if not exists idx_growth_audiences_passport on growth_audiences(passport_id);
create index if not exists idx_growth_case_studies_passport on growth_case_studies(passport_id);
create index if not exists idx_growth_socials_passport on growth_social_accounts(passport_id);
create index if not exists idx_growth_metrics_passport on growth_metrics(passport_id);
create index if not exists idx_growth_claim_passport on growth_claim_requests(passport_id);

-- ============================================================
-- RLS
-- ============================================================

alter table growth_entities enable row level security;
alter table growth_passports enable row level security;
alter table growth_capabilities enable row level security;
alter table growth_audiences enable row level security;
alter table growth_channels_supported enable row level security;
alter table growth_case_studies enable row level security;
alter table growth_social_accounts enable row level security;
alter table growth_metrics enable row level security;
alter table growth_claim_requests enable row level security;

-- No anon policies. Server-only via SUPABASE_SERVICE_ROLE_KEY.
