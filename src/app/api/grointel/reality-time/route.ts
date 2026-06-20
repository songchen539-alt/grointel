// AWAKENING-3 — Reality Time API
import { NextRequest, NextResponse } from "next/server";
import { RealityTimeRuntime } from "../../../../../apps/grointel/reality/reality_time/reality_time_runtime";

const runtime = new RealityTimeRuntime();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "tick" || !action) {
      const result = await runtime.cycleOnce();
      return NextResponse.json({
        success: true,
        event: { target: result.event.target?.name || "none", signals: result.event.signals },
        heartbeat: result.heartbeat,
        wu_index: runtime.wuIndex,
        workers: runtime.getWorkers().map(w => w.getState()),
      });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      heartbeat: runtime.heartbeatState,
      wu_index: runtime.wuIndex,
      workers: runtime.getWorkers().map(w => w.getState()),
      events: runtime.getRecentEvents(30),
      targets: runtime.engine.targets.getAll().map(t => ({
        name: t.name, attention: t.attention_score, snapshots: t.snapshot_count, last_observed: t.last_observed_at
      })),
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
