"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ExternalLink } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

const STATUSES = ["all", "draft", "under_review", "revised", "accepted", "rejected", "archived"];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-800 text-gray-400",
  under_review: "bg-yellow-900/30 text-yellow-400",
  revised: "bg-blue-900/30 text-blue-400",
  accepted: "bg-green-900/30 text-green-400",
  rejected: "bg-red-900/30 text-red-400",
  archived: "bg-gray-900/50 text-gray-600 line-through",
};

function confidenceLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "High", color: "text-green-400" };
  if (score >= 60) return { label: "Medium", color: "text-yellow-400" };
  return { label: "Low", color: "text-red-400" };
}

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/proposals")
      .then((r) => r.json())
      .then((d) => { setProposals(d.proposals || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? proposals.filter((p: any) => p.status !== "archived")
    : proposals.filter((p: any) => p.status === filter);

  if (loading) return (
    <div className="min-h-screen bg-black text-white">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Growth Proposals</h1>
            <p className="text-sm text-gray-500 mt-1">Structured growth plans bridging business intelligence and capability intelligence</p>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (
                filter === s
                  ? (s === "all" ? "bg-white/10 text-white ring-1 ring-white/20" : (STATUS_STYLES[s] || "bg-white/10 text-white") + " ring-1 ring-white/20")
                  : "bg-white/[0.03] text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]"
              )}
            >
              {s === "all" ? "All" : s.replace(/_/g, " ")}
              {s !== "all" && <span className="ml-1.5 text-gray-600">({proposals.filter((p: any) => p.status === s).length})</span>}
              {s === "all" && <span className="ml-1.5 text-gray-600">({proposals.filter((p: any) => p.status !== "archived").length})</span>}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12 text-center">
            <p className="text-gray-500">{filter === "all" ? "No proposals yet." : "No proposals with status: " + filter}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p: any) => {
              const conf = confidenceLabel(p.confidence_score || 0);
              return (
                <Link key={p.id} href={"/admin/proposals/" + p.id} className="block rounded-lg border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{p.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.goal}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                        <span className="text-gray-500">Business: <span className="text-gray-300">{p.business?.display_name || "?"}</span></span>
                        <span className="text-gray-500">Partner: <span className="text-gray-300">{p.capability?.display_name || "?"}</span></span>
                        {p.budget_min && <span className="text-gray-500">Budget: ${(+p.budget_min/1000).toFixed(0)}k-${(+p.budget_max/1000).toFixed(0)}k</span>}
                        <span className={"px-2 py-0.5 rounded-full text-xs " + (STATUS_STYLES[p.status] || "bg-gray-800 text-gray-400")}>{p.status}</span>
                        {p.confidence_score > 0 && (
                          <span className="text-gray-500">
                            Confidence: <span className={conf.color}>{conf.label} ({p.confidence_score}%)</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-600 ml-4 mt-1 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
