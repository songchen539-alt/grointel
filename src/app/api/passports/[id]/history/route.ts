// GET /api/passports/[id]/history
import { NextRequest, NextResponse } from "next/server";
import { DbGrowthCapabilityHistory } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "apikey": k, "Authorization": "Bearer " + k });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_capability_history?select=*&passport_id=eq." + encodeURIComponent(id) + "&order=created_at.desc", { headers: h(), cache: "no-store" });
    if (!r.ok) { const body = await r.text(); return NextResponse.json({ success: false, error: "Query failed: " + r.status + " " + body.slice(0,200) }, { status: 500 }); }
    const rows: DbGrowthCapabilityHistory[] = await r.json();
    return NextResponse.json({ success: true, history: rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
