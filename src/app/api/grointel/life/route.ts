// LIFE-1 — API routes
import { NextRequest, NextResponse } from "next/server";
import { AutonomousLearningLoop } from "../../../../../apps/grointel/life/autonomous_learning_loop";

const loop = new AutonomousLearningLoop();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, signals, confidences, memoryCount, count } = body;

    if (action === "run" || !action) {
      const result = loop.runIteration(signals || [], confidences || [], memoryCount || 0);
      return NextResponse.json({ success: true, ...result, metrics: loop.metrics.get(), event_count: loop.events.count() });
    }
    if (action === "batch") {
      const result = loop.runBatch(count || 3);
      return NextResponse.json({ success: true, ...result });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      metrics: loop.metrics.get(),
      active_hypotheses: loop.hypotheses.getActive().length,
      total_hypotheses: loop.hypotheses.getAll().length,
      evidence_count: loop.evidence.count(),
      world_changes: loop.worldUpdater.count(),
      recent_events: loop.events.getRecent(10),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
