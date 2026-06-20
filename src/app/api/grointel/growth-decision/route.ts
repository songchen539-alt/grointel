// GroIntel PRODUCT-1 — POST /api/grointel/growth-decision
import { NextRequest, NextResponse } from "next/server";
import { GrowthDecisionFlow } from "../../../../../apps/grointel/product/growth_decision_flow";

const flow = new GrowthDecisionFlow();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_website, growth_goal, target_market, budget_range, timeline, constraints } = body;

    if (!company_website || !growth_goal) {
      return NextResponse.json({ error: "company_website and growth_goal are required" }, { status: 400 });
    }

    const report = flow.run({
      company_website,
      growth_goal,
      target_market: target_market || "unknown",
      budget_range: budget_range || "unknown",
      timeline: timeline || "unknown",
      constraints: constraints || [],
    });

    return NextResponse.json({ success: true, report });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
