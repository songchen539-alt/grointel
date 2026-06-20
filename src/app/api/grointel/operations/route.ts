// OPERATION-1 — API routes
import { NextRequest, NextResponse } from "next/server";
import { RuntimeSupervisor } from "../../../../../apps/grointel/operation/runtime_supervisor";

const supervisor = new RuntimeSupervisor();

export async function GET() {
  try {
    return NextResponse.json({ success: true, dashboard: supervisor.dashboard() });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, workerType, payload } = body;

    if (action === "tick") {
      const processed = supervisor.tick();
      return NextResponse.json({ success: true, processed, dashboard: supervisor.dashboard() });
    }
    if (action === "recover") {
      supervisor.recover();
      return NextResponse.json({ success: true, workers: supervisor.getWorkers() });
    }
    if (action === "enqueue") {
      const job = supervisor.queue.enqueue(workerType || "reality", payload || {}, 5);
      return NextResponse.json({ success: true, job });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
