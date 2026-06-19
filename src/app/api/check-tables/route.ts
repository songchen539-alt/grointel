/* eslint-disable @typescript-eslint/no-explicit-any */
// GET /api/check-tables — diagnose which tables exist
import { NextResponse } from "next/server";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "apikey": k, "Authorization": "Bearer " + k });

export async function GET() {
  if (!u || !k) return NextResponse.json({ error: "not configured" });
  
  const tables = [
    "knowledge_completion_sessions",
    "knowledge_completion_questions",
    "knowledge_updates",
    "growth_goals",
    "growth_constraints",
    "growth_strategies",
    "business_knowledge_profiles",
    "business_scan_profiles",
    "capability_knowledge_profiles",
    "capability_scan_profiles",
  ];

  const results: Record<string, any> = {};

  for (const table of tables) {
    try {
      const r = await fetch(u + "/rest/v1/" + table + "?select=id&limit=1", { headers: h() });
      if (r.ok) {
        results[table] = { exists: true, status: r.status };
      } else {
        const body = await r.text();
        results[table] = { exists: false, error: body.slice(0, 150) };
      }
    } catch {
      results[table] = { exists: false, error: "Failed" };
    }
  }

  return NextResponse.json(results);
}
