// POST /api/knowledge/start — start a knowledge completion session
import { NextRequest, NextResponse } from "next/server";
import { DbKnowledgeCompletionSession, DbKnowledgeCompletionQuestion } from "@/lib/db/types";
import { generateNextQuestion, calculateOverallConfidence } from "@/lib/intelligence/knowledgeCompletion";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function POST(request: NextRequest) {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.profileType || !b.profileId) return NextResponse.json({ success: false, error: "profileType and profileId required" }, { status: 400 });

  try {
    // Fetch current knowledge
    const table = b.profileType === "business_knowledge" ? "business_knowledge_profiles" : "capability_knowledge_profiles";
    const kr = await fetch(u + "/rest/v1/" + table + "?select=*&id=eq." + encodeURIComponent(b.profileId), { headers: h() });
    if (!kr.ok) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    const kRows = await kr.json();
    const knowledge = kRows[0];
    if (!knowledge) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    // Build knowledge object from profile
    const knowledgeObj: Record<string, unknown> = {};
    if (b.profileType === "business_knowledge") {
      knowledgeObj.business_identity = knowledge.business_identity || {};
      knowledgeObj.business_model = knowledge.business_model || {};
      knowledgeObj.market = knowledge.market || {};
      knowledgeObj.goals = knowledge.goals || [];
      knowledgeObj.constraints = knowledge.constraints || {};
      knowledgeObj.preferences = knowledge.preferences || {};
    } else {
      knowledgeObj.capability_identity = knowledge.capability_identity || {};
      knowledgeObj.capability_dna = knowledge.capability_dna || {};
      knowledgeObj.audience_dna = knowledge.audience_dna || {};
      knowledgeObj.strengths = knowledge.strengths || [];
      knowledgeObj.limitations = knowledge.limitations || [];
    }

    // Generate first question
    const firstQuestion = generateNextQuestion(knowledgeObj);
    const overallConfidence = calculateOverallConfidence(knowledgeObj);
    const isComplete = !firstQuestion;

    // Create session
    const sessionBody = {
      profile_type: b.profileType,
      profile_id: b.profileId,
      current_step: 0,
      overall_confidence: overallConfidence,
      status: isComplete ? "completed" : "in_progress",
      completed_at: isComplete ? new Date().toISOString() : null,
    };

    const sr = await fetch(u + "/rest/v1/knowledge_completion_sessions", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([sessionBody]) });
    if (!sr.ok) return NextResponse.json({ success: false, error: "Session create failed" }, { status: 500 });
    const sRows: DbKnowledgeCompletionSession[] = await sr.json();
    const session = sRows[0] || sRows;

    // Create first question if needed
    let question = null;
    if (firstQuestion && !isComplete) {
      const qBody = {
        session_id: session.id,
        target_field: firstQuestion.targetField,
        question: firstQuestion.question,
        reason: firstQuestion.reason,
        importance: firstQuestion.importance,
        confidence_before: overallConfidence,
      };
      const qr = await fetch(u + "/rest/v1/knowledge_completion_questions", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([qBody]) });
      if (qr.ok) {
        const qRows: DbKnowledgeCompletionQuestion[] = await qr.json();
        question = qRows[0] || qRows;
      }
    }

    return NextResponse.json({
      success: true,
      session,
      question,
      progress: { step: 0, overall_confidence: overallConfidence, is_complete: isComplete },
    });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
