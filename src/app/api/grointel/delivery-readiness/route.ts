import { NextRequest, NextResponse } from "next/server";
import { getAIGatewayStatus } from "@/lib/ai/gateway/status";
import { getGroIntelLifeStatus } from "@/lib/grointel/lifeStatus";
import { buildDailyWeb3IngestionBatch } from "@/lib/grointel/dailyIngestion";
import { fetchLiveWeb3DiscoveryCandidates } from "@/lib/grointel/liveDiscovery";
import { dailySupplyCandidatesToProfiles, decideWeb3Growth } from "@/lib/grointel/web3Decision";
import { web3DiscoveryStats } from "@/lib/grointel/web3Discovery";
import { loadWorldMemorySummary, saveWorldMemory, seedGrowthEvents } from "@/lib/grointel/worldMemory";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";
import { WEB3_GROWTH_EVENTS } from "@/lib/grointel/web3World";

export const dynamic = "force-dynamic";

type ReadinessState = "pass" | "warn" | "fail";

function readinessCheck(
  key: string,
  state: ReadinessState,
  summary: string,
  evidence: Record<string, unknown> = {},
  action: string | null = null,
) {
  return { key, state, summary, evidence, action };
}

function overallStatus(checks: ReturnType<typeof readinessCheck>[]) {
  if (checks.some((check) => check.state === "fail")) return "blocked";
  if (checks.some((check) => check.state === "warn")) return "degraded";
  return "ready";
}

