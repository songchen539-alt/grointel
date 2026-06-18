"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminGrowthNeedsPage() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/growth-needs")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setNeeds(d.needs || []);
        else setError(d.error || "Failed");
      })
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
          <p className="mt-3 text-sm text-gray-400">Growth needs table is not ready. Please run the Phase 6.2 SQL migration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <div className="mb-6"><h1 className="text-xl font-bold text-white">Growth Needs</h1><p className="text-xs text-gray-500 mt-1">Company-submitted growth needs.</p></div>
      {needs.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center"><p className="text-sm text-gray-500">No submissions yet.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Company", "Goal", "Email", "Budget", "Timeline", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {needs.map((n: { id: string; company_name: string; growth_goal: string; contact_email: string; budget_min: number; budget_max: number; currency: string; timeline: string; status: string; created_at: string }) => (
                <tr key={n.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white">{n.company_name}</td>
                  <td className="px-4 py-3 text-xs text-gray-300 max-w-[200px] truncate">{n.growth_goal}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{n.contact_email}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{n.budget_min || "-"} - {n.budget_max || "-"} {n.currency || ""}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{n.timeline || "-"}</td>
                  <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300">{n.status}</span></td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{n.created_at ? new Date(n.created_at).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3"><Link href={"/admin/growth-needs/" + n.id} className="text-xs text-blue-400 hover:text-blue-300">View <ExternalLink className="h-3 w-3 inline" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
