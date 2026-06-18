// POST /api/channel/opportunities/[matchId]/schedule-intro

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const sbH = () => ({ "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey });

export async function POST(_req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  if (!serviceKey) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let body; try { body = await _req.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!body.channelId) return NextResponse.json({ success: false, error: "channelId required" }, { status: 400 });

  const mRes = await fetch(supabaseUrl + "/rest/v1/growth_matches?select=id,channel_id,status&id=eq." + encodeURIComponent(matchId), { headers: sbH() });
  const mData = await mRes.json();
  if (!mData || mData.length === 0) return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
  if (mData[0].channel_id !== body.channelId) return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });

  const now = new Date().toISOString();

  await Promise.all([
    fetch(supabaseUrl + "/rest/v1/growth_matches?id=eq." + encodeURIComponent(matchId), {
      method: "PATCH", headers: sbH(),
      body: JSON.stringify({ status: "intro_scheduled", updated_at: now }),
    }),
    fetch(supabaseUrl + "/rest/v1/channel_opportunity_events", {
      method: "POST", headers: { ...sbH(), "Prefer": "return=minimal" },
      body: JSON.stringify([{ match_id: matchId, channel_id: body.channelId, event_type: "channel_scheduled_intro", note: body.note || "", metadata: { scheduledAt: body.scheduledAt || null }, created_at: now }]),
    }),
  ]);

  return NextResponse.json({ success: true });
}
