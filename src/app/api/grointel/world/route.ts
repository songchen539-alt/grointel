import { NextRequest, NextResponse } from "next/server";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";

export async function GET(req: NextRequest) {
  try {
    const runtime = getGroIntelWorldRuntime();
    const { searchParams } = new URL(req.url);
    const shouldObserve = searchParams.get("observe") === "1";
    const limit = Number(searchParams.get("limit") || 3);
    const current = runtime.snapshot();
    const result = shouldObserve || current.tickCount === 0
      ? await runtime.observeTargets(Number.isFinite(limit) ? limit : 3)
      : current;

    return NextResponse.json({ success: true, ...result });
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
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ success: true, ...runtime.snapshot() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
