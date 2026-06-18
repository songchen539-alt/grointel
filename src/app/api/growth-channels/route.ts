// GroIntel Growth Channels API - Public
// POST /api/growth-channels
// Accepts channel applications from /channels/apply form.

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
        report_id: "channel_application",
        event_type: "growth_channel_applied",
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

  if (!body.channelName || !body.website || !body.workEmail || !body.category || !body.serviceTypes || !body.growthOutcomes) {
    return NextResponse.json({ success: false, error: "Channel name, website, email, category, service types, and growth outcomes are required." }, { status: 400 });
  }

  const payload = {
    channel_name: body.channelName,
    website: body.website,
    domain: body.website ? body.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").toLowerCase() : "",
    category: body.category,
    region: body.region || "",
    service_types: body.serviceTypes ? [body.serviceTypes] : [],
    target_industries: body.targetIndustries ? [body.targetIndustries] : [],
    target_client_stage: body.targetClientStage ? [body.targetClientStage] : [],
    pricing_model: body.pricingModel || "",
    min_budget: body.minBudget || null,
    max_budget: body.maxBudget || null,
    currency: body.currency || "USD",
    growth_outcomes: body.growthOutcomes,
    case_studies: body.caseStudies || "",
    proof_links: body.proofLinks ? [body.proofLinks] : [],
    contact_name: body.contactName || "",
    contact_email: body.workEmail,
    claim_status: "submitted",
    verification_status: "pending",
    status: "new",
    notes: body.notes || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_channels", {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "return=minimal" },
      body: JSON.stringify([payload]),
    });
    if (!res.ok && res.status !== 409) {
      return NextResponse.json({ success: false, error: "Failed to save. Table may not exist." }, { status: 500 });
    }
    writeEvent({
      channelName: body.channelName,
      website: body.website,
      email: body.workEmail,
      source: "channels_apply_form",
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}
