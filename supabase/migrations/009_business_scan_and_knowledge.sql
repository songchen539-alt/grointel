-- GroIntel Database Migration 009
-- Business Scan and Business Knowledge

-- ============================================================
-- Table 1: business_scan_profiles
-- Initial public scan from website
-- ============================================================

create table if not exists business_scan_profiles (
  id                    uuid        primary key default gen_random_uuid(),
  entity_id             uuid        references growth_entities(id),
  website               text        not null,
  normalized_domain     text,
  company_name          text,
  industry              text,
  country               text,
  region                text,
  public_summary        text,
  detected_products     jsonb       default '[]'::jsonb,
  detected_markets      jsonb       default '[]'::jsonb,
  detected_growth_channels jsonb   default '[]'::jsonb,
  public_signals        jsonb       default '[]'::jsonb,
  sources               jsonb       default '[]'::jsonb,
  confidence            jsonb       default '{}'::jsonb,
  scan_status           text        default 'completed',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_scan_website on business_scan_profiles(website);
create index if not exists idx_scan_domain on business_scan_profiles(normalized_domain);
create index if not exists idx_scan_entity on business_scan_profiles(entity_id);
create index if not exists idx_scan_status on business_scan_profiles(scan_status);
create index if not exists idx_scan_created on business_scan_profiles(created_at);

alter table business_scan_profiles enable row level security;

-- ============================================================
-- Table 2: business_knowledge_profiles
-- Long-term AI knowledge about the business
-- ============================================================

create table if not exists business_knowledge_profiles (
  id                    uuid        primary key default gen_random_uuid(),
  entity_id             uuid        references growth_entities(id),
  scan_profile_id       uuid        references business_scan_profiles(id),
  website               text        not null,
  business_identity     jsonb       default '{}'::jsonb,
  business_model        jsonb       default '{}'::jsonb,
  market                jsonb       default '{}'::jsonb,
  goals                 jsonb       default '[]'::jsonb,
  constraints           jsonb       default '{}'::jsonb,
  growth_stack          jsonb       default '{}'::jsonb,
  history               jsonb       default '[]'::jsonb,
  preferences           jsonb       default '{}'::jsonb,
  knowledge_confidence  jsonb       default '{}'::jsonb,
  knowledge_status      text        default 'draft',
  last_conversation_at  timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_knowledge_website on business_knowledge_profiles(website);
create index if not exists idx_knowledge_entity on business_knowledge_profiles(entity_id);
create index if not exists idx_knowledge_scan on business_knowledge_profiles(scan_profile_id);
create index if not exists idx_knowledge_status on business_knowledge_profiles(knowledge_status);
create index if not exists idx_knowledge_created on business_knowledge_profiles(created_at);

alter table business_knowledge_profiles enable row level security;
