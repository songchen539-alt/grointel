"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Plus, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/matches")
      .then((r) => r.json())
      .then((d) => { if (d.success) setMatches(d.matches || []); else setError(d.error || "Failed"); })
      .catch(() => setError("Table may not exist"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <AdminNav />
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <p className="mt-3 text-sm text-gray-400">Matches table is not ready. Please run the Phase 6.2 SQL migration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Growth Matches</h1><p className="text-xs text-gray-500 mt-1">Manual matching between company needs and growth channels.</p></div>
        <Link href="/admin/matches/new" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white"><Plus className="h-3.5 w-3.5" /> Create Match</Link>
      </div>
      {matches.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center"><p className="text-sm text-gray-500">No matches yet.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Need ID", "Channel ID", "Solution", "Score", "Status", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map((m: any) => (
                <tr key={m.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[10px] font-mono text-gray-400">{m.company_growth_need_id?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-[10px] font-mono text-gray-400">{m.channel_id?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{m.recommended_solution_type || "-"}</td>
                  <td className="px-4 py-3"><span className="text-xs font-bold text-blue-400">{m.match_score ?? "-"}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      m.status === "draft" ? "bg-gray-500/10 text-gray-400" :
                      m.status === "proposed_to_channel" ? "bg-blue-500/10 text-blue-300" :
                      m.status === "channel_interested" ? "bg-purple-500/10 text-purple-300" :
                      m.status === "quoted" ? "bg-amber-500/10 text-amber-300" :
                      m.status === "proposed_to_company" ? "bg-indigo-500/10 text-indigo-300" :
                      m.status === "company_interested" ? "bg-cyan-500/10 text-cyan-300" :
                      m.status === "intro_made" ? "bg-emerald-500/10 text-emerald-300" :
                      m.status === "won" ? "bg-green-500/10 text-green-300" :
                      m.status === "lost" ? "bg-red-500/10 text-red-300" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{m.created_at ? new Date(m.created_at).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3"><Link href={"/admin/matches/" + m.id} className="text-xs text-blue-400 hover:text-blue-300">View <ExternalLink className="h-3 w-3 inline" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
