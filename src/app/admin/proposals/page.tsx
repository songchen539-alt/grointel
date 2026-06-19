"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ExternalLink, Plus } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proposals")
      .then((r) => r.json())
      .then((d) => { setProposals(d.proposals || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Growth Proposals</h1>
            <p className="text-sm text-gray-500 mt-1">Structured growth plans bridging business intelligence and capability intelligence</p>
          </div>
        </div>

        {proposals.length === 0 ? (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12 text-center">
            <p className="text-gray-500">No proposals yet. Create your first proposal through the API or seed script.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((p: any) => (
              <Link key={p.id} href={"/admin/proposals/" + p.id} className="block rounded-lg border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.goal}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                      <span className="text-gray-500">Business: <span className="text-gray-300">{p.business?.display_name || "?"}</span></span>
                      <span className="text-gray-500">Partner: <span className="text-gray-300">{p.capability?.display_name || "?"}</span></span>
                      {p.budget_min && <span className="text-gray-500">Budget: ${(+p.budget_min/1000).toFixed(0)}k-${(+p.budget_max/1000).toFixed(0)}k</span>}
                      <span className={"px-2 py-0.5 rounded-full text-xs " + (
                        p.status === "draft" ? "bg-gray-800 text-gray-400" :
                        p.status === "active" ? "bg-green-900/30 text-green-400" :
                        "bg-blue-900/30 text-blue-400"
                      )}>{p.status}</span>
                      {p.confidence_score > 0 && (
                        <span className="text-gray-500">Confidence: <span className={p.confidence_score >= 70 ? "text-green-400" : p.confidence_score >= 50 ? "text-yellow-400" : "text-red-400"}>{p.confidence_score}%</span></span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-600 ml-4 mt-1 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
