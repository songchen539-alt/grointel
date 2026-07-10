import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";

export const WORLD_MEMORY_MIGRATION_PATH = "supabase/migrations/013_world_memory.sql";

export const WORLD_MEMORY_TABLES = [
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

export const LEGACY_WORLD_TABLES = [
  "world_contexts",
  "world_repair_runs",
  "world_raw_observations",
  "world_growth_signals",
  "world_events",
  "world_entities",
  "world_decision_makers",
  "world_relationships",
];

export async function loadWorldMemoryMigrationSql() {
  return readFile(path.join(process.cwd(), WORLD_MEMORY_MIGRATION_PATH), "utf8");
}

export function hashSql(sql: string) {
  return createHash("sha256").update(sql).digest("hex");
}

export function summarizeSql(sql: string) {
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  return {
    sha256: hashSql(sql),
    bytes: Buffer.byteLength(sql, "utf8"),
    lines: sql.split(/\r?\n/).length,
    statements: statements.length,
  };
}
