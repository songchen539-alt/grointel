// GroIntel Admin Quotes API
// GET /api/admin/quotes
// POST /api/admin/quotes

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbH() {
  return { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };
}

async function writeEvent(et: string, rid: string, md: Record<string, unknown>) {
  try {
    await fetch(supabaseUrl + "/rest/v1/report_events", {
      method: "POST", headers: { ...sbH(), "Prefer": "return=minimal" },
      body: JSON.stringify([{ report_id: rid || "growth_marketplace", event_type: et, metadata: { ...md, timestamp: new Date().toISOString() } }]),
    });
  } catch {}
}

export async function GET() {
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_quotes?select=*&order=created_at.desc", { headers: sbH(), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ success: false, error: "Table may not exist" }, { status: 500 });
    return NextResponse.json({ success: true, quotes: await res.json() });
  } catch {
    return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!body.quoteTitle || !body.matchId) return NextResponse.json({ success: false, error: "Quote title and match ID required" }, { status: 400 });

  const payload = {
    match_id: body.matchId,
    channel_id: body.channelId || null,
    company_growth_need_id: body.growthNeedId || null,
    quote_title: body.quoteTitle,
    quote_amount: body.quoteAmount || null,
    currency: body.currency || "USD",
    timeline: body.timeline || "",
    deliverables: body.deliverables || "",
    expected_growth_outcome: body.expectedGrowthOutcome || "",
    success_metrics: body.successMetrics || "",
    proposal_message: body.proposalMessage || "",
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_quotes", {
      method: "POST", headers: { ...sbH(), "Prefer": "return=representation" },
      body: JSON.stringify([payload]),
    });
    if (!res.ok) return NextResponse.json({ success: false, error: "Insert failed" }, { status: 500 });
    const rows = await res.json();
    const quote = rows[0] || rows;

    // Update match status
    if (body.matchId) {
      await fetch(supabaseUrl + "/rest/v1/growth_matches?id=eq." + encodeURIComponent(body.matchId), {
        method: "PATCH", headers: sbH(),
        body: JSON.stringify({ status: "quoted", updated_at: new Date().toISOString() }),
      });
    }

    writeEvent("growth_quote_created", body.reportId || "growth_marketplace", {
      quoteId: quote.id, matchId: body.matchId, growthNeedId: body.growthNeedId,
      channelId: body.channelId, quoteAmount: body.quoteAmount, currency: body.currency,
    });

    return NextResponse.json({ success: true, quote });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
