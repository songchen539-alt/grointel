// POST /api/capability-intelligence/intake
import { NextRequest, NextResponse } from "next/server";
import { DbCapabilityScanProfile, DbCapabilityKnowledgeProfile } from "@/lib/db/types";
import { normalizeProfileUrl, generateMockCapabilityScan, createInitialCapabilityKnowledge } from "@/lib/intelligence/capabilityIntelligence";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function POST(request: NextRequest) {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.profileUrl) return NextResponse.json({ success: false, error: "profileUrl required" }, { status: 400 });

  try {
    const profileUrl = normalizeProfileUrl(b.profileUrl);
    const scan = generateMockCapabilityScan(profileUrl);
    const knowledge = createInitialCapabilityKnowledge(scan);

    // 1. Insert scan profile
    const scanBody = {
      profile_url: scan.profile_url,
      normalized_domain: scan.normalized_domain,
      display_name: scan.display_name,
      entity_type: scan.entity_type,
      public_summary: scan.public_summary,
      detected_capabilities: scan.detected_capabilities,
      detected_audiences: scan.detected_audiences,
      detected_markets: scan.detected_markets,
      detected_channels: scan.detected_channels,
      public_evidence: scan.public_evidence,
      sources: scan.sources,
      confidence: scan.confidence,
      scan_status: "completed",
    };

    const sr = await fetch(u + "/rest/v1/capability_scan_profiles", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([scanBody]) });
    if (!sr.ok) { const t = await sr.text(); return NextResponse.json({ success: false, error: "Scan insert: " + sr.status + " " + t.slice(0,200) }, { status: 500 }); }
    const sRows: DbCapabilityScanProfile[] = await sr.json();
    const scanProfile = sRows[0] || sRows;

    // 2. Insert knowledge profile
    const knowledgeBody = {
      profile_url: knowledge.profile_url,
      scan_profile_id: scanProfile.id,
      capability_identity: knowledge.capability_identity,
      capability_dna: knowledge.capability_dna,
      audience_dna: knowledge.audience_dna,
      evidence_summary: knowledge.evidence_summary,
      strengths: knowledge.strengths,
      limitations: knowledge.limitations,
      preferred_collaborations: knowledge.preferred_collaborations,
      pricing_signals: knowledge.pricing_signals,
      availability_signals: knowledge.availability_signals,
      knowledge_confidence: knowledge.knowledge_confidence,
      knowledge_status: "draft",
    };

    const kr = await fetch(u + "/rest/v1/capability_knowledge_profiles", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([knowledgeBody]) });
    if (!kr.ok) { const t = await kr.text(); return NextResponse.json({ success: false, error: "Knowledge insert: " + kr.status + " " + t.slice(0,200) }, { status: 500 }); }
    const kRows: DbCapabilityKnowledgeProfile[] = await kr.json();
    const knowledgeProfile = kRows[0] || kRows;

    return NextResponse.json({
      success: true,
      scanProfile,
      knowledgeProfile,
      redirectUrl: "/capability-intelligence/" + knowledgeProfile.id,
    });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
