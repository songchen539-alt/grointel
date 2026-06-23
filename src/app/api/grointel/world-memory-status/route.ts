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

const LEGACY_WORLD_TABLES = [
  "world_contexts",
  "world_repair_runs",
  "world_raw_observations",
  "world_growth_signals",
  "world_events",
  "world_entities",
  "world_decision_makers",
  "world_relationships",
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

  const checkTable = async (table: string) => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
        headers: headers(),
        cache: "no-store",
      });
      if (response.ok) {
        const rows = await response.json();
        return { table, exists: true, sampleKeys: rows?.[0] ? Object.keys(rows[0]) : [], error: null };
      }
      const body = await response.text();
      return { table, exists: false, sampleKeys: [], error: body.slice(0, 220) };
    } catch (error) {
      return { table, exists: false, sampleKeys: [], error: error instanceof Error ? error.message : "Failed to check table" };
    }
  };

  const tables = await Promise.all(WORLD_TABLES.map(checkTable));
  const legacyTables = await Promise.all(LEGACY_WORLD_TABLES.map(checkTable));

  return NextResponse.json({
    success: true,
    configured: true,
    ready: tables.every((table) => table.exists),
    migration: "supabase/migrations/013_world_memory.sql",
    tables,
    legacyReady: legacyTables.some((table) => table.exists),
    legacyTables,
  });
}
