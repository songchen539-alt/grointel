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

function positiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value || fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}

function liveQualitySummary(candidates: any[] = []) {
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
    samples: highQuality.slice(0, 5).map((candidate) => ({
      name: candidate.name,
      side: candidate.side,
      source: candidate.source,
      liveQualityScore: candidate.liveQualityScore,
      liveSourceCoverage: candidate.liveSourceCoverage || [],
    })),
  };
}

async function run(req: NextRequest, body?: any) {
  if (!isAuthorized(req)) return unauthorized();

  const url = new URL(req.url);
  const shouldRun = url.searchParams.get("run") === "1" || body?.run === true;
  const includeLive = url.searchParams.get("live") !== "0" && body?.live !== false;
  const date = String(body?.date || url.searchParams.get("date") || new Date().toISOString().slice(0, 10));
  const demandTarget = positiveInt(String(body?.demandTarget || url.searchParams.get("demandTarget") || ""), 100, 200);
  const supplyTarget = positiveInt(String(body?.supplyTarget || url.searchParams.get("supplyTarget") || ""), 100, 200);
  const liveDiscovery = includeLive
    ? await fetchLiveWeb3DiscoveryCandidates({
        demandLimit: Math.max(60, Math.min(120, demandTarget)),
        supplyLimit: Math.max(20, Math.min(60, supplyTarget)),
        timeoutMs: 6000,
      })
    : null;
  const batch = buildDailyWeb3IngestionBatch(date, demandTarget, supplyTarget, liveDiscovery?.candidates || []);
  const runtime = getGroIntelWorldRuntime();

  const runtimeIngestion = runtime.ingestTargets(
    batch.targets.map(dailyCandidateToRealityTarget),
    shouldRun ? "daily_ingestion_run" : "daily_ingestion_preview",
  );
  const memory = shouldRun ? await saveDailyIngestionBatch(batch) : null;
  const snapshot = runtime.snapshot();

  return NextResponse.json({
    success: true,
    mode: shouldRun ? "run" : "preview",
    batch: {
      id: batch.id,
      date: batch.date,
      demandTarget: batch.demandTarget,
      supplyTarget: batch.supplyTarget,
      demandCount: batch.demand.length,
      supplyCount: batch.supply.length,
      targetCount: batch.targets.length,
      sourceSummary: batch.sourceSummary,
    },
    liveDiscovery: liveDiscovery
      ? {
          attempted: liveDiscovery.attempted,
          success: liveDiscovery.success,
          source: liveDiscovery.source,
          sourceUrl: liveDiscovery.sourceUrl,
          latencyMs: liveDiscovery.latencyMs,
          rawCount: liveDiscovery.rawCount,
          candidateCount: liveDiscovery.candidateCount,
          demandCandidateCount: liveDiscovery.demandCandidateCount,
          supplyCandidateCount: liveDiscovery.supplyCandidateCount,
          qualitySummary: liveQualitySummary(liveDiscovery.candidates),
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
        }
      : { attempted: false, success: false, source: "multi_live", candidateCount: 0, demandCandidateCount: 0, supplyCandidateCount: 0, sources: [] },
    runtimeIngestion,
    memory,
    world: {
      targetCount: snapshot.targets.length,
      web3DemandCount: snapshot.discovery.web3DemandCount,
      web3SupplyCount: snapshot.discovery.web3SupplyCount,
      discoveryCatalogCount: snapshot.discovery.discoveryCatalogCount,
    },
    samples: {
      demand: batch.demand.slice(0, 8).map((target) => ({
        name: target.name,
        identity: target.identity,
        tags: target.tags,
        priority: target.priority,
        discoveryScore: target.discoveryScore,
        sourceCoverage: target.sourceCoverage,
      })),
      supply: batch.supply.slice(0, 8).map((target) => ({
        name: target.name,
        identity: target.identity,
        tags: target.tags,
        priority: target.priority,
        discoveryScore: target.discoveryScore,
        sourceCoverage: target.sourceCoverage,
      })),
    },
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return run(req, body);
}
