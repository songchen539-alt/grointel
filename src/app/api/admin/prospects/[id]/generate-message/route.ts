// GroIntel Admin Prospect - Generate Message
// POST /api/admin/prospects/[id]/generate-message
// Generates outbound message from prospect data.

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

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
    if (!res.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const data = await res.json();
    if (!data || data.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    prospect = data[0];
  } catch {
    return NextResponse.json({ success: false, error: "Fetch error" }, { status: 500 });
  }

  if (!prospect.report_id) {
    return NextResponse.json({ success: false, error: "Please generate a report first." }, { status: 400 });
  }

  const companyName = prospect.company_name;
  const personName = prospect.target_person_name || "there";
  const category = prospect.category || "AI / SaaS / Web3";
  const reportId = prospect.report_id;
  const reportUrl = "https://grointel.vercel.app/report/view?id=" + reportId + "&prospectId=" + id;

  const subject = "Quick AI Growth MRI for " + companyName;
  const body = `Hi ${personName},

I put together a quick AI Growth MRI for ${companyName} based on public company signals.

It highlights growth readiness, market readiness, competitor pressure, hiring momentum, expansion readiness, key opportunities, and potential risks.

You can view it here:
${reportUrl}

A few reasons I thought this might be useful:

- Your company appears to be in a high-growth category: ${category}
- GroIntel can help leadership teams understand market signals before making growth decisions.
- The report gives a structured starting point for growth, sales, and expansion discussions.

If useful, I would be happy to walk through the findings and show how GroIntel can support your growth intelligence workflow.

Best,
GroIntel Team`;

  const fullMessage = `Subject: ${subject}\n\n${body}`;
  const now = new Date().toISOString();

  // Save to prospect
  try {
    await fetch(supabaseUrl + "/rest/v1/prospects?id=eq." + encodeURIComponent(id), {
      method: "PATCH",
      headers: sbHeaders(),
      body: JSON.stringify({
        outbound_message: fullMessage,
        last_action_at: now,
        updated_at: now,
      }),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, subject, body, fullMessage });
}
