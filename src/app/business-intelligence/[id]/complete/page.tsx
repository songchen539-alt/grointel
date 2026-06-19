"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Lightbulb } from "lucide-react";

export default function BusinessIntelligenceCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>({ step: 0, overall_confidence: 0, is_complete: false });
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);

  // Start session on mount
  useEffect(() => {
    if (!id || sessionId) return;
    setLoading(true);
    fetch("/api/knowledge/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileType: "business_knowledge", profileId: id }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSessionId(d.session.id);
          setQuestion(d.question);
          setProgress(d.progress || { step: 0, overall_confidence: d.session.overall_confidence, is_complete: d.session.status === "completed" });
          if (d.progress?.is_complete) setCompleted(true);
        } else {
          setError(d.error || "Failed to start");
        }
        setLoading(false);
      })
      .catch(() => { setError("Network error"); setLoading(false); });
  }, [id, sessionId]);

  const submitAnswer = async () => {
    if (!answer.trim() || !sessionId || !question) return;
    setSaving(true);
    setError("");

    const r = await fetch("/api/knowledge/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, questionId: question.id, answer: answer.trim() }),
    });
    const d = await r.json();

    if (d.success) {
      setQuestion(d.question);
      setProgress(d.progress);
      setAnswer("");
      if (d.progress?.is_complete) setCompleted(true);
    } else {
      setError(d.error || "Failed to save answer");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500 mx-auto mb-4" />
        <p className="text-sm text-gray-500">Preparing your knowledge interview...</p>
      </div>
    </div>
  );

  if (error && !sessionId) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href={"/business-intelligence/" + id} className="text-sm text-blue-400 hover:text-blue-300">Back to profile</Link>
      </div>
    </div>
  );

  if (completed) return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-xs text-gray-500 mb-6">
          <Lightbulb className="h-3.5 w-3.5 text-green-400" />
          Knowledge Complete
        </div>
        <h1 className="text-3xl font-bold mb-4">Business Understanding Complete</h1>
        <p className="text-gray-500 mb-6">
          Your business intelligence profile has been updated. Overall confidence: <span className="text-green-400 font-medium">{progress?.overall_confidence || 0}%</span>
        </p>
        <div className="mb-8">
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: Math.min(progress?.overall_confidence || 0, 100) + "%" }} />
          </div>
        </div>
        <Link href={"/business-intelligence/" + id} className="inline-block rounded-lg bg-white/10 px-6 py-3 text-sm text-white hover:bg-white/15 transition-colors">
          View Updated Profile
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-lg px-6 py-12">
        <Link href={"/business-intelligence/" + id} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-500">{progress?.overall_confidence || 0}% confidence</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: Math.min(progress?.overall_confidence || 0, 100) + "%" }} />
          </div>
        </div>

        {/* Question */}
        {question ? (
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3 py-1 text-xs text-gray-500 mb-6">
              Step {progress?.step || 1}
            </div>
            <h2 className="text-xl font-medium mb-6 leading-relaxed">{question.question}</h2>
            {question.reason && (
              <p className="text-xs text-gray-600 mb-6 italic">{question.reason}</p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
                disabled={saving}
                onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                autoFocus
              />
              <button
                onClick={submitAnswer}
                disabled={saving || !answer.trim()}
                className="rounded-lg bg-white/10 px-6 py-3 text-sm text-white hover:bg-white/15 transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
              </button>
            </div>
            {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No more questions needed. Your knowledge is sufficient.</p>
            <p className="text-sm text-green-400 mb-6">Confidence: {progress?.overall_confidence || 0}%</p>
            <Link href={"/business-intelligence/" + id} className="inline-block rounded-lg bg-white/10 px-6 py-3 text-sm text-white hover:bg-white/15 transition-colors">
              View Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
