// GET /api/capability-intelligence/[id]
import { NextRequest, NextResponse } from "next/server";
import { DbCapabilityKnowledgeProfile, DbCapabilityScanProfile } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "apikey": k, "Authorization": "Bearer " + k });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const kr = await fetch(u + "/rest/v1/capability_knowledge_profiles?select=*&id=eq." + encodeURIComponent(id), { headers: h(), cache: "no-store" });
    if (!kr.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const kRows: DbCapabilityKnowledgeProfile[] = await kr.json();
    if (!kRows[0]) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let scanProfile: DbCapabilityScanProfile | null = null;
    if (kRows[0].scan_profile_id) {
      const sr = await fetch(u + "/rest/v1/capability_scan_profiles?select=*&id=eq." + encodeURIComponent(kRows[0].scan_profile_id), { headers: h(), cache: "no-store" });
      if (sr.ok) { const sRows: DbCapabilityScanProfile[] = await sr.json(); scanProfile = sRows[0] || null; }
    }

    return NextResponse.json({ success: true, profile: kRows[0], scanProfile });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
