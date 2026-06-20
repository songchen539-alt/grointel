// REALITY-3 — API routes
import { NextRequest, NextResponse } from "next/server";
import { LivingLoopFlow } from "../../../../../apps/grointel/reality/continuous/living_loop_flow";

const loop = new LivingLoopFlow();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entities } = body;

    if (action === "tick" || !action) {
      const result = loop.runIteration(entities || [
        { id: "default", name: "default", freshness: 50, knowledge_uncertainty: 30, confidence: 70, hypothesis_count: 0, emerging_industry: false, rapid_change: false, high_impact: false }
      ]);
      return NextResponse.json({ success: true, ...result, state: loop.currentState, metrics: loop.metrics.get() });
    }
    if (action === "status") {
      return NextResponse.json({ success: true, state: loop.currentState, metrics: loop.metrics.get(), queue: loop.getQueue() });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, state: loop.currentState, metrics: loop.metrics.get(), queue: loop.getQueue(), safety: loop.safety.getState() });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
