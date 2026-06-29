import { NextRequest, NextResponse } from "next/server";
import { normalizeWeb3GrowthDemand, dbEventToWeb3Event } from "@/lib/grointel/web3Api";
import { buildWeb3CollaborationBrief } from "@/lib/grointel/web3CollaborationBrief";
import { decideWeb3Growth } from "@/lib/grointel/web3Decision";
import { loadGrowthEvents } from "@/lib/grointel/worldMemory";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const demand = normalizeWeb3GrowthDemand(body);
    if (!demand.projectName || !demand.growthGoal) {
      return NextResponse.json({ success: false, error: "projectName and growthGoal are required" }, { status: 400 });
    }

    const eventMemory = await loadGrowthEvents(50);
    const events = eventMemory.events.map(dbEventToWeb3Event);
    const decision = decideWeb3Growth(demand, events);
    const brief = buildWeb3CollaborationBrief(demand, decision, Number(body.partnerLimit || 5));

    return NextResponse.json({
      success: true,
      demand,
      memory: {
        configured: eventMemory.configured,
        eventCount: events.length,
        error: eventMemory.error,
      },
      decisionSummary: {
        confidence: decision.confidence,
        partnerCount: decision.recommendedConcretePartners.length,
        topPartner: decision.recommendedConcretePartners[0]?.name,
      },
      brief,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
