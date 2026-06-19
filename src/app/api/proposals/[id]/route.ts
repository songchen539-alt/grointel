// GET /api/proposals/[id] — proposal detail with joins
// PATCH /api/proposals/[id] — partial update
import { NextRequest, NextResponse } from "next/server";
import { DbGrowthProposal } from "@/lib/db/types";

const VALID_STATUSES = ["draft", "under_review", "revised", "accepted", "rejected"];

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_proposals?select=*,business:business_entity_id(*),capability:capability_entity_id(*)&id=eq." + encodeURIComponent(id), { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const rows: DbGrowthProposal[] = await r.json();
    if (!rows[0]) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, proposal: rows[0] });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  // Validate status if provided
  if (b.status && !VALID_STATUSES.includes(b.status)) {
    return NextResponse.json({ success: false, error: "Invalid status. Must be: " + VALID_STATUSES.join(", ") }, { status: 400 });
  }
  try {
    const r = await fetch(u + "/rest/v1/growth_proposals?id=eq." + encodeURIComponent(id), { method: "PATCH", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify({ ...b, updated_at: new Date().toISOString() }) });
    if (!r.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const rows: DbGrowthProposal[] = await r.json();
    return NextResponse.json({ success: true, proposal: rows[0] || rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
