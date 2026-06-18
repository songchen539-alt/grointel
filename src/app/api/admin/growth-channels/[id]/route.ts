// GroIntel Admin Growth Channels Detail API
// GET /api/admin/growth-channels/[id]
// PATCH /api/admin/growth-channels/[id]

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbH() {
  return { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };
}

const allowedFields = new Set(["status", "verification_status", "claim_status", "notes", "category", "region", "pricing_model"]);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_channels?select=*&id=eq." + encodeURIComponent(id), { headers: sbH(), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const rows = await res.json();
    if (!rows || rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, channel: rows[0] });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(body)) {
    if (allowedFields.has(key)) updates[key] = body[key];
  }
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/growth_channels?id=eq." + encodeURIComponent(id), {
      method: "PATCH",
      headers: { ...sbH(), "Prefer": "return=representation" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const rows = await res.json();
    return NextResponse.json({ success: true, channel: rows[0] || rows });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
