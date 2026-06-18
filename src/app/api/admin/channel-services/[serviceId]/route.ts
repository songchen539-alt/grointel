// GroIntel Admin Channel Service Detail API
// PATCH /api/admin/channel-services/[serviceId]

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbH() {
  return { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };
}

const allowedFields = new Set(["status", "service_name", "service_type", "problem_solved", "growth_outcome", "pricing_model", "starting_price", "max_price", "updated_at"]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(body)) {
    if (allowedFields.has(key)) updates[key] = body[key];
  }
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/channel_services?id=eq." + encodeURIComponent(serviceId), {
      method: "PATCH",
      headers: { ...sbH(), "Prefer": "return=representation" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const rows = await res.json();
    return NextResponse.json({ success: true, service: rows[0] || rows });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
