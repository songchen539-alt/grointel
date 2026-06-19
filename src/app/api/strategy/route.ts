// POST /api/strategy — generate strategy from business knowledge + goals + constraints
import { NextRequest, NextResponse } from "next/server";
import { getGoalBySlug } from "@/lib/intelligence/goalIntelligence";
import { extractConstraintsFromBusinessKnowledge } from "@/lib/intelligence/constraintIntelligence";
import { generateStrategy } from "@/lib/intelligence/strategyIntelligence";
import type { GrowthGoal } from "@/lib/intelligence/goalIntelligence";

export async function POST(request: NextRequest) {
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.goalSlugs || !b.businessKnowledge) return NextResponse.json({ success: false, error: "goalSlugs and businessKnowledge required" }, { status: 400 });

  const goalSlugs: string[] = b.goalSlugs;
  const goals: GrowthGoal[] = [];

  for (const slug of goalSlugs) {
    const goal = getGoalBySlug(slug);
    if (goal) goals.push(goal);
  }

  if (goals.length === 0) return NextResponse.json({ success: false, error: "No valid goals found for slugs: " + goalSlugs.join(", ") }, { status: 400 });

  const constraints = b.constraints || extractConstraintsFromBusinessKnowledge(b.businessKnowledge);
  const businessContext = (b.businessKnowledge.business_identity?.name as string) || "this business";

  const strategy = generateStrategy(goals, constraints, businessContext);
  return NextResponse.json({ success: true, strategy, goals: goals.map(g => ({ name: g.name, slug: g.slug })), constraints });
}
