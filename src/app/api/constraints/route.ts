// POST /api/constraints — extract constraints from business knowledge
import { NextRequest, NextResponse } from "next/server";
import { extractConstraintsFromBusinessKnowledge } from "@/lib/intelligence/constraintIntelligence";

export async function POST(request: NextRequest) {
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.businessKnowledge) return NextResponse.json({ success: false, error: "businessKnowledge required" }, { status: 400 });

  const constraints = extractConstraintsFromBusinessKnowledge(b.businessKnowledge);
  return NextResponse.json({ success: true, constraints });
}
