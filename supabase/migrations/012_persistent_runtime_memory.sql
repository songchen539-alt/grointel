-- GroIntel OPS-2 — Persistent Runtime Memory
-- Migration: 012_persistent_runtime_memory

-- 1. Company Memories
create table if not exists company_memories (
  id uuid primary key default gen_random_uuid(),
  company_website text not null,
  company_name text not null,
  profile jsonb not null default '{}',
  current_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_company_memories_website on company_memories(company_website);
create index if not exists idx_company_memories_created on company_memories(created_at);
alter table company_memories enable row level security;

-- 2. Company Reality Snapshots
create table if not exists company_reality_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_memory_id uuid references company_memories(id) on delete cascade,
  snapshot jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_snapshots_memory on company_reality_snapshots(company_memory_id);
create index if not exists idx_snapshots_created on company_reality_snapshots(created_at);
alter table company_reality_snapshots enable row level security;

-- 3. Growth Decision Memories
create table if not exists growth_decision_memories (
  id uuid primary key default gen_random_uuid(),
  company_memory_id uuid references company_memories(id) on delete cascade,
  decision jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_decisions_memory on growth_decision_memories(company_memory_id);
alter table growth_decision_memories enable row level security;

-- 4. Decision Confidence History
create table if not exists decision_confidence_history (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid references growth_decision_memories(id) on delete cascade,
  confidence integer not null default 0,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_confidence_decision on decision_confidence_history(decision_id);
alter table decision_confidence_history enable row level security;

-- 5. Company Memory Events
create table if not exists company_memory_events (
  id uuid primary key default gen_random_uuid(),
  company_memory_id uuid references company_memories(id) on delete cascade,
  event_type text not null,
  details text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_events_memory on company_memory_events(company_memory_id);
create index if not exists idx_events_created on company_memory_events(created_at);
alter table company_memory_events enable row level security;

-- 6. Runtime Jobs
create table if not exists runtime_jobs (
  id uuid primary key default gen_random_uuid(),
  company_memory_id uuid references company_memories(id) on delete cascade,
  capabilities jsonb not null default '[]',
  priority integer not null default 5,
  status text not null default 'queued',
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  error text,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index if not exists idx_runtime_jobs_status on runtime_jobs(status);
create index if not exists idx_runtime_jobs_memory on runtime_jobs(company_memory_id);
alter table runtime_jobs enable row level security;

-- 7. Runtime Checkpoints
create table if not exists runtime_checkpoints (
  id uuid primary key default gen_random_uuid(),
  company_memory_id uuid references company_memories(id) on delete cascade unique,
  checkpoint jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_checkpoints_memory on runtime_checkpoints(company_memory_id);
alter table runtime_checkpoints enable row level security;

-- 8. Runtime Audit Logs
create table if not exists runtime_audit_logs (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  job_id text,
  company_memory_id uuid references company_memories(id) on delete set null,
  details text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on runtime_audit_logs(created_at);
create index if not exists idx_audit_event on runtime_audit_logs(event);
alter table runtime_audit_logs enable row level security;

-- 9. Observation Sessions
create table if not exists observation_sessions (
  id uuid primary key default gen_random_uuid(),
  company_memory_id uuid references company_memories(id) on delete cascade,
  session jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_observation_memory on observation_sessions(company_memory_id);
alter table observation_sessions enable row level security;

-- 10. Connector Health States
create table if not exists connector_health_states (
  id uuid primary key default gen_random_uuid(),
  connector_name text not null,
  health jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists idx_connector_name on connector_health_states(connector_name);
alter table connector_health_states enable row level security;

-- 11. Connector Statistics
create table if not exists connector_statistics (
  id uuid primary key default gen_random_uuid(),
  connector_name text not null,
  stats jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists idx_connector_stats_name on connector_statistics(connector_name);
alter table connector_statistics enable row level security;
