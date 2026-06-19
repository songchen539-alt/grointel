// GET /api/proposals/[id]/comments — list comments
// POST /api/proposals/[id]/comments — add comment
import { NextRequest, NextResponse } from "next/server";
import { DbGrowthProposalComment } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_proposal_comments?select=*&proposal_id=eq." + encodeURIComponent(id) + "&order=created_at.asc", { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const rows: DbGrowthProposalComment[] = await r.json();
    return NextResponse.json({ success: true, comments: rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.comment) return NextResponse.json({ success: false, error: "comment required" }, { status: 400 });
  try {
    const body = { proposal_id: id, comment: b.comment, author_type: b.author_type || "human", author_name: b.author_name || "Anonymous" };
    const r = await fetch(u + "/rest/v1/growth_proposal_comments", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([body]) });
    if (!r.ok) return NextResponse.json({ success: false, error: "Insert failed" }, { status: 500 });
    const rows: DbGrowthProposalComment[] = await r.json();
    return NextResponse.json({ success: true, comment: rows[0] || rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
