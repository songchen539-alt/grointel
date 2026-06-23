import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const WORLD_TABLES = [
  "world_targets",
  "world_heartbeat_runs",
  "world_observations",
  "world_signals",
  "world_evidence",
  "world_entity_memories",
  "world_decision_memories",
  "world_evolution_memories",
  "world_growth_events",
];

function headers() {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

export async function GET() {
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({
      success: true,
      configured: false,
      ready: false,
      migration: "supabase/migrations/013_world_memory.sql",
      tables: WORLD_TABLES.map((table) => ({ table, exists: false, error: "Supabase is not configured" })),
    });
  }

  const tables = await Promise.all(WORLD_TABLES.map(async (table) => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
        headers: headers(),
        cache: "no-store",
      });
      if (response.ok) return { table, exists: true, error: null };
      const body = await response.text();
      return { table, exists: false, error: body.slice(0, 220) };
    } catch (error) {
      return { table, exists: false, error: error instanceof Error ? error.message : "Failed to check table" };
    }
  }));

  return NextResponse.json({
    success: true,
    configured: true,
    ready: tables.every((table) => table.exists),
    migration: "supabase/migrations/013_world_memory.sql",
    tables,
  });
}
