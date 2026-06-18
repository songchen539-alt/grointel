// GroIntel Growth Needs API - Public
// POST /api/growth-needs
// Accepts company growth need submissions from /growth-options form.

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

async function writeEvent(metadata: Record<string, unknown>) {
  try {
    await fetch(supabaseUrl + "/rest/v1/report_events", {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "return=minimal" },
      body: JSON.stringify([{
        report_id: (metadata.reportId as string) || "unknown",
        event_type: "growth_need_submitted",
        metadata: { ...metadata, timestamp: new Date().toISOString() },
      }]),
    });
  } catch {}
}

export async function POST(request: NextRequest) {
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: "Server configuration error." }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.companyName || !body.website || !body.workEmail || !body.growthGoal || !body.currentChallenge) {
    return NextResponse.json({ success: false, error: "Company name, website, email, growth goal, and current challenge are required." }, { status: 400 });
  }

  const payload = {
    company_name: body.companyName,
    website: body.website,
    report_id: body.reportId || "",
    contact_name: body.contactName || "",
    contact_email: body.workEmail,
    growth_goal: body.growthGoal,
    target_market: body.targetMarket || "",
    target_customer: body.targetCustomer || "",
    current_challenge: body.currentChallenge,
    budget_min: body.budgetMin || null,
    budget_max: body.budgetMax || null,
    currency: body.currency || "USD",
    timeline: body.timeline || "",
    preferred_channels: body.preferredChannels ? [body.preferredChannels] : [],
    notes: body.notes || "",
    status: "new",
    source: "growth_options_form",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/company_growth_needs", {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "return=minimal" },
      body: JSON.stringify([payload]),
    });
    if (!res.ok && res.status !== 409) {
      return NextResponse.json({ success: false, error: "Failed to save. Table may not exist." }, { status: 500 });
    }
    writeEvent({
      companyName: body.companyName,
      website: body.website,
      email: body.workEmail,
      reportId: body.reportId || "unknown",
      source: "growth_options_form",
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}
