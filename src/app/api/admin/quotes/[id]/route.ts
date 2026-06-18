// GroIntel Admin Quote Detail API
// GET/PATCH /api/admin/quotes/[id]

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbH() {
  return { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };
}

const allowedFields = new Set(["status", "proposal_message", "deliverables", "expected_growth_outcome", "success_metrics", "quote_amount", "timeline", "quote_title", "updated_at"]);

async function writeEvent(et: string, rid: string, md: Record<string, unknown>) {
  try {
    await fetch(supabaseUrl + "/rest/v1/report_events", {
      method: "POST", headers: { ...sbH(), "Prefer": "return=minimal" },
      body: JSON.stringify([{ report_id: rid || "growth_marketplace", event_type: et, metadata: { ...md, timestamp: new Date().toISOString() } }]),
    });
  } catch {}
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_quotes?select=*&id=eq." + encodeURIComponent(id), { headers: sbH(), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const rows = await res.json();
    if (!rows || rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, quote: rows[0] });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  
  // Fetch current quote for old status
  let oldStatus = "";
  try {
    const old = await fetch(supabaseUrl + "/rest/v1/growth_quotes?select=id,status&id=eq." + encodeURIComponent(id), { headers: sbH() });
    const oldRows = await old.json();
    oldStatus = oldRows[0]?.status || "";
  } catch {}

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(body)) {
    if (allowedFields.has(key)) updates[key] = body[key];
  }

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_quotes?id=eq." + encodeURIComponent(id), {
      method: "PATCH", headers: { ...sbH(), "Prefer": "return=representation" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const rows = await res.json();
    const quote = rows[0] || rows;

    // Write status change event
    const newStatus = updates.status as string;
    if (newStatus && newStatus !== oldStatus) {
      writeEvent("growth_quote_status_updated", quote.report_id || "growth_marketplace", {
        quoteId: id, oldStatus, newStatus, matchId: quote.match_id,
      });

      // Auto-sync match status
      if (quote.match_id) {
        let matchStatus = "";
        if (newStatus === "shared_with_company") matchStatus = "proposed_to_company";
        else if (newStatus === "accepted") matchStatus = "company_interested";
        if (matchStatus) {
          await fetch(supabaseUrl + "/rest/v1/growth_matches?id=eq." + encodeURIComponent(quote.match_id), {
            method: "PATCH", headers: sbH(),
            body: JSON.stringify({ status: matchStatus, updated_at: new Date().toISOString() }),
          });
        }
      }
    }

    return NextResponse.json({ success: true, quote });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
