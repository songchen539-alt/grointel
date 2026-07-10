import { NextRequest, NextResponse } from "next/server";
import { dailySupplyCandidatesToProfiles, decideWeb3Growth, type Web3GrowthDemand } from "@/lib/grointel/web3Decision";
import { normalizeWeb3GrowthDemand, dbEventToWeb3Event } from "@/lib/grointel/web3Api";
import { generateWeb3AIGrowthInsight } from "@/lib/grointel/aiGrowthInsight";
import { fetchLiveWeb3DiscoveryCandidates } from "@/lib/grointel/liveDiscovery";
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
    const includeLive = body.liveSupply !== false;
    const liveDiscovery = includeLive
      ? await fetchLiveWeb3DiscoveryCandidates({ demandLimit: 1, supplyLimit: 40, timeoutMs: 5000 })
      : null;
    const liveSupplyProfiles = dailySupplyCandidatesToProfiles(liveDiscovery?.candidates || []);
    const decision = decideWeb3Growth(demand, events, liveSupplyProfiles);
    const aiInsight = await generateWeb3AIGrowthInsight(demand, decision);

    return NextResponse.json({
      success: true,
      demand,
      memory: {
        configured: eventMemory.configured,
        eventCount: events.length,
        error: eventMemory.error,
      },
      liveMatching: liveDiscovery
        ? {
            attempted: liveDiscovery.attempted,
            success: liveDiscovery.success,
            supplyCandidateCount: liveDiscovery.supplyCandidateCount,
            injectedSupplyProfiles: liveSupplyProfiles.length,
            sources: liveDiscovery.sources.map((source) => ({
              source: source.source,
              side: source.side,
              success: source.success,
              candidateCount: source.candidateCount,
              rawCount: source.rawCount,
              error: source.error,
            })),
          }
        : { attempted: false, success: false, supplyCandidateCount: 0, injectedSupplyProfiles: 0, sources: [] },
      decision,
      aiInsight,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
