import { NextResponse } from "next/server";
import { LEGACY_WORLD_TABLES, WORLD_MEMORY_MIGRATION_PATH, WORLD_MEMORY_TABLES } from "@/lib/grointel/worldMemoryMigration";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

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
      migration: WORLD_MEMORY_MIGRATION_PATH,
      tables: WORLD_MEMORY_TABLES.map((table) => ({ table, exists: false, error: "Supabase is not configured" })),
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

  const tables = await Promise.all(WORLD_MEMORY_TABLES.map(checkTable));
  const legacyTables = await Promise.all(LEGACY_WORLD_TABLES.map(checkTable));
  const missingTables = tables.filter((table) => !table.exists).map((table) => table.table);

  return NextResponse.json({
    success: true,
    configured: true,
    ready: tables.every((table) => table.exists),
    migration: WORLD_MEMORY_MIGRATION_PATH,
    missingTables,
    missingCount: missingTables.length,
    tables,
    legacyReady: legacyTables.some((table) => table.exists),
    legacyTables,
  });
}
