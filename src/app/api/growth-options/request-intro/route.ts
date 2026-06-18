// GroIntel Growth Options API - Request Introduction
// POST /api/growth-options/request-intro

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbH() {
  return { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };
}

async function writeEvent(rid: string, et: string, md: Record<string, unknown>) {
  try {
    await fetch(supabaseUrl + "/rest/v1/report_events", {
      method: "POST", headers: { ...sbH(), "Prefer": "return=minimal" },
      body: JSON.stringify([{ report_id: rid || "growth_marketplace", event_type: et, metadata: { ...md, timestamp: new Date().toISOString() } }]),
    });
  } catch {}
}

export async function POST(request: NextRequest) {
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: "Server configuration error." }, { status: 500 });
  }

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }
  if (!body.needId || !body.matchId || !body.quoteId) {
    return NextResponse.json({ success: false, error: "needId, matchId, and quoteId are required." }, { status: 400 });
  }

  // Update quote status
  try {
    await fetch(supabaseUrl + "/rest/v1/growth_quotes?id=eq." + encodeURIComponent(body.quoteId), {
      method: "PATCH", headers: sbH(),
      body: JSON.stringify({ status: "accepted", updated_at: new Date().toISOString() }),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update quote." }, { status: 500 });
  }

  // Update match status
  try {
    await fetch(supabaseUrl + "/rest/v1/growth_matches?id=eq." + encodeURIComponent(body.matchId), {
      method: "PATCH", headers: sbH(),
      body: JSON.stringify({ status: "company_interested", updated_at: new Date().toISOString() }),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update match." }, { status: 500 });
  }

  // Get need for report_id
  let reportId = "growth_marketplace";
  let companyName = "";
  let website = "";
  try {
    const nr = await fetch(supabaseUrl + "/rest/v1/company_growth_needs?select=company_name,website,report_id&id=eq." + encodeURIComponent(body.needId), { headers: sbH() });
    const nrows = await nr.json();
    if (nrows && nrows.length > 0) {
      reportId = nrows[0].report_id || "growth_marketplace";
      companyName = nrows[0].company_name || "";
      website = nrows[0].website || "";
    }
  } catch {}

  writeEvent(reportId, "growth_intro_requested", {
    needId: body.needId, matchId: body.matchId, quoteId: body.quoteId,
    companyName, website,
  });

  return NextResponse.json({ success: true });
}
