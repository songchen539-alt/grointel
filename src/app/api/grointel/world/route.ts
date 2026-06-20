// WORLD-1 — API routes
import { NextRequest, NextResponse } from "next/server";
import { WorldBuildingFlow } from "../../../../../apps/grointel/world/world_building_flow";

const flow = new WorldBuildingFlow();

export async function GET() {
  try {
    const result = flow.runFullUpdate();
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, domain, details, delta } = body;
    if (!type || !domain) return NextResponse.json({ error: "type and domain required" }, { status: 400 });
    const event = flow.recordEvent(type, domain, details || "", delta || 0);
    return NextResponse.json({ success: true, event });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
