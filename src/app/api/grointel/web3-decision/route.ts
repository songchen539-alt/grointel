import { NextRequest, NextResponse } from "next/server";
import { decideWeb3Growth, type Web3GrowthDemand } from "@/lib/grointel/web3Decision";
import { loadGrowthEvents } from "@/lib/grointel/worldMemory";
import type { Web3GrowthEvent } from "@/lib/grointel/web3World";

export const dynamic = "force-dynamic";

function normalizeDemand(body: any): Web3GrowthDemand {
  return {
    projectName: String(body.projectName || body.project_name || body.company || body.project || ""),
    website: body.website ? String(body.website) : undefined,
    sector: body.sector ? String(body.sector) : undefined,
    stage: body.stage ? String(body.stage) : undefined,
    growthGoal: String(body.growthGoal || body.growth_goal || body.goal || ""),
    targetAudience: body.targetAudience ? String(body.targetAudience) : body.target_audience ? String(body.target_audience) : undefined,
    riskTolerance: body.riskTolerance || body.risk_tolerance || "medium",
  };
}

function dbEventToWeb3Event(event: any): Web3GrowthEvent {
  if (event.projectIdentity) return event as Web3GrowthEvent;
  return {
    id: String(event.id),
    project: String(event.project || ""),
    projectIdentity: String(event.project_identity || ""),
    partner: String(event.partner || ""),
    partnerIdentity: String(event.partner_identity || ""),
    partnerType: event.partner_type || "kol",
    chainOrSector: String(event.chain_or_sector || "Web3"),
    eventDate: String(event.event_date || ""),
    outcome: event.outcome || "mixed",
    growthGoal: String(event.growth_goal || ""),
    collaborationFormat: String(event.collaboration_format || ""),
    observedResult: String(event.observed_result || ""),
    whyItWorkedOrFailed: Array.isArray(event.why_it_worked_or_failed) ? event.why_it_worked_or_failed : [],
    reusablePattern: String(event.reusable_pattern || ""),
    risks: Array.isArray(event.risks) ? event.risks : [],
    evidenceUrls: Array.isArray(event.evidence_urls) ? event.evidence_urls : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const demand = normalizeDemand(body);
    if (!demand.projectName || !demand.growthGoal) {
      return NextResponse.json({ success: false, error: "projectName and growthGoal are required" }, { status: 400 });
    }

    const eventMemory = await loadGrowthEvents(50);
    const events = eventMemory.events.map(dbEventToWeb3Event);
    const decision = decideWeb3Growth(demand, events);

    return NextResponse.json({
      success: true,
      demand,
      memory: {
        configured: eventMemory.configured,
        eventCount: events.length,
        error: eventMemory.error,
      },
      decision,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
