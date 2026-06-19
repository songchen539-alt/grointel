// GET /api/capability-intelligence — list latest capability knowledge profiles
import { NextResponse } from "next/server";
import { DbCapabilityKnowledgeProfile } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "apikey": k, "Authorization": "Bearer " + k });

export async function GET() {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/capability_knowledge_profiles?select=*&order=created_at.desc&limit=50", { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Table may not exist" }, { status: 500 });
    const rows: DbCapabilityKnowledgeProfile[] = await r.json();
    return NextResponse.json({ success: true, profiles: rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
