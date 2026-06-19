// GroIntel Entities API
// GET /api/entities — list all growth entities
// POST /api/entities — create new entity

import { NextRequest, NextResponse } from "next/server";
import { DbGrowthEntity } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function GET() {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_entities?select=*&order=created_at.desc", { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Table may not exist" }, { status: 500 });
    const rows: DbGrowthEntity[] = await r.json();
    return NextResponse.json({ success: true, entities: rows });
  } catch { return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.entity_type || !b.display_name) return NextResponse.json({ success: false, error: "entity_type and display_name required" }, { status: 400 });
  try {
    const r = await fetch(u + "/rest/v1/growth_entities", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([b]) });
    if (!r.ok) return NextResponse.json({ success: false, error: "Insert failed" }, { status: 500 });
    const rows: DbGrowthEntity[] = await r.json();
    return NextResponse.json({ success: true, entity: rows[0] || rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
