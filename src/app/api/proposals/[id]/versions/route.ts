// POST /api/proposals/[id]/versions — create a new version
import { NextRequest, NextResponse } from "next/server";
import { DbGrowthProposalVersion } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_proposal_versions?select=*&proposal_id=eq." + encodeURIComponent(id) + "&order=version.desc", { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const rows: DbGrowthProposalVersion[] = await r.json();
    return NextResponse.json({ success: true, versions: rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.snapshot) return NextResponse.json({ success: false, error: "snapshot required" }, { status: 400 });
  try {
    const body = { proposal_id: id, snapshot: b.snapshot, change_summary: b.change_summary || null, created_by: b.created_by || null, version: b.version || 1 };
    const r = await fetch(u + "/rest/v1/growth_proposal_versions", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([body]) });
    if (!r.ok) return NextResponse.json({ success: false, error: "Insert failed" }, { status: 500 });
    const rows: DbGrowthProposalVersion[] = await r.json();
    return NextResponse.json({ success: true, version: rows[0] || rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
