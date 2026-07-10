import { NextRequest, NextResponse } from "next/server";
import {
  LEGACY_WORLD_TABLES,
  loadWorldMemoryMigrationSql,
  summarizeSql,
  WORLD_MEMORY_MIGRATION_PATH,
  WORLD_MEMORY_TABLES,
} from "@/lib/grointel/worldMemoryMigration";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function headers() {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

async function checkTable(table: string) {
  if (!supabaseUrl || !serviceKey) {
    return { table, exists: false, error: "Supabase is not configured" };
  }
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
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const includeSql = url.searchParams.get("includeSql") === "1";
  const sql = await loadWorldMemoryMigrationSql();
  const primaryTables = await Promise.all(WORLD_MEMORY_TABLES.map(checkTable));
  const legacyTables = await Promise.all(LEGACY_WORLD_TABLES.map(checkTable));
  const missingTables = primaryTables.filter((table) => !table.exists).map((table) => table.table);
  const legacyReady = legacyTables.some((table) => table.exists);
  const ready = missingTables.length === 0;

  return NextResponse.json({
    success: true,
    configured: Boolean(supabaseUrl && serviceKey),
    ready,
    legacyReady,
    migration: {
      path: WORLD_MEMORY_MIGRATION_PATH,
      ...summarizeSql(sql),
      execution: "Run this SQL once in the Supabase SQL Editor or with Supabase CLI using an authenticated access token. This endpoint intentionally does not execute DDL.",
    },
    primary: {
      requiredTables: WORLD_MEMORY_TABLES.length,
      existingTables: primaryTables.filter((table) => table.exists).length,
      missingTables,
      tables: primaryTables,
    },
    legacy: {
      ready: legacyReady,
      existingTables: legacyTables.filter((table) => table.exists).length,
      tables: legacyTables,
    },
    sql: includeSql ? sql : undefined,
  });
}
