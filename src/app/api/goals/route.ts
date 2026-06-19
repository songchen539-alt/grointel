// GET /api/goals — list goal library
// POST /api/goals — suggest goals from business knowledge
import { NextRequest, NextResponse } from "next/server";
import { getGoalLibrary, suggestGoalsFromBusinessKnowledge, getGoalBySlug } from "@/lib/intelligence/goalIntelligence";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");

  let goals = getGoalLibrary();
  if (slug) {
    const goal = getGoalBySlug(slug);
    return NextResponse.json({ success: true, goal: goal || null });
  }
  if (category) {
    goals = goals.filter(g => g.category === category);
  }
  return NextResponse.json({ success: true, goals, total: goals.length });
}

export async function POST(request: NextRequest) {
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.businessKnowledge) return NextResponse.json({ success: false, error: "businessKnowledge required" }, { status: 400 });

  const suggestions = suggestGoalsFromBusinessKnowledge(b.businessKnowledge);
  return NextResponse.json({ success: true, suggestions });
}
