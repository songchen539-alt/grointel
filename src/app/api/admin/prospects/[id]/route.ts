// GroIntel Admin Prospect API
// GET/PATCH /api/admin/prospects/[id]
// Server-side only. Uses SUPABASE_SERVICE_ROLE_KEY.

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

const allowedFields = new Set([
  "status", "report_id", "outbound_message", "notes", "priority",
  "last_action_at", "updated_at", "target_person_name", "target_person_title",
  "target_person_email", "target_person_linkedin", "category",
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  }
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/prospects?select=*&id=eq." + encodeURIComponent(id), {
      headers: sbHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const data = await res.json();
    if (!data || data.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, prospect: data[0] });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Whitelist fields
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(body)) {
    if (allowedFields.has(key)) {
      updates[key] = body[key];
    }
  }

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/prospects?id=eq." + encodeURIComponent(id), {
      method: "PATCH",
      headers: { ...sbHeaders(), "Prefer": "return=representation" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const data = await res.json();
    return NextResponse.json({ success: true, prospect: data[0] || data });
  } catch {
    return NextResponse.json({ success: false, error: "Update error" }, { status: 500 });
  }
}
