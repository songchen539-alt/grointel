// GENESIS-2 — API routes
import { NextRequest, NextResponse } from "next/server";
import { Genesis2Flow } from "../../../../../apps/grointel/genesis/public_exploration/genesis2_flow";

const flow = new Genesis2Flow();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entityName, entityType } = body;

    if (action === "discover" || action === "run") {
      if (!entityName) return NextResponse.json({ error: "entityName required" }, { status: 400 });
      const result = flow.explore(entityName, entityType || "company");
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
      source_count: flow.catalog.getEnabled().length,
      reputation_count: flow.reputation.getAll().length,
      memory_count: flow.memory.getAll().length,
      sources: flow.catalog.getAll(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
