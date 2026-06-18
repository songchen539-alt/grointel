// GroIntel Reports API - Event Tracking
// POST /api/reports/event
// Writes audit events to Supabase report_events table.
// Used by client-side components for tracking page views and CTA clicks.

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: NextRequest) {
  let body: { reportId?: string; eventType?: string; metadata?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (!body.reportId || !body.eventType) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (!serviceKey || !supabaseUrl) {
    // Silently succeed in dev
    return NextResponse.json({ success: true });
  }

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/report_events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": "Bearer " + serviceKey,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify([{
        report_id: body.reportId,
        event_type: body.eventType,
        metadata: body.metadata || {},
      }]),
    });
    return NextResponse.json({ success: res.ok });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
