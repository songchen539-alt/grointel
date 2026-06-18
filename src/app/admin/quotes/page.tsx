"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Plus, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/quotes")
      .then((r) => r.json())
      .then((d) => { if (d.success) setQuotes(d.quotes || []); else setError(d.error || "Failed"); })
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
          <p className="mt-3 text-sm text-gray-400">Quotes table is not ready. Please run the Phase 6.2 SQL migration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Growth Quotes</h1><p className="text-xs text-gray-500 mt-1">Admin-managed quotes and proposals.</p></div>
        <Link href="/admin/quotes/new" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white"><Plus className="h-3.5 w-3.5" /> Create Quote</Link>
      </div>
      {quotes.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center"><p className="text-sm text-gray-500">No quotes yet.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Title", "Amount", "Timeline", "Status", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map((q: any) => (
                <tr key={q.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white">{q.quote_title}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{q.currency || "USD"} {q.quote_amount ?? "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{q.timeline || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      q.status === "draft" ? "bg-gray-500/10 text-gray-400" :
                      q.status === "submitted" ? "bg-blue-500/10 text-blue-300" :
                      q.status === "reviewed" ? "bg-purple-500/10 text-purple-300" :
                      q.status === "shared_with_company" ? "bg-amber-500/10 text-amber-300" :
                      q.status === "accepted" ? "bg-emerald-500/10 text-emerald-300" :
                      q.status === "rejected" ? "bg-red-500/10 text-red-300" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{q.created_at ? new Date(q.created_at).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2">
                      <Link href={"/admin/quotes/" + q.id} className="text-xs text-blue-400 hover:text-blue-300">View <ExternalLink className="h-3 w-3 inline" /></Link>
                      {(q.status === "shared_with_company" || q.status === "accepted") && q.company_growth_need_id && (
                        <Link href={"/growth-options/view?needId=" + q.company_growth_need_id} className="text-[10px] text-emerald-400 hover:text-emerald-300">Company View</Link>
                      )}
                    </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
