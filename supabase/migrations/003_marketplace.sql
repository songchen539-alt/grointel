-- GroIntel Database Migration 003
-- Marketplace Foundation

-- ============================================================
-- Table: company_demands
-- Description: Company demand database, built by GroIntel team.
-- Each record is a company we identified as having growth needs.
-- ============================================================

create table if not exists company_demands (
  id                      uuid        primary key default gen_random_uuid(),
  company_name            text        not null,
  website                 text        not null,
  domain                  text,
  industry                text,
  category                text,
  region                  text,
  stage                   text,         -- early / growth / mature
  funding_signal          text,         -- recent raise, amount, round
  hiring_signal           text,         -- hiring velocity, key roles
  growth_signal           text,         -- product launch, expansion, partnership
  target_market_guess     text,         -- GroIntel AI guess
  growth_need_guess       text,         -- GroIntel AI guess (e.g. "needs SEA market entry support")
  recommended_channel_types text[],     -- array of channel category slugs
  estimated_budget_range  text,
  report_id               text,         -- linked MRI report
  source                  text default 'manual',
  claim_status            text default 'unclaimed',  -- unclaimed / claimed / verified
  contact_name            text,
  contact_email           text,
  status                  text default 'active',     -- active / paused / closed
  notes                   text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ============================================================
-- Table: growth_channels
-- Description: Growth supply database (agencies, communities,
-- media, consultants, VCs, accelerators, sales agents, etc.)
-- ============================================================

create table if not exists growth_channels (
  id                      uuid        primary key default gen_random_uuid(),
  channel_name            text        not null,
  website                 text        not null,
  domain                  text,
  category                text,         -- agency / community / media / consultant / vc / accelerator / sales_agent / other
  region                  text,
  service_types           text[],       -- e.g. {"seo","content","paid_ads","community","pr","partnerships","sales"}
  target_industries       text[],       -- e.g. {"fintech","saas","web3","ai"}
  target_client_stage     text[],       -- e.g. {"early","growth","enterprise"}
  pricing_model           text,         -- retainer / project / performance / hybrid
  min_budget              numeric,
  max_budget              numeric,
  currency                text default 'USD',
  growth_outcomes         text,         -- what results they deliver
  case_studies            text,
  proof_links             text[],
  contact_name            text,
  contact_email           text,
  source                  text default 'manual',
  claim_status            text default 'unclaimed',  -- unclaimed / claimed / verified
  verification_status     text default 'pending',     -- pending / verified / rejected
  status                  text default 'active',
  notes                   text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ============================================================
-- Table: channel_services
-- Description: Specific service/solution offerings uploaded
-- by channels to describe what they sell.
-- ============================================================

create table if not exists channel_services (
  id                      uuid        primary key default gen_random_uuid(),
  channel_id              uuid        not null references growth_channels(id),
  service_name            text        not null,
  service_type            text,         -- seo / content / paid_ads / community / pr / partnerships / sales / consulting
  problem_solved          text,         -- what company problem this solves
  growth_outcome          text,         -- expected growth result
  deliverables            text,
  timeline                text,
  pricing_model           text,         -- retainer / project / performance / hybrid
  starting_price          numeric,
  max_price               numeric,
  currency                text default 'USD',
  target_region           text,
  target_industry         text,
  success_metrics         text,         -- how to measure success
  case_study              text,
  status                  text default 'active',  -- active / inactive / draft
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ============================================================
-- Table: company_growth_needs
-- Description: Growth needs submitted by companies themselves
-- (via /growth-options form).
-- ============================================================

create table if not exists company_growth_needs (
  id                      uuid        primary key default gen_random_uuid(),
  company_name            text        not null,
  website                 text        not null,
  report_id               text,
  contact_name            text        not null,
  contact_email           text        not null,
  growth_goal             text,         -- what they want to achieve
  target_market           text,         -- which market they want to reach
  target_customer         text,         -- who their customer is
  current_challenge       text,         -- what's blocking growth
  budget_min              numeric,
  budget_max              numeric,
  currency                text default 'USD',
  timeline                text,
  preferred_channels      text[],       -- array of channel category slugs they prefer
  uploaded_materials      text,         -- links or file refs
  status                  text default 'new',  -- new / reviewed / matched / quoted / in_progress / won / lost
  source                  text default 'form',
  notes                   text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ============================================================
-- Table: growth_matches
-- Description: Internal matching records between company
-- demand/need and channel/service. Admin-managed.
-- ============================================================

create table if not exists growth_matches (
  id                      uuid        primary key default gen_random_uuid(),
  company_demand_id       uuid        references company_demands(id),
  company_growth_need_id  uuid        references company_growth_needs(id),
  channel_id              uuid        not null references growth_channels(id),
  service_id              uuid        references channel_services(id),
  match_score             numeric,      -- 0-100, AI-assisted or manual
  match_reason            text,
  recommended_solution_type text,
  admin_notes             text,
  status                  text        default 'draft',
  -- status flow: draft / proposed_to_channel / channel_interested / quoted / proposed_to_company / company_interested / intro_made / won / lost
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ============================================================
-- Table: growth_quotes
-- Description: Quotes submitted by channels in response to
-- a company growth need via a match.
-- ============================================================

create table if not exists growth_quotes (
  id                      uuid        primary key default gen_random_uuid(),
  match_id                uuid        not null references growth_matches(id),
  channel_id              uuid        not null references growth_channels(id),
  company_growth_need_id  uuid        references company_growth_needs(id),
  quote_title             text        not null,
  quote_amount            numeric,
  currency                text default 'USD',
  timeline                text,
  deliverables            text,
  expected_growth_outcome text,
  success_metrics         text,
  proposal_message        text,
  status                  text default 'draft',
  -- status flow: draft / submitted / reviewed / shared_with_company / accepted / rejected
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_company_demands_domain on company_demands(domain);
create index if not exists idx_company_demands_status on company_demands(status);
create index if not exists idx_company_demands_stage on company_demands(stage);
create index if not exists idx_growth_channels_domain on growth_channels(domain);
create index if not exists idx_growth_channels_category on growth_channels(category);
create index if not exists idx_growth_channels_status on growth_channels(status);
create index if not exists idx_channel_services_channel_id on channel_services(channel_id);
create index if not exists idx_company_growth_needs_status on company_growth_needs(status);
create index if not exists idx_growth_matches_status on growth_matches(status);
create index if not exists idx_growth_matches_channel_id on growth_matches(channel_id);
create index if not exists idx_growth_quotes_match_id on growth_quotes(match_id);

-- ============================================================
-- RLS
-- ============================================================

alter table company_demands enable row level security;
alter table growth_channels enable row level security;
alter table channel_services enable row level security;
alter table company_growth_needs enable row level security;
alter table growth_matches enable row level security;
alter table growth_quotes enable row level security;

-- No anon policies. Server-only via SUPABASE_SERVICE_ROLE_KEY.