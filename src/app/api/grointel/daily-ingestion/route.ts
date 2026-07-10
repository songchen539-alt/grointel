import { NextRequest, NextResponse } from "next/server";
import { buildDailyWeb3IngestionBatch, dailyCandidateToRealityTarget } from "@/lib/grointel/dailyIngestion";
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

async function run(req: NextRequest, body?: any) {
  if (!isAuthorized(req)) return unauthorized();

  const url = new URL(req.url);
  const shouldRun = url.searchParams.get("run") === "1" || body?.run === true;
  const date = String(body?.date || url.searchParams.get("date") || new Date().toISOString().slice(0, 10));
  const demandTarget = positiveInt(String(body?.demandTarget || url.searchParams.get("demandTarget") || ""), 100, 200);
  const supplyTarget = positiveInt(String(body?.supplyTarget || url.searchParams.get("supplyTarget") || ""), 100, 200);
  const batch = buildDailyWeb3IngestionBatch(date, demandTarget, supplyTarget);
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
    },
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
      })),
      supply: batch.supply.slice(0, 8).map((target) => ({
        name: target.name,
        identity: target.identity,
        tags: target.tags,
        priority: target.priority,
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
