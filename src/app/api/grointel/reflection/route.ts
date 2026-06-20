// EVOLUTION-1 — API routes
import { NextRequest, NextResponse } from "next/server";
import { EvolutionFlow } from "../../../../../apps/grointel/evolution/evolution_flow";

const flow = new EvolutionFlow();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, domain, proposalId } = body;

    if (action === "reflect" || !action) {
      const domains = body.domains || [
        { domain: "knowledge" as const, predicted: [70, 75, 72], observed: [68, 73, 78] },
        { domain: "prediction" as const, predicted: [65, 70, 68], observed: [60, 65, 75] },
        { domain: "decision" as const, predicted: [75, 70, 80], observed: [70, 72, 78] },
      ];
      const result = flow.runFullReflection(domains);
      return NextResponse.json({ success: true, ...result });
    }
    if (action === "apply" && proposalId) {
      const prop = flow.optimization.apply({ id: proposalId } as any);
      return NextResponse.json({ success: true, proposal: prop });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      wisdom_count: flow.wisdom.count(),
      high_confidence_wisdom: flow.wisdom.getHighConfidence(),
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
