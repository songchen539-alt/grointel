import { NextRequest, NextResponse } from "next/server";
import { AgentReachConnector } from "../../../../../apps/grointel/reality/connectors/agent_reach_connector";

export const dynamic = "force-dynamic";

const connector = new AgentReachConnector();

export async function GET() {
  try {
    const status = await connector.status();
    return NextResponse.json({ success: true, connector: { id: connector.id, name: connector.name, type: connector.type }, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entity = typeof body?.entity === "string" ? body.entity.trim() : "";
    if (!entity) return NextResponse.json({ success: false, error: "entity required" }, { status: 400 });

    const result = await connector.run(entity);
    return NextResponse.json({ success: true, entity, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
