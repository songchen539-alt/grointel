// GroIntel KNOWLEDGE-2 — POST /api/grointel/observe, POST /api/grointel/simulate-observation
import { NextRequest, NextResponse } from "next/server";
import { Knowledge2Flow } from "../../../../../apps/grointel/knowledge/reality_observation/knowledge2_flow";
import { CompanyMemoryFlow } from "../../../../../apps/grointel/product/company_memory/company_memory_flow";

const k2 = new Knowledge2Flow();
const cmf = new CompanyMemoryFlow();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, companyMemoryId, companyWebsite, simulatedSignals } = body;

    if (!companyMemoryId) return NextResponse.json({ error: "companyMemoryId required" }, { status: 400 });

    if (action === "simulate" || simulatedSignals) {
      const result = k2.simulateAndUpdate(cmf, companyMemoryId, simulatedSignals || {});
      return NextResponse.json({ success: true, ...result });
    }

    const mem = cmf.store.get(companyMemoryId);
    if (!mem) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    const website = companyWebsite || mem.company_website;
    const result = k2.observeAndUpdate(cmf, companyMemoryId, website);
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
