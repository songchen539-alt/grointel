// GroIntel PRODUCT-2 — API routes for Company Memory
import { NextRequest, NextResponse } from "next/server";
import { CompanyMemoryFlow } from "../../../../../apps/grointel/product/company_memory/company_memory_flow";

const flow = new CompanyMemoryFlow();

// POST /api/grointel/company-memory — Create company memory
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_website, growth_goal, target_market, budget, timeline, constraints, company_name } = body;
    if (!company_website || !growth_goal) {
      return NextResponse.json({ error: "company_website and growth_goal are required" }, { status: 400 });
    }
    const { memory, report } = flow.createFromRequest({
      company_website, growth_goal,
      company_name: company_name || company_website,
      target_market: target_market || "unknown",
      budget_range: budget || "unknown",
      timeline: timeline || "unknown",
      constraints: constraints || [],
    });
    return NextResponse.json({ success: true, memory, report });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/grointel/company-memory?id=xxx — Get company memory
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const website = searchParams.get("website");
    if (id) {
      const state = flow.getState(id);
      if (!state) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
      return NextResponse.json({ success: true, state });
    }
    if (website) {
      const mem = flow.store.getByWebsite(website);
      if (!mem) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
      return NextResponse.json({ success: true, memory: mem });
    }
    return NextResponse.json({ success: true, memories: flow.store.getAll() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/grointel/company-memory?id=xxx — Update company memory
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 });
    const body = await req.json();
    const result = flow.update(id, {
      company_website: body.company_website || "",
      growth_goal: body.growth_goal || "",
      company_name: body.company_name || "",
      target_market: body.target_market || "unknown",
      budget_range: body.budget || "unknown",
      timeline: body.timeline || "unknown",
      constraints: body.constraints || [],
    });
    if (!result) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
