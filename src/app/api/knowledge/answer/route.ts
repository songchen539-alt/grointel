// POST /api/knowledge/answer — submit answer, get next question or completion
import { NextRequest, NextResponse } from "next/server";
import { DbKnowledgeCompletionSession, DbKnowledgeCompletionQuestion } from "@/lib/db/types";
import { applyKnowledgeAnswer, generateNextQuestion, calculateOverallConfidence, getConfidenceBreakdown } from "@/lib/intelligence/knowledgeCompletion";

const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "Content-Type": "application/json", "apikey": k, "Authorization": "Bearer " + k });

export async function POST(request: NextRequest) {
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  let b; try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!b.sessionId || !b.questionId || !b.answer) return NextResponse.json({ success: false, error: "sessionId, questionId, answer required" }, { status: 400 });

  try {
    // Get session
    const sr = await fetch(u + "/rest/v1/knowledge_completion_sessions?select=*&id=eq." + encodeURIComponent(b.sessionId), { headers: h() });
    if (!sr.ok) return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    const sRows: DbKnowledgeCompletionSession[] = await sr.json();
    const session = sRows[0];
    if (!session || session.status === "completed") return NextResponse.json({ success: false, error: "Session already completed or not found" }, { status: 400 });

    // Get question
    const qr = await fetch(u + "/rest/v1/knowledge_completion_questions?select=*&id=eq." + encodeURIComponent(b.questionId) + "&session_id=eq." + encodeURIComponent(b.sessionId), { headers: h() });
    if (!qr.ok) return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    const qRows: DbKnowledgeCompletionQuestion[] = await qr.json();
    const question = qRows[0];
    if (!question) return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });

    // Fetch current knowledge
    const table = session.profile_type === "business_knowledge" ? "business_knowledge_profiles" : "capability_knowledge_profiles";
    const kr = await fetch(u + "/rest/v1/" + table + "?select=*&id=eq." + encodeURIComponent(session.profile_id), { headers: h() });
    const kRows = await kr.json();
    const knowledge = kRows[0];
    if (!knowledge) return NextResponse.json({ success: false, error: "Knowledge profile not found" }, { status: 404 });

    // Build knowledge object
    const knowledgeObj: Record<string, unknown> = {};
    if (session.profile_type === "business_knowledge") {
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
      knowledgeObj.limitations = knowledge.limitations || {};
    }

    // Apply answer
    const result = applyKnowledgeAnswer(knowledgeObj, question.target_field, b.answer);

    // Mark question answered
    await fetch(u + "/rest/v1/knowledge_completion_questions?id=eq." + b.questionId, {
      method: "PATCH", headers: h(),
      body: JSON.stringify({ answer: b.answer, confidence_after: result.overallConfidence, answered_at: new Date().toISOString() }),
    });

    // Save knowledge update
    await fetch(u + "/rest/v1/knowledge_updates", {
      method: "POST", headers: { ...h(), "Prefer": "return=minimal" },
      body: JSON.stringify([{
        session_id: b.sessionId,
        knowledge_profile_id: session.profile_id,
        updated_field: question.target_field,
        source: "knowledge_completion",
      }]),
    });

    // Check if we should continue
    const nextQuestion = result.isComplete ? null : generateNextQuestion(result.updatedKnowledge);
    let nextQuestionRecord = null;

    if (nextQuestion) {
      const nqBody = {
        session_id: b.sessionId,
        target_field: nextQuestion.targetField,
        question: nextQuestion.question,
        reason: nextQuestion.reason,
        importance: nextQuestion.importance,
        confidence_before: result.overallConfidence,
      };
      const nqr = await fetch(u + "/rest/v1/knowledge_completion_questions", { method: "POST", headers: { ...h(), "Prefer": "return=representation" }, body: JSON.stringify([nqBody]) });
      if (nqr.ok) {
        const nqRows: DbKnowledgeCompletionQuestion[] = await nqr.json();
        nextQuestionRecord = nqRows[0] || nqRows;
      }
    }

    // Update session
    const step = (session.current_step || 0) + 1;
    const status = result.isComplete ? "completed" : "in_progress";
    await fetch(u + "/rest/v1/knowledge_completion_sessions?id=eq." + b.sessionId, {
      method: "PATCH", headers: h(),
      body: JSON.stringify({ current_step: step, overall_confidence: result.overallConfidence, status, completed_at: result.isComplete ? new Date().toISOString() : null }),
    });

    // Calculate confidence breakdown
    const confidenceBreakdown = getConfidenceBreakdown(result.updatedKnowledge);

    return NextResponse.json({
      success: true,
      question: nextQuestionRecord,
      answered: { field: question.target_field, confidence_delta: result.confidenceDelta },
      progress: {
        step,
        total_questions: step,
        overall_confidence: result.overallConfidence,
        confidence_breakdown: confidenceBreakdown,
        is_complete: result.isComplete,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
