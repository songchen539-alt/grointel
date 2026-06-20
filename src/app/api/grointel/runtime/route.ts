// OPS-1 — API routes for Always-On Runtime
import { NextRequest, NextResponse } from "next/server";
import { AlwaysOnRuntime } from "../../../../../apps/grointel/ops/always_on_runtime/always_on_runtime";

const runtime = new AlwaysOnRuntime();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, companyMemoryId, capabilities, priority, mode, change, count } = body;

    switch (action || body._action) {
      case "start":
        runtime.createRuntime(mode || "simulated");
        runtime.start();
        return NextResponse.json({ success: true, status: runtime.status() });

      case "stop":
        runtime.stop();
        return NextResponse.json({ success: true, status: runtime.status() });

      case "enqueue": {
        if (!companyMemoryId) return NextResponse.json({ error: "companyMemoryId required" }, { status: 400 });
        const job = runtime.enqueueObservationJob(companyMemoryId, capabilities || ["observe_website"], priority || 5);
        return NextResponse.json({ success: true, job });
      }

      case "tick": {
        const processed = runtime.tick();
        return NextResponse.json({ success: true, processed, status: runtime.status() });
      }

      case "simulate": {
        if (!companyMemoryId) return NextResponse.json({ error: "companyMemoryId required" }, { status: 400 });
        const result = runtime.simulator.simulateNetworkChange(companyMemoryId, change || {}, runtime.flow, runtime.k2);
        return NextResponse.json({ success: true, ...result, status: runtime.status() });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "status";
    if (action === "status") {
      return NextResponse.json({ success: true, status: runtime.status(), audit: runtime.audit.getRecent(20) });
    }
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
