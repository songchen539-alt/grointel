// OPS-2 — Persistence Status + Runtime Resume API
import { NextRequest, NextResponse } from "next/server";
import { PersistentStoreFactory } from "../../../../../apps/grointel/persistence/persistent_store_factory";
import { AlwaysOnRuntime } from "../../../../../apps/grointel/ops/always_on_runtime/always_on_runtime";

const runtime = new AlwaysOnRuntime();

export async function GET() {
  try {
    const client = PersistentStoreFactory.getClient();
    const status = client.getStatus();
    return NextResponse.json({ success: true, status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "resume") {
      runtime.createRuntime("simulated");
      runtime.start();
      await runtime.resume();
      return NextResponse.json({ success: true, status: runtime.status() });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
