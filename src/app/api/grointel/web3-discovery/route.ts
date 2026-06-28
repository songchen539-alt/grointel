import { NextRequest, NextResponse } from "next/server";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";
import { WEB3_DISCOVERY_TARGETS, web3DiscoveryStats } from "@/lib/grointel/web3Discovery";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 80);
  const world = getGroIntelWorldRuntime().snapshot();
  const web3Targets = world.targets.filter((target) => target.id.startsWith("web3."));
  const demandTargets = web3Targets.filter((target) => target.kind === "company");
  const supplyTargets = web3Targets.filter((target) => target.kind !== "company");

  return NextResponse.json({
    success: true,
    status: "active",
    stats: {
      ...web3DiscoveryStats(world.targets),
      runtimeTargetCount: world.targets.length,
      demandRuntimeCount: demandTargets.length,
      supplyRuntimeCount: supplyTargets.length,
    },
    discovery: world.discovery,
    demandTargets: demandTargets.slice(0, Number.isFinite(limit) ? limit : 80),
    supplyTargets: supplyTargets.slice(0, Number.isFinite(limit) ? limit : 80),
    catalog: WEB3_DISCOVERY_TARGETS.slice(0, Number.isFinite(limit) ? limit : 80),
  });
}
