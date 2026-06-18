-- GroIntel Database Migration 004
-- Channel Opportunity Events

create table if not exists channel_opportunity_events (
  id          uuid        primary key default gen_random_uuid(),
  match_id    uuid        not null references growth_matches(id) on delete cascade,
  channel_id  uuid        not null references growth_channels(id) on delete cascade,
  event_type  text        not null,
  note        text,
  metadata    jsonb       default '{}'::jsonb,
  created_at  timestamptz default now()
);

create index if not exists idx_channel_opportunity_events_match_id
  on channel_opportunity_events (match_id);
create index if not exists idx_channel_opportunity_events_channel_id
  on channel_opportunity_events (channel_id);
create index if not exists idx_channel_opportunity_events_event_type
  on channel_opportunity_events (event_type);
create index if not exists idx_channel_opportunity_events_created_at_desc
  on channel_opportunity_events (created_at desc);

alter table channel_opportunity_events enable row level security;
