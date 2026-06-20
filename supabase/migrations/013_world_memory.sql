-- GroIntel WORLD-2 - Persistent World Memory
-- Stores the living world's heartbeat snapshots, observed entities, signals, and evidence.

create table if not exists world_targets (
  id text primary key,
  name text not null,
  identity text not null,
  kind text not null,
  domain text not null,
  metadata jsonb not null default '{}',
  last_observed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_world_targets_identity on world_targets(identity);
create index if not exists idx_world_targets_kind on world_targets(kind);
alter table world_targets enable row level security;

create table if not exists world_heartbeat_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'alive',
  source text not null default 'heartbeat',
  tick_count integer not null default 0,
  target_count integer not null default 0,
  observation_count integer not null default 0,
  signal_count integer not null default 0,
  evidence_count integer not null default 0,
  intelligence_index integer not null default 0,
  snapshot jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_world_heartbeat_created on world_heartbeat_runs(created_at desc);
alter table world_heartbeat_runs enable row level security;

create table if not exists world_observations (
  id text primary key,
  run_id uuid references world_heartbeat_runs(id) on delete cascade,
  target_id text references world_targets(id) on delete set null,
  target jsonb not null default '{}',
  signal_count integer not null default 0,
  evidence_count integer not null default 0,
  connectors_used jsonb not null default '[]',
  observed_at timestamptz not null,
  raw jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_world_observations_target on world_observations(target_id);
create index if not exists idx_world_observations_observed on world_observations(observed_at desc);
alter table world_observations enable row level security;

create table if not exists world_signals (
  id text primary key,
  run_id uuid references world_heartbeat_runs(id) on delete cascade,
  observation_id text references world_observations(id) on delete cascade,
  target_id text references world_targets(id) on delete set null,
  entity text not null,
  type text not null,
  category text not null,
  summary text not null,
  confidence integer not null default 0,
  source text,
  url text,
  raw jsonb not null default '{}',
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_world_signals_entity on world_signals(entity);
create index if not exists idx_world_signals_category on world_signals(category);
create index if not exists idx_world_signals_observed on world_signals(observed_at desc);
alter table world_signals enable row level security;

create table if not exists world_evidence (
  id text primary key,
  run_id uuid references world_heartbeat_runs(id) on delete cascade,
  observation_id text references world_observations(id) on delete cascade,
  target_id text references world_targets(id) on delete set null,
  entity text not null,
  connector text not null,
  source text,
  url text,
  evidence_summary text not null,
  confidence integer not null default 0,
  raw jsonb not null default '{}',
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_world_evidence_entity on world_evidence(entity);
create index if not exists idx_world_evidence_connector on world_evidence(connector);
create index if not exists idx_world_evidence_observed on world_evidence(observed_at desc);
alter table world_evidence enable row level security;

-- Layer 2: Entity understanding memory. One evolving profile per real-world target.
create table if not exists world_entity_memories (
  target_id text primary key references world_targets(id) on delete cascade,
  identity text not null,
  kind text not null,
  domain text not null,
  signal_count integer not null default 0,
  evidence_count integer not null default 0,
  confidence integer not null default 0,
  profile jsonb not null default '{}',
  first_observed_at timestamptz not null default now(),
  last_observed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_world_entity_memories_kind on world_entity_memories(kind);
create index if not exists idx_world_entity_memories_updated on world_entity_memories(updated_at desc);
alter table world_entity_memories enable row level security;

-- Layer 3: Decision memory. Stores current world gaps, priorities, and matching implications.
create table if not exists world_decision_memories (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references world_heartbeat_runs(id) on delete cascade,
  decision_type text not null,
  confidence integer not null default 0,
  reasoning text,
  gaps jsonb not null default '[]',
  priorities jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index if not exists idx_world_decision_memories_run on world_decision_memories(run_id);
create index if not exists idx_world_decision_memories_type on world_decision_memories(decision_type);
alter table world_decision_memories enable row level security;

-- Layer 4: Evolution memory. Tracks how GroIntel's world model improves over time.
create table if not exists world_evolution_memories (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references world_heartbeat_runs(id) on delete cascade,
  intelligence_index integer not null default 0,
  reality_coverage integer not null default 0,
  knowledge_quality integer not null default 0,
  decision_accuracy integer not null default 0,
  business_outcomes integer not null default 0,
  progress jsonb not null default '{}',
  lesson text,
  created_at timestamptz not null default now()
);
create index if not exists idx_world_evolution_memories_created on world_evolution_memories(created_at desc);
alter table world_evolution_memories enable row level security;
