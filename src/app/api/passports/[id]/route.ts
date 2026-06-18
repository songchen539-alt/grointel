/* eslint-disable @typescript-eslint/no-explicit-any */
// GroIntel Growth Passports Detail API
// GET/PATCH /api/passports/[id]

import { NextRequest, NextResponse } from "next/server";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });
const af = new Set(["headline", "description", "mission", "primary_industry", "primary_region", "company_size", "team_size", "year_founded", "pricing_level", "availability", "overall_completion", "secondary_industries", "service_regions"]);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_passports?select=*,entity:entity_id(*),capabilities:growth_capabilities(*),audiences:growth_audiences(*),channels:growth_channels_supported(*),case_studies:growth_case_studies(*),socials:growth_social_accounts(*),metrics:growth_metrics(*)" + "&id=eq." + encodeURIComponent(id), { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const rows = await r.json();
    if (!rows?.length) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, passport: rows[0] });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  const up: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(b)) { if (af.has(key)) up[key] = b[key]; }
  try {
    const r = await fetch(u + "/rest/v1/growth_passports?id=eq." + encodeURIComponent(id), { method: "PATCH", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify(up) });
    if (!r.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const rows = await r.json();
    return NextResponse.json({ success: true, passport: rows[0] || rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
