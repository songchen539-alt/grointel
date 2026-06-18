// GET /api/admin/matches/[id]/events
// Returns channel_opportunity_events for this match

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const sbH = () => ({ "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/channel_opportunity_events?select=*&match_id=eq." + encodeURIComponent(id) + "&order=created_at.asc", { headers: sbH(), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ success: false, data: [] });
    return NextResponse.json({ success: true, events: await res.json() });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
