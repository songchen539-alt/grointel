import { NextRequest, NextResponse } from "next/server";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";
import { saveWorldMemory } from "@/lib/grointel/worldMemory";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized heartbeat" }, { status: 401 });
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const runtime = getGroIntelWorldRuntime();
    const limit = Number(new URL(req.url).searchParams.get("limit") || 6);
    const world = await runtime.observeTargets(Number.isFinite(limit) ? limit : 6);
    const memory = await saveWorldMemory(world, "heartbeat");

    return NextResponse.json({
      success: true,
      heartbeat: {
        status: "alive",
        mode: "scheduled_reality_observation",
        observed_at: world.lastObservedAt,
        tick_count: world.tickCount,
        targets_observed: world.observations.slice(0, limit).map((observation) => ({
          name: observation.target.name,
          identity: observation.target.identity,
          kind: observation.target.kind,
          signals: observation.signal_count,
          evidence: observation.evidence_count,
        })),
        signal_count: world.signals.length,
        evidence_count: world.evidence.length,
        intelligence_index: world.score.overall,
      },
      memory,
      world,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
