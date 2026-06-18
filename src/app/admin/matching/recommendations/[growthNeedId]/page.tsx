"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, BrainCircuit, Sparkles, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function RecommendationDetailPage() {
  const params = useParams();
  const needId = params.growthNeedId as string;

  const [need, setNeed] = useState<any>(null);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!needId) return;
    Promise.all([
      fetch("/api/admin/growth-needs/" + needId).then((r) => r.json()),
      fetch("/api/admin/matching/recommend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ growthNeedId: needId }),
      }).then((r) => r.json()),
    ]).then(([nd, rd]) => {
      if (nd.success) setNeed(nd.need);
      if (rd.success) setRecs(rd.recommendations || []);
      else setError(rd.error || "Failed to load recommendations");
      setLoading(false);
    });
  }, [needId]);

  if (loading) return <div className="mx-auto max-w-5xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminNav />
      <Link href="/admin/matches/new" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back to Match Creation
      </Link>

      <h1 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-blue-400" /> AI Matching Analysis
      </h1>

      {need && (
        <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold text-white mb-2">{need.company_name}</h2>
          <div className="grid md:grid-cols-3 gap-3 text-xs text-gray-400">
            <div><span className="text-gray-500">Goal:</span> {need.growth_goal}</div>
            <div><span className="text-gray-500">Market:</span> {need.target_market || "-"}</div>
            <div><span className="text-gray-500">Budget:</span> {need.currency} {need.budget_min || "?"} - {need.budget_max || "?"}</div>
            <div><span className="text-gray-500">Challenge:</span> {need.current_challenge}</div>
            <div><span className="text-gray-500">Timeline:</span> {need.timeline || "-"}</div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {recs.length === 0 && !error ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-2 text-sm text-gray-500">No recommendations generated. Go back and click Generate AI Recommendations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec, idx) => (
            <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-400">#{idx + 1}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{rec.channelName}</h3>
                    {rec.serviceName && <p className="text-xs text-gray-500">{rec.serviceName}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-400">{rec.overallScore}</p>
                  <span className={"text-[10px] " + (rec.confidence === "High" ? "text-emerald-400" : rec.confidence === "Medium" ? "text-amber-400" : "text-gray-400")}>{rec.confidence}</span>
              <span className="text-[10px] text-gray-500 ml-2">Formula: Rule 80% + Semantic 20%</span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                {Object.entries(rec.featureScores || {}).map(([k, v]: [string, any]) => (
                  <div key={k} className="text-center">
                    <p className="text-[10px] text-gray-500 capitalize">{k}</p>
                    <p className={"text-sm font-bold " + (v >= 70 ? "text-emerald-400" : v >= 40 ? "text-amber-400" : "text-red-400")}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Reasons */}
              <div className="space-y-1">
                <div className="flex gap-4 mb-2">
                <div><span className="text-[10px] text-gray-500">Rule Score:</span> <span className="text-sm font-bold text-emerald-400">{rec.ruleScore ?? "?"}</span></div>
                <div><span className="text-[10px] text-gray-500">Semantic:</span> <span className="text-sm font-bold text-amber-400">{rec.embeddingScore ?? "?"}</span></div>
              </div>
              <p className="text-[10px] text-gray-500 uppercase">Reasons</p>
                {(rec.reasons || []).map((r: any, i: number) => (
                  <p key={i} className="text-xs text-gray-400 flex items-start gap-1">
                    <span className="text-blue-400 mt-0.5">&#x2022;</span> {r.message}
                  </p>
                ))}
              </div>

              <div className="mt-3">
                <p className="text-[10px] text-gray-500 uppercase">Match Reason</p>
                <p className="text-xs text-gray-300">{rec.matchReason}</p>
              </div>

              {rec.recommendedSolutionType && (
                <div className="mt-2">
                  <span className="text-[10px] text-gray-500">Solution:</span>
                  <span className="text-xs text-blue-300 ml-1">{rec.recommendedSolutionType}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
