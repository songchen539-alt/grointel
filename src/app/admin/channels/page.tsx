"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/growth-channels")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setChannels(d.channels || []);
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
          <p className="mt-3 text-sm text-gray-400">Growth channels table is not ready. Please run the Phase 6.2 SQL migration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <div className="mb-6"><h1 className="text-xl font-bold text-white">Growth Channels</h1><p className="text-xs text-gray-500 mt-1">Growth supply database.</p></div>
      {channels.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center"><p className="text-sm text-gray-500">No channels yet.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Channel", "Category", "Region", "Services", "Budget", "Verification", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {channels.map((c: { id: string; channel_name: string; category: string; region: string; service_types: string[]; min_budget: number; max_budget: number; verification_status: string; status: string; created_at: string }) => (
                <tr key={c.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white">{c.channel_name}</td>
                  <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">{c.category}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{c.region || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[150px] truncate">{c.service_types ? (Array.isArray(c.service_types) ? c.service_types.join(", ") : c.service_types) : "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{c.min_budget || "?"}-{c.max_budget || "?"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      c.verification_status === "verified" ? "bg-emerald-500/10 text-emerald-300" :
                      c.verification_status === "pending" ? "bg-amber-500/10 text-amber-300" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>{c.verification_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      c.status === "active" ? "bg-emerald-500/10 text-emerald-300" :
                      c.status === "new" ? "bg-blue-500/10 text-blue-300" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3"><Link href={"/admin/channels/" + c.id} className="text-xs text-blue-400 hover:text-blue-300">View <ExternalLink className="h-3 w-3 inline" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
