/* eslint-disable @typescript-eslint/no-explicit-any */
// Quick migration runner — runs both 011 SQLs
import { NextResponse } from "next/server";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "apikey": k, "Authorization": "Bearer " + k });

// The SQL as a single string — each statement separated for individual execution
const SQL_BLOCKS = [
  // Knowledge Completion sessions
  `create table if not exists knowledge_completion_sessions (
    id uuid primary key default gen_random_uuid(),
    profile_type text not null,
    profile_id uuid not null,
    current_step int default 0,
    overall_confidence int default 0,
    status text default 'in_progress',
    started_at timestamptz default now(),
    completed_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  )`,
  // Indexes for sessions
  `create index if not exists idx_kc_sessions_profile on knowledge_completion_sessions(profile_type, profile_id)`,
  `create index if not exists idx_kc_sessions_status on knowledge_completion_sessions(status)`,
  // Questions
  `create table if not exists knowledge_completion_questions (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references knowledge_completion_sessions(id) on delete cascade,
    target_field text not null,
    question text not null,
    reason text,
    importance int default 50,
    confidence_before int default 0,
    confidence_after int,
    answer text,
    answered_at timestamptz,
    created_at timestamptz default now()
  )`,
  `create index if not exists idx_kc_questions_session on knowledge_completion_questions(session_id)`,
  `create index if not exists idx_kc_questions_answered on knowledge_completion_questions(session_id, answered_at)`,
  // Updates
  `create table if not exists knowledge_updates (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references knowledge_completion_sessions(id) on delete cascade,
    knowledge_profile_id uuid not null,
    updated_field text not null,
    previous_value jsonb,
    new_value jsonb,
    confidence_delta int default 0,
    source text default 'knowledge_completion',
    created_at timestamptz default now()
  )`,
  `create index if not exists idx_ku_session on knowledge_updates(session_id)`,
  `create index if not exists idx_ku_profile on knowledge_updates(knowledge_profile_id)`,
  // RLS
  `alter table knowledge_completion_sessions enable row level security`,
  `alter table knowledge_completion_questions enable row level security`,
  `alter table knowledge_updates enable row level security`,
  // GIE — goals
  `create table if not exists growth_goals (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique,
    category text,
    description text,
    typical_budget text, typical_timeline text,
    required_capabilities jsonb default '[]'::jsonb,
    suggested_metrics jsonb default '[]'::jsonb,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now()
  )`,
  `create index if not exists idx_goals_slug on growth_goals(slug)`,
  `create index if not exists idx_goals_category on growth_goals(category)`,
  // GIE — constraints
  `create table if not exists growth_constraints (
    id uuid primary key default gen_random_uuid(),
    name text, source_type text, source_id text,
    budget_min numeric, budget_max numeric,
    timeline_text text, regions text[], languages text[],
    compliance_needs text[], company_stage text, industry_focus text[],
    urgency text, other_constraints jsonb default '{}'::jsonb,
    confidence int default 50,
    created_at timestamptz default now(), updated_at timestamptz default now()
  )`,
  `create index if not exists idx_constraints_source on growth_constraints(source_type, source_id)`,
  // GIE — strategies
  `create table if not exists growth_strategies (
    id uuid primary key default gen_random_uuid(),
    source_type text, source_id text,
    goal_ids jsonb default '[]'::jsonb,
    constraint_id uuid references growth_constraints(id),
    reasoning text,
    capability_stack jsonb default '[]'::jsonb,
    priorities jsonb default '[]'::jsonb,
    risk_factors jsonb default '[]'::jsonb,
    confidence_score int default 0,
    ai_model_version text default 'gie-v1',
    status text default 'draft',
    created_at timestamptz default now(), updated_at timestamptz default now()
  )`,
  `create index if not exists idx_strategies_source on growth_strategies(source_type, source_id)`,
  `create index if not exists idx_strategies_constraint on growth_strategies(constraint_id)`,
  `create index if not exists idx_strategies_status on growth_strategies(status)`,
  // RLS
  `alter table growth_goals enable row level security`,
  `alter table growth_constraints enable row level security`,
  `alter table growth_strategies enable row level security`,
];

export async function GET() {
  if (!u || !k) return NextResponse.json({ error: "not configured" });

  const results: Record<string, any> = {};

  for (const sql of SQL_BLOCKS) {
    const label = sql.replace(/\n/g, " ").slice(0, 60).trim();
    try {
      const r = await fetch(u + "/rest/v1/rpc/", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...h() },
        body: JSON.stringify({ query: sql }),
      });
      results[label] = { status: r.status };
    } catch {
      results[label] = { error: "SQL execution failed" };
    }
  }

  // Verify tables exist
  const verify: Record<string, boolean> = {};
  for (const table of ["knowledge_completion_sessions", "knowledge_completion_questions", "knowledge_updates", "growth_goals", "growth_constraints", "growth_strategies"]) {
    try {
      const r = await fetch(u + "/rest/v1/" + table + "?select=id&limit=1", { headers: h() });
      verify[table] = r.ok;
    } catch {
      verify[table] = false;
    }
  }

  return NextResponse.json({ sql_attempts: results, verify });
}
