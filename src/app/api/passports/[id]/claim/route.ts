/* eslint-disable @typescript-eslint/no-explicit-any */
// POST /api/passports/[id]/claim
import { NextRequest, NextResponse } from "next/server";
const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let b; try { b = await _req.json(); } catch {}
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    await fetch(u + "/rest/v1/growth_claim_requests", { method: "POST", headers: { ...h(), "Prefer": "return=minimal" }, body: JSON.stringify([{ passport_id: id, email: b?.email || "", verification_method: b?.method || "email", status: "pending" }]) });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
