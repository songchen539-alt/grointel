// POST /api/knowledge/answer — submit answer, persist to source profile, get next question
import { NextRequest, NextResponse } from "next/server";
import { DbKnowledgeCompletionSession, DbKnowledgeCompletionQuestion, DbKnowledgeUpdate } from "@/lib/db/types";
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
    if (!session || session.status === "completed") return NextResponse.json({ success: false, error: "Session completed" }, { status: 400 });

    const profileType = session.profile_type;
    const profileId = session.profile_id;

    // Get question
    const qr = await fetch(u + "/rest/v1/knowledge_completion_questions?select=*&id=eq." + encodeURIComponent(b.questionId) + "&session_id=eq." + encodeURIComponent(b.sessionId), { headers: h() });
    if (!qr.ok) return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    const qRows: DbKnowledgeCompletionQuestion[] = await qr.json();
    const question = qRows[0];
    if (!question) return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });

    // Fetch current knowledge profile
    const table = profileType === "business_knowledge" ? "business_knowledge_profiles" : "capability_knowledge_profiles";
    const kr = await fetch(u + "/rest/v1/" + table + "?select=*&id=eq." + encodeURIComponent(profileId), { headers: h() });
    const kRows = await kr.json();
    const knowledgeProfile = kRows[0];
    if (!knowledgeProfile) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    // Build knowledge object from profile
    const knowledgeObj: Record<string, unknown> = {};
    if (profileType === "business_knowledge") {
      knowledgeObj.business_identity = knowledgeProfile.business_identity || {};
      knowledgeObj.business_model = knowledgeProfile.business_model || {};
      knowledgeObj.market = knowledgeProfile.market || {};
      knowledgeObj.goals = knowledgeProfile.goals || [];
      knowledgeObj.constraints = knowledgeProfile.constraints || {};
      knowledgeObj.preferences = knowledgeProfile.preferences || {};
      knowledgeObj.growth_stack = knowledgeProfile.growth_stack || {};
    } else {
      knowledgeObj.capability_identity = knowledgeProfile.capability_identity || {};
      knowledgeObj.capability_dna = knowledgeProfile.capability_dna || {};
      knowledgeObj.audience_dna = knowledgeProfile.audience_dna || {};
      knowledgeObj.evidence_summary = knowledgeProfile.evidence_summary || {};
      knowledgeObj.strengths = knowledgeProfile.strengths || [];
      knowledgeObj.limitations = knowledgeProfile.limitations || [];
      knowledgeObj.preferred_collaborations = knowledgeProfile.preferred_collaborations || [];
      knowledgeObj.pricing_signals = knowledgeProfile.pricing_signals || {};
      knowledgeObj.availability_signals = knowledgeProfile.availability_signals || {};
    }

    // Apply answer
    const result = applyKnowledgeAnswer(knowledgeObj, question.target_field, b.answer, profileType);

    // Mark question answered
    await fetch(u + "/rest/v1/knowledge_completion_questions?id=eq." + b.questionId, {
      method: "PATCH", headers: h(),
      body: JSON.stringify({ answer: b.answer, confidence_after: result.overallConfidence, answered_at: new Date().toISOString() }),
    });

    // Persist to source knowledge profile
    const updatedFields: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (profileType === "business_knowledge") {
      // Map updatedKnowledge fields back to profile columns
      if (result.updatedKnowledge.goals !== knowledgeObj.goals) {
        updatedFields.goals = result.updatedKnowledge.goals;
      }
      if (result.updatedKnowledge.constraints !== knowledgeObj.constraints) {
        updatedFields.constraints = result.updatedKnowledge.constraints;
      }
      if (result.updatedKnowledge.market !== knowledgeObj.market) {
        updatedFields.market = result.updatedKnowledge.market;
      }
      if (result.updatedKnowledge.preferences !== knowledgeObj.preferences) {
        updatedFields.preferences = result.updatedKnowledge.preferences;
      }
      if (result.updatedKnowledge.business_identity !== knowledgeObj.business_identity) {
        updatedFields.business_identity = result.updatedKnowledge.business_identity;
      }
      if (result.updatedKnowledge.business_model !== knowledgeObj.business_model) {
        updatedFields.business_model = result.updatedKnowledge.business_model;
      }
      // Always update confidence
      updatedFields.knowledge_confidence = getConfidenceBreakdown(result.updatedKnowledge, profileType);
    } else {
      if (result.updatedKnowledge.capability_dna !== knowledgeObj.capability_dna) {
        updatedFields.capability_dna = result.updatedKnowledge.capability_dna;
      }
      if (result.updatedKnowledge.audience_dna !== knowledgeObj.audience_dna) {
        updatedFields.audience_dna = result.updatedKnowledge.audience_dna;
      }
      if (result.updatedKnowledge.evidence_summary !== knowledgeObj.evidence_summary) {
        updatedFields.evidence_summary = result.updatedKnowledge.evidence_summary;
      }
      if (result.updatedKnowledge.strengths !== knowledgeObj.strengths) {
        updatedFields.strengths = result.updatedKnowledge.strengths;
      }
      if (result.updatedKnowledge.limitations !== knowledgeObj.limitations) {
        updatedFields.limitations = result.updatedKnowledge.limitations;
      }
      if (result.updatedKnowledge.preferred_collaborations !== knowledgeObj.preferred_collaborations) {
        updatedFields.preferred_collaborations = result.updatedKnowledge.preferred_collaborations;
      }
      if (result.updatedKnowledge.pricing_signals !== knowledgeObj.pricing_signals) {
        updatedFields.pricing_signals = result.updatedKnowledge.pricing_signals;
      }
      if (result.updatedKnowledge.availability_signals !== knowledgeObj.availability_signals) {
        updatedFields.availability_signals = result.updatedKnowledge.availability_signals;
      }
      updatedFields.knowledge_confidence = getConfidenceBreakdown(result.updatedKnowledge, profileType);
    }

    // Write to profile
    await fetch(u + "/rest/v1/" + table + "?id=eq." + encodeURIComponent(profileId), {
      method: "PATCH", headers: h(), body: JSON.stringify(updatedFields),
    });

    // Save knowledge update record
    await fetch(u + "/rest/v1/knowledge_updates", {
      method: "POST", headers: { ...h(), "Prefer": "return=minimal" },
      body: JSON.stringify([{
        session_id: b.sessionId,
        knowledge_profile_id: profileId,
        updated_field: question.target_field,
        previous_value: JSON.stringify((knowledgeObj[question.target_field.replace(/_.*$/, "")] as Record<string, unknown> || {})),
        new_value: JSON.stringify(b.answer),
        source: "knowledge_completion",
      }]),
    });

    // Next question or completion
    const nextQuestion = result.isComplete ? null : generateNextQuestion(result.updatedKnowledge, profileType);
    let nextQuestionRecord = null;
    if (nextQuestion) {
      const nqr = await fetch(u + "/rest/v1/knowledge_completion_questions", {
        method: "POST", headers: { ...h(), "Prefer": "return=representation" },
        body: JSON.stringify([{ session_id: b.sessionId, target_field: nextQuestion.targetField, question: nextQuestion.question, reason: nextQuestion.reason, importance: nextQuestion.importance, confidence_before: result.overallConfidence }]),
      });
      if (nqr.ok) { const nqRows: DbKnowledgeCompletionQuestion[] = await nqr.json(); nextQuestionRecord = nqRows[0] || nqRows; }
    }

    // Update session
    await fetch(u + "/rest/v1/knowledge_completion_sessions?id=eq." + b.sessionId, {
      method: "PATCH", headers: h(),
      body: JSON.stringify({
        current_step: (session.current_step || 0) + 1,
        overall_confidence: result.overallConfidence,
        status: result.isComplete ? "completed" : "in_progress",
        completed_at: result.isComplete ? new Date().toISOString() : null,
      }),
    });

    return NextResponse.json({
      success: true,
      question: nextQuestionRecord,
      progress: {
        step: (session.current_step || 0) + 1,
        overall_confidence: result.overallConfidence,
        is_complete: result.isComplete,
      },
      updates_applied: Object.keys(updatedFields),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
