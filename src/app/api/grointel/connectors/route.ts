// REALITY-2 — API routes
import { NextRequest, NextResponse } from "next/server";
import { ConnectorRegistry } from "../../../../../apps/grointel/reality/connectors/connector_registry";

const registry = new ConnectorRegistry();

// POST /api/grointel/connectors/run — Run one connector
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { connectorId, entity } = body;
    if (!connectorId || !entity) return NextResponse.json({ error: "connectorId and entity required" }, { status: 400 });
    const connector = registry.get(connectorId);
    if (!connector) return NextResponse.json({ error: "Connector not found" }, { status: 404 });
    const result = await connector.run(entity);
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

// GET /api/grointel/connectors — List connectors
export async function GET() {
  try {
    const connectors = registry.getAll().map(c => ({
      id: c.id, name: c.name, type: c.type, health: c.health(), metrics: c.metrics(),
    }));
    return NextResponse.json({ success: true, connectors });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
