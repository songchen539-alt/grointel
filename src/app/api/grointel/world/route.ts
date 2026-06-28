import { NextRequest, NextResponse } from "next/server";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";
import { loadWorldMemorySummary, saveWorldMemory } from "@/lib/grointel/worldMemory";
import { getGroIntelLifeStatus } from "@/lib/grointel/lifeStatus";

export async function GET(req: NextRequest) {
  try {
    const runtime = getGroIntelWorldRuntime();
    const { searchParams } = new URL(req.url);
    const shouldObserve = searchParams.get("observe") === "1";
    const limit = Number(searchParams.get("limit") || 3);
    const current = runtime.snapshot();
    const didObserve = shouldObserve || current.tickCount === 0;
    const result = didObserve
      ? await runtime.observeTargets(Number.isFinite(limit) ? limit : 3)
      : current;
    const memorySave = didObserve ? await saveWorldMemory(result, "world_api") : null;
    const memory = await loadWorldMemorySummary(20);

    return NextResponse.json({ success: true, ...result, life: getGroIntelLifeStatus(), memory, memorySave });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const runtime = getGroIntelWorldRuntime();
    const body = await req.json();
    const action = body?.action || "observe";
    const limit = Number(body?.limit || 3);

    if (action === "observe" || action === "tick") {
      const result = await runtime.observeTargets(Number.isFinite(limit) ? limit : 3);
      const memory = await saveWorldMemory(result, "world_api");
      return NextResponse.json({ success: true, ...result, life: getGroIntelLifeStatus(), memory });
    }

    return NextResponse.json({ success: true, ...runtime.snapshot(), life: getGroIntelLifeStatus(), memory: await loadWorldMemorySummary(20) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
