// AWAKENING-2 — Reality Engine API
import { NextRequest, NextResponse } from "next/server";
import { RealityEngine } from "../../../../../apps/grointel/reality/engine/reality_engine";

const engine = new RealityEngine();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, website, industry, country } = body;

    if (action === "cycle") {
      const result = await engine.cycle();
      return NextResponse.json({ success: true, ...result, coverage: engine.getCoverage() });
    }

    if (action === "register" && name && website) {
      const target = engine.targets.register(name, website, "company", industry || "unknown", country || "US", 70);
      return NextResponse.json({ success: true, target });
    }

    if (action === "run_batch") {
      const count = body.count || 5; let total = 0;
      for (let i = 0; i < count; i++) { const r = await engine.cycle(); total += r.signals; }
      return NextResponse.json({ success: true, cycles: count, total_signals: total, coverage: engine.getCoverage() });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      targets: engine.targets.getAll().map(t => ({
        id: t.id, name: t.name, website: t.website, industry: t.industry,
        attention_score: t.attention_score, last_observed: t.last_observed_at,
        snapshot_count: t.snapshot_count, next_observation: t.next_observation_at,
      })),
      coverage: engine.getCoverage(),
      recent_signals: engine.signals.slice(-20),
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
