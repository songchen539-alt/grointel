import { NextResponse } from "next/server";
import { getAIGatewayStatus } from "@/lib/ai/gateway/status";
import { buildDailyWeb3IngestionBatch } from "@/lib/grointel/dailyIngestion";
import { fetchLiveWeb3DiscoveryCandidates } from "@/lib/grointel/liveDiscovery";
import { getGroIntelLifeStatus } from "@/lib/grointel/lifeStatus";
import { dailySupplyCandidatesToProfiles, decideWeb3Growth } from "@/lib/grointel/web3Decision";
import { WEB3_GROWTH_EVENTS } from "@/lib/grointel/web3World";
import { loadWorldMemorySummary } from "@/lib/grointel/worldMemory";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";

export const dynamic = "force-dynamic";

function qualitySummary(candidates: any[] = []) {
  const scored = candidates.filter((candidate) => typeof candidate.liveQualityScore === "number");
  const highQuality = scored.filter((candidate) => candidate.liveQualityScore >= 70);
  const coveredSources = new Set(scored.flatMap((candidate) => candidate.liveSourceCoverage || []));
  return {
    scoredCount: scored.length,
    highQualityCount: highQuality.length,
    avgLiveQualityScore: scored.length > 0
      ? Math.round(scored.reduce((sum, candidate) => sum + candidate.liveQualityScore, 0) / scored.length)
      : 0,
    coveredSources: coveredSources.size,
  };
}

function gate(state: boolean, summary: string, evidence: Record<string, unknown> = {}) {
  return {
    state: state ? "pass" : "warn",
    summary,
    evidence,
  };
}

export async function GET() {
  const startedAt = Date.now();
  const [ai, memory, liveDiscovery] = await Promise.all([
    getAIGatewayStatus(),
    loadWorldMemorySummary(20),
    fetchLiveWeb3DiscoveryCandidates({ demandLimit: 100, supplyLimit: 60, timeoutMs: 6000 }),
  ]);
  const daily = buildDailyWeb3IngestionBatch(new Date().toISOString().slice(0, 10), 100, 100, liveDiscovery.candidates);
  const runtime = getGroIntelWorldRuntime();
  const world = runtime.snapshot();
  const liveQuality = qualitySummary(liveDiscovery.candidates);
  const liveSupplyProfiles = dailySupplyCandidatesToProfiles(liveDiscovery.candidates);
  const decision = decideWeb3Growth({
    projectName: "GroIntel Operator Probe",
    sector: "Ethereum L2 / DeFi",
    growthGoal: "Acquire real users through media education, KOL partnerships, and research-led growth",
    targetAudience: "crypto-native builders and DeFi users",
    riskTolerance: "low",
  }, WEB3_GROWTH_EVENTS, liveSupplyProfiles);
  const liveMatches = decision.recommendedConcretePartners.filter((partner) => String(partner.source || "").endsWith("_live"));

  const gates = {
    delivery: gate(
      ai.mode === "real_ai_active" &&
      daily.demand.length >= 100 &&
      daily.supply.length >= 100 &&
      liveDiscovery.demandCandidateCount >= 50 &&
      liveDiscovery.supplyCandidateCount >= 20 &&
      liveMatches.length > 0,
      "Core delivery gates for real AI, daily 100+100 ingestion, live discovery, and company-to-supply matching.",
      {
        aiMode: ai.mode,
        demandBatch: daily.demand.length,
        supplyBatch: daily.supply.length,
        liveDemand: liveDiscovery.demandCandidateCount,
        liveSupply: liveDiscovery.supplyCandidateCount,
        liveMatches: liveMatches.length,
      },
    ),
    quality: gate(
      liveQuality.highQualityCount >= 50 && liveQuality.coveredSources >= 5,
      "Live discovery quality scoring and source coverage.",
      liveQuality,
    ),
    memory: gate(
      memory.recentObservations.length > 0 &&
      memory.entityMemories.length > 0 &&
      memory.decisionMemories.length > 0 &&
      memory.evolutionMemories.length > 0,
      "Four-layer memory is available through primary memory or legacy projection.",
      {
        observations: memory.recentObservations.length,
        entityMemories: memory.entityMemories.length,
        decisionMemories: memory.decisionMemories.length,
        evolutionMemories: memory.evolutionMemories.length,
        latestMemoryAt: memory.latestRun?.created_at || memory.latestRun?.observed_at || null,
      },
    ),
  };
  const status = Object.values(gates).every((item) => item.state === "pass") ? "ready" : "degraded";

  return NextResponse.json({
    success: true,
    status,
    generatedAt: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
    life: getGroIntelLifeStatus(),
    gates,
    ai: {
      mode: ai.mode,
      chat: ai.active.chat,
      json: ai.active.json,
      deepseekConfigured: ai.configured.deepseek,
    },
    dailyIngestion: {
      demandCount: daily.demand.length,
      supplyCount: daily.supply.length,
      sourceSummary: daily.sourceSummary,
    },
    liveDiscovery: {
      success: liveDiscovery.success,
      demandCandidateCount: liveDiscovery.demandCandidateCount,
      supplyCandidateCount: liveDiscovery.supplyCandidateCount,
      candidateCount: liveDiscovery.candidateCount,
      rawCount: liveDiscovery.rawCount,
      qualitySummary: liveQuality,
      sources: liveDiscovery.sources.map((source) => ({
        source: source.source,
        side: source.side,
        success: source.success,
        rawCount: source.rawCount,
        candidateCount: source.candidateCount,
        error: source.error || null,
      })),
    },
    matching: {
      liveSupplyProfiles: liveSupplyProfiles.length,
      liveMatches: liveMatches.length,
      topLiveMatch: liveMatches[0] ? {
        name: liveMatches[0].name,
        identity: liveMatches[0].identity,
        supplyType: liveMatches[0].supplyType,
        fitScore: liveMatches[0].fitScore,
        source: liveMatches[0].source,
        liveQualityScore: liveMatches[0].liveQualityScore,
        audienceFit: liveMatches[0].audienceFit,
        recommendedAction: liveMatches[0].recommendedAction,
        measurement: liveMatches[0].measurement,
        riskControl: liveMatches[0].riskControl,
      } : null,
    },
    world: {
      targetCount: world.targets.length,
      web3DemandCount: world.discovery.web3DemandCount,
      web3SupplyCount: world.discovery.web3SupplyCount,
      lastObservedAt: world.lastObservedAt,
      tickCount: world.tickCount,
    },
  });
}
