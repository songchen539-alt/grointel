import { NextRequest, NextResponse } from "next/server";
import { decideWeb3Growth, type Web3GrowthDemand } from "@/lib/grointel/web3Decision";
import { normalizeWeb3GrowthDemand, dbEventToWeb3Event } from "@/lib/grointel/web3Api";
import { generateWeb3AIGrowthInsight } from "@/lib/grointel/aiGrowthInsight";
import { loadGrowthEvents } from "@/lib/grointel/worldMemory";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const demand: Web3GrowthDemand = normalizeWeb3GrowthDemand(body);
    if (!demand.projectName || !demand.growthGoal) {
      return NextResponse.json({ success: false, error: "projectName and growthGoal are required" }, { status: 400 });
    }

    const eventMemory = await loadGrowthEvents(50);
    const events = eventMemory.events.map(dbEventToWeb3Event);
    const decision = decideWeb3Growth(demand, events);
    const aiInsight = await generateWeb3AIGrowthInsight(demand, decision);

    return NextResponse.json({
      success: true,
      demand,
      memory: {
        configured: eventMemory.configured,
        eventCount: events.length,
        error: eventMemory.error,
      },
      decision,
      aiInsight,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
