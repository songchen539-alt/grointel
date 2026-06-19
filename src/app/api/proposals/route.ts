// GET /api/proposals — list all proposals
// POST /api/proposals — create new proposal
import { NextRequest, NextResponse } from "next/server";
import { DbGrowthProposal } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function GET() {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_proposals?select=*,business:business_entity_id(*),capability:capability_entity_id(*)&order=created_at.desc", { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Table may not exist" }, { status: 500 });
    const rows: DbGrowthProposal[] = await r.json();
    return NextResponse.json({ success: true, proposals: rows });
  } catch { return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.title) return NextResponse.json({ success: false, error: "title required" }, { status: 400 });
  try {
    const r = await fetch(u + "/rest/v1/growth_proposals", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([b]) });
    if (!r.ok) return NextResponse.json({ success: false, error: "Insert failed" }, { status: 500 });
    const rows: DbGrowthProposal[] = await r.json();
    return NextResponse.json({ success: true, proposal: rows[0] || rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
