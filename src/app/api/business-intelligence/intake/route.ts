// POST /api/business-intelligence/intake
// Creates scan profile + knowledge profile from website
import { NextRequest, NextResponse } from "next/server";
import { DbBusinessScanProfile, DbBusinessKnowledgeProfile } from "@/lib/db/types";
import { normalizeWebsite, generateMockBusinessScan, createInitialBusinessKnowledge } from "@/lib/intelligence/businessIntelligence";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function POST(request: NextRequest) {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.website) return NextResponse.json({ success: false, error: "website required" }, { status: 400 });

  try {
    const website = normalizeWebsite(b.website);
    const scan = generateMockBusinessScan(website);
    const knowledge = createInitialBusinessKnowledge(scan);

    // 1. Insert scan profile
    const scanBody = {
      website: scan.website,
      normalized_domain: scan.normalized_domain,
      company_name: scan.company_name,
      industry: scan.industry,
      country: scan.country,
      region: scan.region,
      public_summary: scan.public_summary,
      detected_products: scan.detected_products,
      detected_markets: scan.detected_markets,
      detected_growth_channels: scan.detected_growth_channels,
      public_signals: scan.public_signals,
      sources: scan.sources,
      confidence: scan.confidence,
      scan_status: "completed",
    };

    const sr = await fetch(u + "/rest/v1/business_scan_profiles", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([scanBody]) });
    if (!sr.ok) { const errBody = await sr.text(); return NextResponse.json({ success: false, error: "Scan insert failed: " + sr.status + " " + errBody.slice(0,200) }, { status: 500 }); }
    const scanRows: DbBusinessScanProfile[] = await sr.json();
    const scanProfile = scanRows[0] || scanRows;

    // 2. Insert knowledge profile
    const knowledgeBody = {
      website: knowledge.website,
      scan_profile_id: scanProfile.id,
      business_identity: knowledge.business_identity,
      business_model: knowledge.business_model,
      market: knowledge.market,
      goals: knowledge.goals,
      constraints: knowledge.constraints,
      growth_stack: knowledge.growth_stack,
      history: knowledge.history,
      preferences: knowledge.preferences,
      knowledge_confidence: knowledge.knowledge_confidence,
      knowledge_status: "draft",
    };

    const kr = await fetch(u + "/rest/v1/business_knowledge_profiles", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([knowledgeBody]) });
    if (!kr.ok) return NextResponse.json({ success: false, error: "Knowledge insert failed" }, { status: 500 });
    const knowledgeRows: DbBusinessKnowledgeProfile[] = await kr.json();
    const knowledgeProfile = knowledgeRows[0] || knowledgeRows;

    return NextResponse.json({
      success: true,
      scanProfile,
      knowledgeProfile,
      redirectUrl: "/business-intelligence/" + knowledgeProfile.id,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
