// GroIntel Admin Growth Needs API
// GET /api/admin/growth-needs
// GET /api/admin/growth-needs/[id]
// PATCH /api/admin/growth-needs/[id]

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbH() {
  return { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };
}

export async function GET() {
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/company_growth_needs?select=*&order=created_at.desc", { headers: sbH(), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ success: false, error: "Table may not exist" }, { status: 500 });
    return NextResponse.json({ success: true, needs: await res.json() });
  } catch {
    return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
  }
}
