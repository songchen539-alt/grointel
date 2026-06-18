"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Check, ArrowRight, Loader2, Send, Eye } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function writeEvent(rid: string, et: string, md: Record<string, unknown>) {
  try {
    await fetch("/api/reports/event", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: rid || "growth_marketplace", eventType: et, metadata: { ...md, timestamp: new Date().toISOString() } }),
    });
  } catch {}
}

interface Option {
  matchId: string;
  quoteId: string;
  solutionType: string;
  quoteTitle: string;
  amount: string;
  currency: string;
  timeline: string;
  deliverables: string;
  expectedOutcome: string;
  successMetrics: string;
  matchReason: string;
  status: string;
}

function ViewPage() {
  const sp = useSearchParams();
  const needId = sp?.get("needId") || "";
  const [need, setNeed] = useState<any>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [introing, setIntroing] = useState<string | null>(null);
  const [introDone, setIntroDone] = useState<string | null>(null);
  const [introError, setIntroError] = useState("");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!needId) { setLoading(false); return; } // eslint-disable-line react-hooks/set-state-in-effect

    // Fetch need + matches + quotes
    Promise.all([
      fetch("/api/admin/growth-needs/" + needId).then((r) => r.json()),
      fetch("/api/admin/matches").then((r) => r.json()),
      fetch("/api/admin/quotes").then((r) => r.json()),
    ]).then(([nr, mr, qr]) => {
      if (nr.success) setNeed(nr.need);
      if (mr.success && qr.success) {
        const needMatches = (mr.matches || []).filter((m: any) => m.company_growth_need_id === needId);
        const visibleStatuses = ["shared_with_company", "accepted"];
        const opts: Option[] = [];
        for (const m of needMatches) {
          const relatedQuotes = (qr.quotes || []).filter((q: any) => q.match_id === m.id && visibleStatuses.includes(q.status));
          for (const q of relatedQuotes) {
            opts.push({
              matchId: m.id,
              quoteId: q.id,
              solutionType: m.recommended_solution_type || "",
              quoteTitle: q.quote_title || "",
              amount: q.quote_amount ? `${q.currency || "USD"} ${q.quote_amount}` : "Custom pricing after review",
              currency: q.currency || "USD",
              timeline: q.timeline || "",
              deliverables: q.deliverables || "",
              expectedOutcome: q.expected_growth_outcome || "",
              successMetrics: q.success_metrics || "",
              matchReason: m.match_reason || "",
              status: q.status,
            });
          }
        }
        setOptions(opts);
      }
      setLoading(false);
    });

    writeEvent(needId || "growth_marketplace", "curated_options_viewed", { needId });
  }, [needId]);

  async function handleRequestIntro(opt: Option) {
    setIntroing(opt.quoteId);
    setIntroError("");
    try {
      const res = await fetch("/api/growth-options/request-intro", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needId, matchId: opt.matchId, quoteId: opt.quoteId }),
      });
      const data = await res.json();
      if (data.success) {
        setIntroDone(opt.quoteId);
        setOptions((prev) => prev.map((o) => o.quoteId === opt.quoteId ? { ...o, status: "accepted" } : o));
      } else {
        setIntroError(data.error || "We could not submit this request. Please contact GroIntel.");
      }
    } catch {
      setIntroError("We could not submit this request. Please contact GroIntel.");
    }
    setIntroing(null);
  }

  if (!needId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gray-600" />
        <p className="mt-3 text-sm text-gray-500">No growth need specified.</p>
      </div>
    );
  }

  if (loading) return <div className="mx-auto max-w-3xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-white">Your Curated Growth Solutions</h1>
      <p className="mt-2 text-sm text-gray-500">
        GroIntel reviewed your growth goals and prepared selected growth solution options. These options are curated and do not represent the full growth channel network.
      </p>

      {/* Privacy */}
      <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/[0.03] px-4 py-3 text-xs text-gray-400">
        GroIntel shows curated growth solution options based on your submitted growth goals and Company MRI. This is not a public marketplace listing. We only share selected options after review, and introductions are coordinated by GroIntel.
      </div>

      {/* Company Need Summary */}
      {need && (
        <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Your Growth Need</h2>
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div><span className="text-gray-500">Company:</span> <span className="text-white">{need.company_name}</span></div>
            <div><span className="text-gray-500">Website:</span> <span className="text-blue-400">{need.website}</span></div>
            <div className="md:col-span-2"><span className="text-gray-500">Goal:</span> <span className="text-gray-300">{need.growth_goal}</span></div>
            {need.target_market && <div><span className="text-gray-500">Target Market:</span> <span className="text-gray-300">{need.target_market}</span></div>}
            <div><span className="text-gray-500">Budget:</span> <span className="text-gray-300">{need.currency || "USD"} {need.budget_min || "?"} - {need.budget_max || "?"}</span></div>
            {need.timeline && <div><span className="text-gray-500">Timeline:</span> <span className="text-gray-300">{need.timeline}</span></div>}
          </div>
        </div>
      )}

      {/* Options */}
      {introError && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">{introError}</div>
      )}

      {options.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Eye className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-2 text-sm text-gray-500">No curated growth solutions are available yet. GroIntel will review your needs and share options soon.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {options.map((opt, idx) => (
            <div key={opt.quoteId} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Growth Option {idx + 1}</span>
                  <h3 className="text-lg font-semibold text-white mt-1">{opt.quoteTitle}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${opt.status === "accepted" ? "bg-emerald-500/10 text-emerald-300" : "bg-blue-500/10 text-blue-300"}`}>{opt.status}</span>
              </div>

              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Solution Type:</span> <span className="text-white">{opt.solutionType}</span></p>
                <p><span className="text-gray-500">Estimated Budget:</span> <span className="text-gray-300">{opt.amount}</span></p>
                {opt.timeline && <p><span className="text-gray-500">Timeline:</span> <span className="text-gray-300">{opt.timeline}</span></p>}
                {opt.deliverables && <p><span className="text-gray-500">Deliverables:</span> <span className="text-gray-300">{opt.deliverables}</span></p>}
                {opt.expectedOutcome && <p><span className="text-gray-500">Expected Outcome:</span> <span className="text-gray-300">{opt.expectedOutcome}</span></p>}
                {opt.successMetrics && <p><span className="text-gray-500">Success Metrics:</span> <span className="text-gray-300">{opt.successMetrics}</span></p>}
                {opt.matchReason && <p><span className="text-gray-500">Why GroIntel matched this:</span> <span className="text-gray-400">{opt.matchReason}</span></p>}
              </div>

              <div className="mt-4">
                {introDone === opt.quoteId ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <Check className="h-4 w-4" /> Introduction requested. GroIntel will coordinate the next step.
                  </div>
                ) : (
                  <button onClick={() => handleRequestIntro(opt)} disabled={introing === opt.quoteId}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50">
                    {introing === opt.quoteId ? <><Loader2 className="h-4 w-4 animate-spin" /> Requesting...</> : <><Send className="h-4 w-4" /> Request Introduction</>}
                  </button>
                )}
              </div>

              <p className="mt-2 text-[10px] text-gray-600">Channel partner information will be shared after GroIntel coordinates the introduction.</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-300">Back to Home</Link>
      </div>
    </div>
  );
}

export default function CuratedOptionsPage() {
  return <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-24" />}><ViewPage /></Suspense>;
}
