-- GroIntel Database Migration 002
-- Prospects Table for Outbound Workflow
--
-- This migration creates the prospects table for managing outbound
-- prospecting and sales workflow.

create table if not exists prospects (
  id                    uuid        primary key default gen_random_uuid(),
  company_name          text        not null,
  website               text        not null,
  domain                text,
  category              text,
  target_person_name    text,
  target_person_title   text,
  target_person_email   text,
  target_person_linkedin text,
  priority              text        default 'B',
  status                text        default 'new',
  source                text        default 'manual',
  report_id             text,
  outbound_message      text,
  notes                 text,
  last_action_at        timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_prospects_domain on prospects(domain);
create index if not exists idx_prospects_status on prospects(status);
create index if not exists idx_prospects_priority on prospects(priority);
create index if not exists idx_prospects_created_at_desc on prospects(created_at desc);

alter table prospects enable row level security;

-- No anon policies. Server-only access via SUPABASE_SERVICE_ROLE_KEY.