function scoreChecks(checks: ReturnType<typeof readinessCheck>[]) {
  if (checks.length === 0) return 0;
  const points = checks.reduce((sum, check) => {
    if (check.state === "pass") return sum + 1;
    if (check.state === "warn") return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((points / checks.length) * 100);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldObserve = searchParams.get("observe") === "1";
    const limit = Number(searchParams.get("limit") || 3);
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 10)) : 3;

    const runtime = getGroIntelWorldRuntime();
    const world = shouldObserve ? await runtime.observeTargets(safeLimit) : runtime.snapshot();
    const memorySave = shouldObserve ? await saveWorldMemory(world, "delivery_readiness") : null;
    const growthEventSeed = shouldObserve ? await seedGrowthEvents() : null;
    const [ai, memory, liveDiscovery] = await Promise.all([
      getAIGatewayStatus(),
      loadWorldMemorySummary(20),
      fetchLiveWeb3DiscoveryCandidates({ demandLimit: 100, supplyLimit: 60, timeoutMs: 4500 }),
    ]);
    const dailyIngestion = buildDailyWeb3IngestionBatch(new Date().toISOString().slice(0, 10), 100, 100, liveDiscovery.candidates);
    const liveSupplyProfiles = dailySupplyCandidatesToProfiles(liveDiscovery.candidates);
    const liveProbeDecision = decideWeb3Growth({
      projectName: "GroIntel Readiness Probe",
      sector: "Ethereum L2 / DeFi",
      growthGoal: "Acquire real users through media education, KOL partnerships, and research-led growth",
      targetAudience: "crypto-native builders and DeFi users",
      riskTolerance: "low",
    }, WEB3_GROWTH_EVENTS, liveSupplyProfiles);
    const liveSupplyMatchCount = liveProbeDecision.recommendedConcretePartners.filter((partner) => partner.source === "web3_media_feeds_live").length;
    const liveDemandMatchCount = liveDiscovery.candidates.filter((candidate) => candidate.side === "demand" && candidate.source === "defillama_live").length;
    const discovery = web3DiscoveryStats(world.targets);
    const life = getGroIntelLifeStatus();

    const latestMemoryAt = String(memory.latestRun?.created_at || memory.latestRun?.observed_at || "");
    const hasPersistentObservation = Boolean(latestMemoryAt || memory.recentObservations.length > 0);
    const hasFourLayerMemory =
      memory.recentObservations.length > 0 &&
      memory.entityMemories.length > 0 &&
      memory.decisionMemories.length > 0 &&
      memory.evolutionMemories.length > 0;
    const hasGrowthEvents = memory.growthEvents.length > 0;

    const checks = [
      readinessCheck(
        "real_ai",
        ai.mode === "real_ai_active" ? "pass" : ai.mode === "fallback_ready" ? "warn" : "fail",
        ai.mode === "real_ai_active"
          ? "Real generative AI is connected for GroIntel reasoning."
          : "GroIntel can respond, but real AI is not fully active.",
        { mode: ai.mode, chat: ai.active.chat, json: ai.active.json, deepseekConfigured: ai.configured.deepseek },
        "Verify DEEPSEEK_API_KEY or OPENAI_API_KEY and AI_CHAT_PROVIDER / AI_JSON_PROVIDER.",
      ),
      readinessCheck(
        "web3_demand_pool",
        discovery.web3DemandCount >= 40 ? "pass" : discovery.web3DemandCount >= 15 ? "warn" : "fail",
        "Web3 company demand pool is available for growth matching.",
        { demandCount: discovery.web3DemandCount },
        "Expand Web3 company discovery targets.",
      ),
      readinessCheck(
        "web3_supply_pool",
        discovery.web3SupplyCount >= 30 ? "pass" : discovery.web3SupplyCount >= 12 ? "warn" : "fail",
        "Web3 KOL and partner supply pool is available for matching.",
        { supplyCount: discovery.web3SupplyCount },
        "Expand KOL, media, community, launchpad, and ecosystem partner supply targets.",
      ),
      readinessCheck(
        "reality_loop",
        world.tickCount > 0 || hasPersistentObservation ? "pass" : "warn",
        "GroIntel has a reality loop through heartbeat/manual observation.",
        {
          tickCount: world.tickCount,
          lastObservedAt: world.lastObservedAt,
          latestMemoryAt: latestMemoryAt || null,
          cronSchedule: life.cronSchedule,
          manualTickPath: life.manualTickPath,
        },
        "Run /api/grointel/heartbeat?limit=2 or call this endpoint with ?observe=1.",
      ),
      readinessCheck(
        "memory_persistence",
        memory.configured && hasPersistentObservation ? "pass" : memory.configured ? "warn" : "fail",
        "World observations are persisted or projected from the connected memory layer.",
        {
          configured: memory.configured,
          latestMemoryAt: latestMemoryAt || null,
          observations: memory.recentObservations.length,
          signals: memory.recentSignals.length,
          evidence: memory.recentEvidence.length,
          legacyProjection: Boolean(memory.error),
          memoryError: memory.error,
          saveError: memorySave?.error || null,
        },
        "Apply the primary world memory migration or inspect /api/grointel/world-memory-migration.",
      ),
      readinessCheck(
        "four_layer_memory",
        hasFourLayerMemory ? "pass" : memory.entityMemories.length + memory.decisionMemories.length + memory.evolutionMemories.length > 0 ? "warn" : "fail",
        "Four-layer memory is visible: raw observation, entity memory, decision memory, and evolution memory.",
        {
          l1Observations: memory.recentObservations.length,
          l2EntityMemories: memory.entityMemories.length,
          l3DecisionMemories: memory.decisionMemories.length,
          l4EvolutionMemories: memory.evolutionMemories.length,
        },
        "Verify world memory tables or legacy projection output.",
      ),
      readinessCheck(
        "growth_event_memory",
        hasGrowthEvents ? "pass" : "fail",
        "Historical Web3 growth events are available for success/failure pattern matching.",
        { growthEvents: memory.growthEvents.length, seedSaved: growthEventSeed?.saved || null, seedError: growthEventSeed?.error || null },
        "Seed Web3 growth event memory.",
      ),
      readinessCheck(
        "daily_100_100_ingestion",
        dailyIngestion.demand.length >= 100 && dailyIngestion.supply.length >= 100 ? "pass" : "fail",
        "GroIntel has a daily ingestion batch capable of putting 100 Web3 demand entities and 100 Web3 KOL/supply entities into the system.",
        {
          demandBatchSize: dailyIngestion.demand.length,
          supplyBatchSize: dailyIngestion.supply.length,
          endpoint: "/api/grointel/daily-ingestion?run=1",
        },
        "Expand daily ingestion candidates and run the daily ingestion endpoint.",
      ),
      readinessCheck(
        "global_discovery_sources",
        dailyIngestion.sourceSummary.registeredSources >= 12 && dailyIngestion.sourceSummary.avgDiscoveryScore >= 70 ? "pass" : "warn",
        "GroIntel has a registered global Web3 source map and scores daily candidates by source coverage, freshness, and relevance.",
        dailyIngestion.sourceSummary,
        "Add more active discovery sources and source-backed candidate extraction.",
      ),
      readinessCheck(
        "live_discovery_connector",
        liveDiscovery.success && liveDiscovery.demandCandidateCount >= 50 && liveDiscovery.supplyCandidateCount >= 1 ? "pass" : "warn",
        liveDiscovery.success
          ? "GroIntel is actively pulling real Web3 demand and supply candidates from live external sources."
          : "GroIntel can fall back to its bootstrap pool, but live sources are temporarily unavailable.",
        {
          source: liveDiscovery.source,
          sourceUrl: liveDiscovery.sourceUrl,
          success: liveDiscovery.success,
          rawCount: liveDiscovery.rawCount,
          candidateCount: liveDiscovery.candidateCount,
          demandCandidateCount: liveDiscovery.demandCandidateCount,
          supplyCandidateCount: liveDiscovery.supplyCandidateCount,
          sources: liveDiscovery.sources.map((source) => ({
            source: source.source,
            side: source.side,
            success: source.success,
            rawCount: source.rawCount,
            candidateCount: source.candidateCount,
            latencyMs: source.latencyMs,
            error: source.error || null,
          })),
          latencyMs: liveDiscovery.latencyMs,
          error: liveDiscovery.error || null,
        },
        "Check DefiLlama/media feed connectivity or add the next live Web3 source connector.",
      ),
      readinessCheck(
        "bidirectional_live_matching",
        liveSupplyMatchCount > 0 && liveDemandMatchCount >= 50 ? "pass" : "warn",
        "GroIntel can match company demand to live supply and KOL/media supply back to live company demand.",
        {
          companyToLiveSupplyMatches: liveSupplyMatchCount,
          supplyToLiveDemandMatches: liveDemandMatchCount,
          endpoint: "/api/grointel/bidirectional-matching-readiness",
        },
        "Inspect /api/grointel/bidirectional-matching-readiness and tune live matching if either direction weakens.",
      ),
    ];

    const status = overallStatus(checks);
    const readyForDelivery = status !== "blocked";

    return NextResponse.json({
      success: true,
      status,
      readyForDelivery,
      score: scoreChecks(checks),
      generatedAt: new Date().toISOString(),
      summary: readyForDelivery
        ? "GroIntel is connected enough to deliver the company-to-Web3-KOL growth matching flow."
        : "GroIntel has blocking readiness gaps before delivery.",
      productPromise: "A company enters one identity, GroIntel understands growth state and matches KOL/partner supply; a KOL enters one identity, GroIntel understands supply capability and matches companies.",
      checks,
      operatingMode: {
        life,
        observeOnRequest: shouldObserve,
        memorySavedOnRequest: memorySave?.saved || false,
      },
      counts: {
        runtimeTargets: world.targets.length,
        web3Demand: discovery.web3DemandCount,
        web3Supply: discovery.web3SupplyCount,
        recentObservations: memory.recentObservations.length,
        recentSignals: memory.recentSignals.length,
        recentEvidence: memory.recentEvidence.length,
        entityMemories: memory.entityMemories.length,
        decisionMemories: memory.decisionMemories.length,
        evolutionMemories: memory.evolutionMemories.length,
        growthEvents: memory.growthEvents.length,
        dailyDemandBatch: dailyIngestion.demand.length,
        dailySupplyBatch: dailyIngestion.supply.length,
        discoverySources: dailyIngestion.sourceSummary.registeredSources,
        activeDiscoverySources: dailyIngestion.sourceSummary.activeSources,
        avgDailyDiscoveryScore: dailyIngestion.sourceSummary.avgDiscoveryScore,
        liveDiscoveryCandidates: liveDiscovery.candidateCount,
        liveDemandDiscoveryCandidates: liveDiscovery.demandCandidateCount,
        liveSupplyDiscoveryCandidates: liveDiscovery.supplyCandidateCount,
        liveDiscoveryRawCount: liveDiscovery.rawCount,
        companyToLiveSupplyMatches: liveSupplyMatchCount,
        supplyToLiveDemandMatches: liveDemandMatchCount,
      },
      nextActions: checks.filter((check) => check.state !== "pass").map((check) => ({
        key: check.key,
        action: check.action,
      })),
      verificationPaths: [
        "/api/grointel/ai-health",
        "/api/grointel/web3-discovery?limit=5",
        "/api/grointel/daily-ingestion?live=1",
        "/api/grointel/bidirectional-matching-readiness",
        "/api/grointel/world-memory-migration",
        "/api/grointel/heartbeat?limit=2",
        "/api/grointel/world?limit=2",
        "/api/grointel/identity-intake",
        "/api/grointel/web3-decision",
        "/api/grointel/web3-collaboration-brief",
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, status: "blocked", error: error.message || "Readiness check failed" }, { status: 500 });
  }
}
