// GroIntel Admin Prospect - Generate Report
// POST /api/admin/prospects/[id]/generate-report
// Generates MRI for a prospect, updates prospect record.

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://grointel.vercel.app";

function sbHeaders() {
  return {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": "Bearer " + serviceKey,
  };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  }

  // Fetch prospect
  let prospect;
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/prospects?select=*&id=eq." + encodeURIComponent(id), {
      headers: sbHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ success: false, error: "Prospect query failed" }, { status: 500 });
    const data = await res.json();
    if (!data || data.length === 0) return NextResponse.json({ success: false, error: "Prospect not found" }, { status: 404 });
    prospect = data[0];
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch prospect" }, { status: 500 });
  }

  // Generate report via local API
  try {
    const genRes = await fetch(baseUrl + "/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website: prospect.website }),
    });
    const genData = await genRes.json();
    if (!genData.success || !genData.reportId) {
      return NextResponse.json({ success: false, error: "Report generation failed" }, { status: 500 });
    }

    const reportId = genData.reportId;
    const now = new Date().toISOString();

    // Update prospect
    await fetch(supabaseUrl + "/rest/v1/prospects?id=eq." + encodeURIComponent(id), {
      method: "PATCH",
      headers: sbHeaders(),
      body: JSON.stringify({
        report_id: reportId,
        status: "report_generated",
        last_action_at: now,
        updated_at: now,
      }),
    });

    // Write event
    await fetch(supabaseUrl + "/rest/v1/report_events", {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "return=minimal" },
      body: JSON.stringify([{
        report_id: reportId,
        event_type: "prospect_report_generated",
        metadata: {
          prospectId: id,
          companyName: prospect.company_name,
          website: prospect.website,
          timestamp: now,
        },
      }]),
    });

    return NextResponse.json({
      success: true,
      reportId,
      redirectUrl: "/report/view?id=" + reportId + "&prospectId=" + id,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Report generation failed" }, { status: 500 });
  }
}
