-- GroIntel Database Migration 011
-- Knowledge Completion Engine v1

-- ============================================================
-- Table 1: knowledge_completion_sessions
-- Adaptive knowledge interview sessions
-- ============================================================
create table if not exists knowledge_completion_sessions (
  id                  uuid        primary key default gen_random_uuid(),
  profile_type        text        not null,  -- 'business_knowledge' or 'capability_knowledge'
  profile_id          uuid        not null,
  current_step        int         default 0,
  overall_confidence  int         default 0,
  status              text        default 'in_progress',  -- 'in_progress', 'completed', 'abandoned'
  started_at          timestamptz default now(),
  completed_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_kc_sessions_profile on knowledge_completion_sessions(profile_type, profile_id);
create index if not exists idx_kc_sessions_status on knowledge_completion_sessions(status);

-- ============================================================
-- Table 2: knowledge_completion_questions
-- One question at a time, ordered by priority
-- ============================================================
create table if not exists knowledge_completion_questions (
  id                  uuid        primary key default gen_random_uuid(),
  session_id          uuid        not null references knowledge_completion_sessions(id) on delete cascade,
  target_field        text        not null,
  question            text        not null,
  reason              text,
  importance          int         default 50,  -- 0-100, higher = more important
  confidence_before   int         default 0,
  confidence_after    int,
  answer              text,
  answered_at         timestamptz,
  created_at          timestamptz default now()
);

create index if not exists idx_kc_questions_session on knowledge_completion_questions(session_id);
create index if not exists idx_kc_questions_answered on knowledge_completion_questions(session_id, answered_at);

-- ============================================================
-- Table 3: knowledge_updates
-- Record of every knowledge change from completion
-- ============================================================
create table if not exists knowledge_updates (
  id                    uuid        primary key default gen_random_uuid(),
  session_id            uuid        not null references knowledge_completion_sessions(id) on delete cascade,
  knowledge_profile_id  uuid        not null,
  updated_field         text        not null,
  previous_value        jsonb,
  new_value             jsonb,
  confidence_delta      int         default 0,
  source                text        default 'knowledge_completion',
  created_at            timestamptz default now()
);

create index if not exists idx_ku_session on knowledge_updates(session_id);
create index if not exists idx_ku_profile on knowledge_updates(knowledge_profile_id);

alter table knowledge_completion_sessions enable row level security;
alter table knowledge_completion_questions enable row level security;
alter table knowledge_updates enable row level security;
