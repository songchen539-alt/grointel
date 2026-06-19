// GET /api/business-intelligence/[id] — return knowledge profile with linked scan
import { NextRequest, NextResponse } from "next/server";
import { DbBusinessKnowledgeProfile, DbBusinessScanProfile } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "apikey": k, "Authorization": "Bearer " + k });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    // Get knowledge profile
    const kr = await fetch(u + "/rest/v1/business_knowledge_profiles?select=*&id=eq." + encodeURIComponent(id), { headers: h(), cache: "no-store" });
    if (!kr.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const kRows: DbBusinessKnowledgeProfile[] = await kr.json();
    if (!kRows[0]) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    const knowledgeProfile = kRows[0];

    // Get linked scan profile
    let scanProfile: DbBusinessScanProfile | null = null;
    if (knowledgeProfile.scan_profile_id) {
      const sr = await fetch(u + "/rest/v1/business_scan_profiles?select=*&id=eq." + encodeURIComponent(knowledgeProfile.scan_profile_id), { headers: h(), cache: "no-store" });
      if (sr.ok) {
        const sRows: DbBusinessScanProfile[] = await sr.json();
        scanProfile = sRows[0] || null;
      }
    }

    return NextResponse.json({ success: true, profile: knowledgeProfile, scanProfile });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
