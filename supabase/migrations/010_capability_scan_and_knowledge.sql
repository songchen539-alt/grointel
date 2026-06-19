-- GroIntel Database Migration 010
-- Capability Scan and Capability Knowledge

-- ============================================================
-- Table 1: capability_scan_profiles
-- Initial public scan from capability provider profile
-- ============================================================

create table if not exists capability_scan_profiles (
  id                    uuid        primary key default gen_random_uuid(),
  entity_id             uuid        references growth_entities(id),
  passport_id           uuid        references growth_passports(id),
  profile_url           text        not null,
  normalized_domain     text,
  display_name          text,
  entity_type           text,
  public_summary        text,
  detected_capabilities jsonb       default '[]'::jsonb,
  detected_audiences    jsonb       default '[]'::jsonb,
  detected_markets      jsonb       default '[]'::jsonb,
  detected_channels     jsonb       default '[]'::jsonb,
  public_evidence       jsonb       default '[]'::jsonb,
  sources               jsonb       default '[]'::jsonb,
  confidence            jsonb       default '{}'::jsonb,
  scan_status           text        default 'completed',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_cap_scan_url on capability_scan_profiles(profile_url);
create index if not exists idx_cap_scan_domain on capability_scan_profiles(normalized_domain);
create index if not exists idx_cap_scan_entity on capability_scan_profiles(entity_id);
create index if not exists idx_cap_scan_passport on capability_scan_profiles(passport_id);
create index if not exists idx_cap_scan_type on capability_scan_profiles(entity_type);
create index if not exists idx_cap_scan_status on capability_scan_profiles(scan_status);
create index if not exists idx_cap_scan_created on capability_scan_profiles(created_at);

alter table capability_scan_profiles enable row level security;

-- ============================================================
-- Table 2: capability_knowledge_profiles
-- Long-term AI knowledge about a capability provider
-- ============================================================

create table if not exists capability_knowledge_profiles (
  id                      uuid        primary key default gen_random_uuid(),
  entity_id               uuid        references growth_entities(id),
  passport_id             uuid        references growth_passports(id),
  scan_profile_id         uuid        references capability_scan_profiles(id),
  profile_url             text        not null,
  capability_identity     jsonb       default '{}'::jsonb,
  capability_dna          jsonb       default '{}'::jsonb,
  audience_dna            jsonb       default '{}'::jsonb,
  evidence_summary        jsonb       default '{}'::jsonb,
  strengths               jsonb       default '[]'::jsonb,
  limitations             jsonb       default '[]'::jsonb,
  preferred_collaborations jsonb      default '[]'::jsonb,
  pricing_signals         jsonb       default '{}'::jsonb,
  availability_signals    jsonb       default '{}'::jsonb,
  knowledge_confidence    jsonb       default '{}'::jsonb,
  knowledge_status        text        default 'draft',
  last_conversation_at    timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index if not exists idx_cap_know_url on capability_knowledge_profiles(profile_url);
create index if not exists idx_cap_know_entity on capability_knowledge_profiles(entity_id);
create index if not exists idx_cap_know_passport on capability_knowledge_profiles(passport_id);
create index if not exists idx_cap_know_scan on capability_knowledge_profiles(scan_profile_id);
create index if not exists idx_cap_know_status on capability_knowledge_profiles(knowledge_status);
create index if not exists idx_cap_know_created on capability_knowledge_profiles(created_at);

alter table capability_knowledge_profiles enable row level security;
