// GET /api/passports/[id]/audience-dna
import { NextRequest, NextResponse } from "next/server";
const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "apikey": k, "Authorization": "Bearer " + k });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_audience_dna?select=*&passport_id=eq." + encodeURIComponent(id), { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Query failed: " + r.status }, { status: 500 });
    const rows = await r.json();
    return NextResponse.json({ success: true, audienceDna: rows[0] || null });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
