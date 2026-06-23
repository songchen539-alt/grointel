import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { loadGrowthEvents, seedGrowthEvents } from "@/lib/grointel/worldMemory";
import { WEB3_GROWTH_EVENTS, type Web3GrowthEvent } from "@/lib/grointel/web3World";

export const dynamic = "force-dynamic";

function normalizeEvent(body: any): Web3GrowthEvent {
  return {
    id: String(body.id || `web3.event.${Date.now()}`),
    project: String(body.project || ""),
    projectIdentity: String(body.projectIdentity || body.project_identity || ""),
    partner: String(body.partner || ""),
    partnerIdentity: String(body.partnerIdentity || body.partner_identity || ""),
    partnerType: body.partnerType || body.partner_type || "kol",
    chainOrSector: String(body.chainOrSector || body.chain_or_sector || "Web3"),
    eventDate: String(body.eventDate || body.event_date || new Date().toISOString().slice(0, 10)),
    outcome: body.outcome || "mixed",
    growthGoal: String(body.growthGoal || body.growth_goal || ""),
    collaborationFormat: String(body.collaborationFormat || body.collaboration_format || ""),
    observedResult: String(body.observedResult || body.observed_result || ""),
    whyItWorkedOrFailed: Array.isArray(body.whyItWorkedOrFailed) ? body.whyItWorkedOrFailed : Array.isArray(body.why_it_worked_or_failed) ? body.why_it_worked_or_failed : [],
    reusablePattern: String(body.reusablePattern || body.reusable_pattern || ""),
    risks: Array.isArray(body.risks) ? body.risks : [],
    evidenceUrls: Array.isArray(body.evidenceUrls) ? body.evidenceUrls : Array.isArray(body.evidence_urls) ? body.evidence_urls : [],
  };
}

export async function GET(req: NextRequest) {
  const limit = Number(new URL(req.url).searchParams.get("limit") || 50);
  const result = await loadGrowthEvents(Number.isFinite(limit) ? limit : 50);
  return NextResponse.json({ success: true, ...result });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.action === "seed") {
      const result = await seedGrowthEvents(WEB3_GROWTH_EVENTS);
      return NextResponse.json({ success: true, ...result });
    }

    const event = normalizeEvent(body);
    if (!event.project || !event.partner || !event.growthGoal) {
      return NextResponse.json({ success: false, error: "project, partner, and growthGoal are required" }, { status: 400 });
    }

    const supabase = getServerClient();
    if (!supabase) {
      return NextResponse.json({ success: true, configured: false, saved: false, event, error: "Supabase is not configured" });
    }

    const db = supabase as any;
    const { error } = await db.from("world_growth_events").upsert({
      id: event.id,
      industry: "web3",
      project: event.project,
      project_identity: event.projectIdentity,
      partner: event.partner,
      partner_identity: event.partnerIdentity,
      partner_type: event.partnerType,
      chain_or_sector: event.chainOrSector,
      event_date: event.eventDate,
      outcome: event.outcome,
      growth_goal: event.growthGoal,
      collaboration_format: event.collaborationFormat,
      observed_result: event.observedResult,
      why_it_worked_or_failed: event.whyItWorkedOrFailed,
      reusable_pattern: event.reusablePattern,
      risks: event.risks,
      evidence_urls: event.evidenceUrls,
      confidence: event.outcome === "success" ? 78 : event.outcome === "failure" ? 74 : 68,
      raw: event,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ success: true, configured: true, saved: false, event, error: error.message });
    }
    return NextResponse.json({ success: true, configured: true, saved: true, event });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
