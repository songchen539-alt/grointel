"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ExternalLink } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminCapabilityIntelligencePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/capability-intelligence")
      .then(r => r.json())
      .then(d => { setProfiles(d.profiles || []); setLoading(false); })
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Capability Intelligence</h1>
            <p className="text-sm text-gray-500 mt-1">Knowledge profiles from capability provider scans</p>
          </div>
          <Link href="/capability-intelligence" className="text-sm text-blue-400 hover:text-blue-300">New Scan</Link>
        </div>

        {profiles.length === 0 ? (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12 text-center">
            <p className="text-gray-500">No profiles yet. <Link href="/capability-intelligence" className="text-blue-400 hover:text-blue-300">Scan a capability provider</Link></p>
          </div>
        ) : (
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Profile</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Top Capabilities</th>
                  <th className="text-center px-4 py-3 font-medium">Confidence</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p: any) => {
                  const conf = p.knowledge_confidence?.overall || 0;
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white font-medium">{p.capability_identity?.name || "?"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">{p.profile_url}</td>
                      <td className="px-4 py-3 text-gray-400">{p.capability_identity?.type || "?"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">-</td>
                      <td className="px-4 py-3 text-center">
                        <span className={"text-xs font-mono " + (conf >= 70 ? "text-green-400" : conf >= 50 ? "text-yellow-400" : "text-red-400")}>{conf > 0 ? conf + "%" : "-"}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400">{p.knowledge_status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "?"}</td>
                      <td className="px-4 py-3">
                        <Link href={"/capability-intelligence/" + p.id} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
