// GroIntel Growth Passport Detail API
// GET /api/passports/[id] — returns passport with all sub-tables
// PATCH /api/passports/[id] — partial update

import { NextRequest, NextResponse } from "next/server";
import { DbGrowthPassport, DbGrowthCapabilityDna, DbGrowthAudienceDna, DbGrowthEvidence, DbGrowthCapabilityExplanation, DbGrowthRelationship } from "@/lib/db/types";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

async function fetchSubTable(table: string, passportId: string): Promise<Record<string, unknown>[]> {
  const r = await fetch(u + "/rest/v1/" + table + "?select=*&passport_id=eq." + encodeURIComponent(passportId) + "&order=created_at.desc", { headers: { ...h() }, cache: "no-store" });
  return r.ok ? r.json() : [];
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const r = await fetch(u + "/rest/v1/growth_passports?select=*,entity:entity_id(*)&id=eq." + encodeURIComponent(id), { headers: h(), cache: "no-store" });
    if (!r.ok) return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
    const rows: DbGrowthPassport[] = await r.json();
    if (!rows[0]) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const [capabilityDna, audienceDna, evidence, history, explanations, relationships] = await Promise.all([
      fetchSubTable("growth_capability_dna", id).then((r) => (r[0] || null) as unknown as DbGrowthCapabilityDna | null),
      fetchSubTable("growth_audience_dna", id).then((r) => (r[0] || null) as unknown as DbGrowthAudienceDna | null),
      fetchSubTable("growth_evidence", id) as unknown as Promise<DbGrowthEvidence[]>,
      fetchSubTable("growth_capability_history", id),
      fetchSubTable("growth_capability_explanations", id) as unknown as Promise<DbGrowthCapabilityExplanation[]>,
      fetchSubTable("growth_relationships", id) as unknown as Promise<DbGrowthRelationship[]>,
    ]);

    return NextResponse.json({
      success: true,
      passport: {
        ...rows[0],
        capabilityDna,
        audienceDna,
        evidence,
        history,
        explanations,
        relationships,
      },
    });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  try {
    const r = await fetch(u + "/rest/v1/growth_passports?id=eq." + encodeURIComponent(id), { method: "PATCH", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify(b) });
    if (!r.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const rows: DbGrowthPassport[] = await r.json();
    return NextResponse.json({ success: true, passport: rows[0] || rows });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
