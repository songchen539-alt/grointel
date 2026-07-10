import { NextRequest, NextResponse } from "next/server";
import { buildDailyWeb3IngestionBatch, dailyCandidateToRealityTarget } from "@/lib/grointel/dailyIngestion";
import { fetchLiveWeb3DiscoveryCandidates } from "@/lib/grointel/liveDiscovery";
import { saveDailyIngestionBatch } from "@/lib/grointel/worldMemory";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized daily ingestion" }, { status: 401 });
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  const date = new Date().toISOString().slice(0, 10);
  const liveDiscovery = await fetchLiveWeb3DiscoveryCandidates({ demandLimit: 100, supplyLimit: 60, timeoutMs: 6000 });
  const batch = buildDailyWeb3IngestionBatch(date, 100, 100, liveDiscovery.candidates);
  const runtime = getGroIntelWorldRuntime();
  const runtimeIngestion = runtime.ingestTargets(batch.targets.map(dailyCandidateToRealityTarget), "daily_ingestion_cron");
  const memory = await saveDailyIngestionBatch(batch);
  const snapshot = runtime.snapshot();

  return NextResponse.json({
    success: true,
    mode: "run",
    batch: {
      id: batch.id,
      date: batch.date,
      demandCount: batch.demand.length,
      supplyCount: batch.supply.length,
      targetCount: batch.targets.length,
      sourceSummary: batch.sourceSummary,
    },
    liveDiscovery: {
      attempted: liveDiscovery.attempted,
      success: liveDiscovery.success,
      source: liveDiscovery.source,
      sourceUrl: liveDiscovery.sourceUrl,
      latencyMs: liveDiscovery.latencyMs,
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
        error: source.error,
      })),
      error: liveDiscovery.error,
    },
    runtimeIngestion,
    memory,
    world: {
      targetCount: snapshot.targets.length,
      web3DemandCount: snapshot.discovery.web3DemandCount,
      web3SupplyCount: snapshot.discovery.web3SupplyCount,
    },
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
