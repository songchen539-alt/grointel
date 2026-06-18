// GroIntel Admin Matches API
// GET /api/admin/matches
// POST /api/admin/matches

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbH() {
  return { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };
}

export async function GET() {
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_matches?select=*&order=created_at.desc", { headers: sbH(), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ success: false, error: "Table may not exist" }, { status: 500 });
    return NextResponse.json({ success: true, matches: await res.json() });
  } catch {
    return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  if (!body.companyGrowthNeedId || !body.channelId) {
    return NextResponse.json({ success: false, error: "Company growth need and channel are required" }, { status: 400 });
  }

  const payload = {
    company_growth_need_id: body.companyGrowthNeedId,
    channel_id: body.channelId,
    service_id: body.serviceId || null,
    match_score: body.matchScore || 70,
    recommended_solution_type: body.recommendedSolutionType || "",
    match_reason: body.matchReason || "",
    admin_notes: body.adminNotes || "",
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_matches", {
      method: "POST",
      headers: { ...sbH(), "Prefer": "return=representation" },
      body: JSON.stringify([payload]),
    });
    if (!res.ok) return NextResponse.json({ success: false, error: "Insert failed" }, { status: 500 });
    const rows = await res.json();
    const match = rows[0] || rows;
    return NextResponse.json({ success: true, match });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
