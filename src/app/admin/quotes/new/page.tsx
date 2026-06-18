"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, Check, FileText } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

function CreateQuoteForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [need, setNeed] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    matchId: sp?.get("matchId") || "",
    quoteTitle: "",
    quoteAmount: "",
    currency: "USD",
    timeline: "",
    deliverables: "",
    expectedGrowthOutcome: "",
    successMetrics: "",
    proposalMessage: "",
  });

  useEffect(() => {
    fetch("/api/admin/matches").then((r) => r.json()).then((d) => {
      if (d.success) setMatches(d.matches || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.matchId) {
      const m = matches.find((x: any) => x.id === form.matchId);
      setSelectedMatch(m);
      if (m?.company_growth_need_id) {
        fetch("/api/admin/growth-needs/" + m.company_growth_need_id).then((r) => r.json()).then((d) => { if (d.success) setNeed(d.need); });
      }
      if (m?.channel_id) {
        fetch("/api/admin/growth-channels/" + m.channel_id).then((r) => r.json()).then((d) => { if (d.success) setChannel(d.channel); });
      }
    }
  }, [form.matchId, matches]);

  function generateTemplate() {
    const goal = need?.growth_goal || "the company's growth goal";
    const solType = selectedMatch?.recommended_solution_type || "the solution type";
    const market = need?.target_market || "the target market";
    const reason = selectedMatch?.match_reason || "the match criteria";
    setForm((f) => ({
      ...f,
      proposalMessage: `Based on the company\u2019s growth goal of ${goal}, this solution focuses on ${solType} for ${market}.\n\nThe proposed channel can support this need through:\n- Deliverables placeholder\n- Growth outcome placeholder\n- Timeline placeholder\n\nExpected growth outcome:\nExpected outcome placeholder\n\nSuccess metrics may include:\nSuccess metrics placeholder\n\nGroIntel matched this option because:\n${reason}\n\nThis is an initial proposal draft for Admin review and should be confirmed with the growth channel before being shared with the company.`,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          matchId: form.matchId,
          channelId: selectedMatch?.channel_id || null,
          growthNeedId: selectedMatch?.company_growth_need_id || null,
          quoteAmount: form.quoteAmount ? Number(form.quoteAmount) : null,
          reportId: need?.report_id || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/quotes/" + data.quote.id), 1000);
      }
    } catch {}
    setSubmitting(false);
  }

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;
  if (success) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Check className="mx-auto h-10 w-10 text-emerald-400" /><p className="mt-3 text-sm text-white">Quote created!</p></div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav />
      <Link href="/admin/quotes" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6"><ArrowLeft className="h-3 w-3" /> Back</Link>
      <h1 className="text-xl font-bold text-white mb-6">Create Quote</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400">Match *</label>
          <select value={form.matchId} onChange={(e) => setForm({ ...form, matchId: e.target.value })} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
            <option value="">Select match</option>
            {matches.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.company_growth_need_id?.slice(0, 8)} + {m.channel_id?.slice(0, 8)} - {m.recommended_solution_type || "No type"}
              </option>
            ))}
          </select>
          {selectedMatch && (
            <p className="mt-1 text-[10px] text-gray-500">Match status: {selectedMatch.status} | Score: {selectedMatch.match_score}</p>
          )}
        </div>

        {need && (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[10px] text-gray-500 uppercase">Company Need</p>
            <p className="text-xs text-white">{need.company_name} - {need.growth_goal?.slice(0, 80)}</p>
          </div>
        )}

        {channel && (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[10px] text-gray-500 uppercase">Growth Channel</p>
            <p className="text-xs text-white">{channel.channel_name} - {channel.category} | Budget: {channel.currency} {channel.min_budget || "?"}-{channel.max_budget || "?"}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400">Quote Title *</label>
          <input value={form.quoteTitle} onChange={(e) => setForm({ ...form, quoteTitle: e.target.value })} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none"
            placeholder="e.g. APAC B2B Outbound Growth Sprint" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Amount</label>
            <input type="number" value={form.quoteAmount} onChange={(e) => setForm({ ...form, quoteAmount: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Currency</label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SGD">SGD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Timeline</label>
            <input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none"
              placeholder="e.g. 60-90 days" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Deliverables *</label>
          <textarea value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} rows={3} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Expected Growth Outcome *</label>
          <textarea value={form.expectedGrowthOutcome} onChange={(e) => setForm({ ...form, expectedGrowthOutcome: e.target.value })} rows={3} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Success Metrics</label>
          <textarea value={form.successMetrics} onChange={(e) => setForm({ ...form, successMetrics: e.target.value })} rows={2}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none resize-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-400">Proposal Message *</label>
            {selectedMatch && (
              <button type="button" onClick={generateTemplate}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"><FileText className="h-3 w-3" /> Generate Template</button>
            )}
          </div>
          <textarea value={form.proposalMessage} onChange={(e) => setForm({ ...form, proposalMessage: e.target.value })} rows={6} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none resize-none font-mono text-[11px]" />
        </div>

        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white disabled:opacity-50">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Quote"}
        </button>
      </form>
    </div>
  );
}

export default function CreateQuotePage() {
  return <Suspense fallback={<div className="p-8" />}><CreateQuoteForm /></Suspense>;
}
