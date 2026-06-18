// GroIntel Admin Channel Services API
// GET/POST /api/admin/channels/[id]/services

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbH() {
  return { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/channel_services?select=*&channel_id=eq." + encodeURIComponent(id) + "&order=created_at.desc", { headers: sbH(), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    return NextResponse.json({ success: true, services: await res.json() });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!body.serviceName || !body.serviceType) {
    return NextResponse.json({ success: false, error: "Service name and type required" }, { status: 400 });
  }

  const payload = {
    channel_id: id,
    service_name: body.serviceName,
    service_type: body.serviceType,
    problem_solved: body.problemSolved || "",
    growth_outcome: body.growthOutcome || "",
    deliverables: body.deliverables || "",
    timeline: body.timeline || "",
    pricing_model: body.pricingModel || "",
    starting_price: body.startingPrice || null,
    max_price: body.maxPrice || null,
    currency: body.currency || "USD",
    target_region: body.targetRegion || "",
    target_industry: body.targetIndustry || "",
    success_metrics: body.successMetrics || "",
    case_study: body.caseStudy || "",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/channel_services", {
      method: "POST",
      headers: { ...sbH(), "Prefer": "return=representation" },
      body: JSON.stringify([payload]),
    });
    if (!res.ok) { const body = await res.text(); return NextResponse.json({ success: false, error: "Insert failed: " + res.status + " " + body.slice(0, 200) }, { status: 500 }); }
    const rows = await res.json();
    return NextResponse.json({ success: true, service: rows[0] || rows });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
