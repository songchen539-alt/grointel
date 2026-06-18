"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, Check, BrainCircuit, Sparkles, ExternalLink } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

const SOLUTION_TYPES = [
  "LinkedIn Outbound", "B2B Lead Generation", "APAC Market Entry", "PR / Media Exposure",
  "Newsletter Sponsorship", "Web3 Ecosystem Launch", "RevOps Consulting", "Partnership Introduction",
  "SEO / Content Growth", "Paid Ads", "Community Growth", "Sales Agency",
];

function CreateMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [needs, setNeeds] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [channels, setChannels] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [services, setServices] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // AI Recommendations state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [aiError, setAiError] = useState("");
  const [aiDone, setAiDone] = useState(false);

  const [form, setForm] = useState({
    companyGrowthNeedId: searchParams?.get("growthNeedId") || "",
    channelId: searchParams?.get("channelId") || "",
    serviceId: "",
    matchScore: "70",
    recommendedSolutionType: "",
    matchReason: "",
    adminNotes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/growth-needs").then((r) => r.json()),
      fetch("/api/admin/growth-channels").then((r) => r.json()),
    ]).then(([nd, cd]) => {
      if (nd.success) setNeeds(nd.needs || []);
      if (cd.success) setChannels(cd.channels || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (form.channelId) {
      fetch("/api/admin/channels/" + form.channelId + "/services")
        .then((r) => r.json())
        .then((d) => { if (d.success) setServices(d.services || []); })
        .catch(() => {});
    }
  }, [form.channelId]);

  async function generateAIRecommendations() {
    if (!form.companyGrowthNeedId) return;
    setAiLoading(true);
    setAiError("");
    setAiRecs([]);
    try {
      const res = await fetch("/api/admin/matching/recommend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ growthNeedId: form.companyGrowthNeedId }),
      });
      const data = await res.json();
      if (data.success && data.recommendations) {
        setAiRecs(data.recommendations);
        setAiDone(true);
      } else {
        setAiError(data.error || "No recommendations generated");
      }
    } catch {
      setAiError("Failed to generate AI recommendations");
    }
    setAiLoading(false);
  }

  function applyRec(rec: any) {
    setForm({
      ...form,
      channelId: rec.channelId,
      serviceId: rec.serviceId || "",
      matchScore: String(rec.overallScore),
      recommendedSolutionType: rec.recommendedSolutionType || "",
      matchReason: rec.matchReason || (rec.reasons || []).map((r: any) => r.message).join(". "),
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/matches/" + data.match.id), 1000);
      }
    } catch {}
    setSubmitting(false);
  }

  function getConfidenceColor(c: string) {
    return c === "High" ? "text-emerald-400" : c === "Medium" ? "text-amber-400" : "text-gray-400";
  }

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;
  if (success) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Check className="mx-auto h-10 w-10 text-emerald-400" /><p className="mt-3 text-sm text-white">Match created! Redirecting...</p></div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav />
      <Link href="/admin/matches" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6"><ArrowLeft className="h-3 w-3" /> Back</Link>
      <h1 className="text-xl font-bold text-white mb-6">Create Match</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400">Company Growth Need *</label>
          <select value={form.companyGrowthNeedId} onChange={(e) => setForm({ ...form, companyGrowthNeedId: e.target.value })} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
            <option value="">Select need</option>
            {needs.map((n: any) => (
              <option key={n.id} value={n.id}>{n.company_name} - {n.growth_goal?.slice(0, 60)} ({n.currency || "USD"} {n.budget_min || "?"}-{n.budget_max || "?"})</option>
            ))}
          </select>
        </div>

        {/* AI Recommendations */}
        <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-blue-400" /> AI Recommendations</h2>
            {form.companyGrowthNeedId && (
              <button type="button" onClick={generateAIRecommendations} disabled={aiLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50">
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {aiLoading ? "Analyzing..." : "Generate AI Recommendations"}
              </button>
            )}
          </div>

          {aiError && <p className="text-xs text-red-400 mb-2">{aiError}</p>}

          {aiRecs.length > 0 && (
            <div className="space-y-2">
              {aiRecs.map((rec, idx) => (
                <div key={rec.channelId + (rec.serviceId || "")} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400 shrink-0">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{rec.channelName}</span>
                      {rec.serviceName && <span className="text-[10px] text-gray-500">- {rec.serviceName}</span>}
                      <span className={"text-xs font-bold ml-auto " + getConfidenceColor(rec.confidence)}>{rec.overallScore}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">Score: {rec.overallScore}</span>
                      <span className={"text-[10px] " + getConfidenceColor(rec.confidence)}>{rec.confidence}</span>
                      {rec.recommendedSolutionType && <span className="text-[10px] text-gray-500">| {rec.recommendedSolutionType}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(rec.featureScores || {}).filter(([k]) => k !== "history").map(([k, v]: [string, any]) => (
                        <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-500">{k}: {v}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                      {(rec.reasons || []).map((r: any) => r.message).join(". ")}
                    </p>
                  </div>
                  <button type="button" onClick={() => applyRec(rec)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 shrink-0">Use This</button>
                </div>
              ))}
              <Link href={"/admin/matching/recommendations/" + form.companyGrowthNeedId} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> View Full Analysis
              </Link>
            </div>
          )}

          {!form.companyGrowthNeedId && (
            <p className="text-xs text-gray-500">Select a growth need first, then generate AI recommendations.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Growth Channel *</label>
          <select value={form.channelId} onChange={(e) => setForm({ ...form, channelId: e.target.value })} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
            <option value="">Select channel</option>
            {channels.map((c: any) => (
              <option key={c.id} value={c.id}>{c.channel_name} - {c.category} ({c.region || "Global"})</option>
            ))}
          </select>
        </div>

        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-400">Channel Service (optional)</label>
            <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
              <option value="">No specific service</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>{s.service_name} ({s.service_type})</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Match Score (0-100)</label>
            <input type="number" min={0} max={100} value={form.matchScore} onChange={(e) => setForm({ ...form, matchScore: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Solution Type *</label>
            <select value={form.recommendedSolutionType} onChange={(e) => setForm({ ...form, recommendedSolutionType: e.target.value })} required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
              <option value="">Select type</option>
              {SOLUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Match Reason *</label>
          <textarea value={form.matchReason} onChange={(e) => setForm({ ...form, matchReason: e.target.value })} rows={3} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none resize-none"
            placeholder="Why is this channel a good fit?" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Admin Notes</label>
          <textarea value={form.adminNotes} onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} rows={2}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none resize-none" />
        </div>

        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white disabled:opacity-50">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Match"}
        </button>
      </form>
    </div>
  );
}

export default function CreateMatchPage() {
  return <Suspense fallback={<div className="p-8" />}><CreateMatchForm /></Suspense>;
}
